# backend/apps/authentication/middleware.py
from django.contrib.auth.models import AnonymousUser
from django.utils.deprecation import MiddlewareMixin
from django.utils import timezone
from rest_framework_simplejwt.tokens import UntypedToken, RefreshToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.request import Request
from django.contrib.auth.models import User
from .utils import get_user_from_token, is_token_expired, set_auth_cookies, clear_auth_cookies
import logging

logger = logging.getLogger(__name__)


class CookieJWTAuthenticationMiddleware(MiddlewareMixin):
    """
    Middleware to handle JWT authentication via HttpOnly cookies.
    This middleware extracts JWT tokens from cookies and makes them available
    for Django REST Framework authentication.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        super().__init__(get_response)
    
    def process_request(self, request):
        """Extract JWT tokens from cookies and set them for DRF authentication"""
        access_token = request.COOKIES.get('access_token')
        refresh_token = request.COOKIES.get('refresh_token')
        
        # If we have an access token, try to authenticate
        if access_token:
            user = self.authenticate_with_token(access_token)
            if user:
                request.user = user
                # Set the token in META for DRF authentication
                request.META['HTTP_AUTHORIZATION'] = f'Bearer {access_token}'
                return None
        
        # If access token is invalid/expired but we have refresh token, try to refresh
        if refresh_token and not access_token:
            new_tokens = self.refresh_access_token(refresh_token)
            if new_tokens:
                access_token, new_refresh_token = new_tokens
                user = self.authenticate_with_token(access_token)
                if user:
                    request.user = user
                    request.META['HTTP_AUTHORIZATION'] = f'Bearer {access_token}'
                    # Store new tokens to be set in response
                    request._new_auth_tokens = (access_token, new_refresh_token)
                    return None
        
        # If no valid tokens, user remains anonymous
        request.user = AnonymousUser()
        return None
    
    def process_response(self, request, response):
        """Set new tokens in cookies if they were refreshed"""
        if hasattr(request, '_new_auth_tokens'):
            access_token, refresh_token = request._new_auth_tokens
            set_auth_cookies(response, access_token, refresh_token)
        
        return response
    
    def authenticate_with_token(self, token):
        """Authenticate user with JWT token"""
        try:
            # Validate token first
            UntypedToken(token)
            
            # Get user from token
            user = get_user_from_token(token)
            if user and user.is_active:
                # Update last activity if profile exists
                if hasattr(user, 'profile'):
                    user.profile.last_activity = timezone.now()
                    user.profile.save(update_fields=['last_activity'])
                
                return user
        except (InvalidToken, TokenError, User.DoesNotExist):
            logger.debug("Invalid or expired access token")
        
        return None
    
    def refresh_access_token(self, refresh_token):
        """Refresh access token using refresh token"""
        try:
            # Validate and use refresh token
            refresh = RefreshToken(refresh_token)
            
            # Generate new access token
            new_access_token = str(refresh.access_token)
            
            # Optionally rotate refresh token (recommended for security)
            new_refresh_token = str(refresh)
            
            logger.debug("Access token refreshed successfully")
            return new_access_token, new_refresh_token
            
        except (InvalidToken, TokenError):
            logger.debug("Invalid or expired refresh token")
            return None


class UserActivityMiddleware(MiddlewareMixin):
    """
    Middleware to track user activity and update last_activity timestamp
    """
    
    def process_response(self, request, response):
        """Update user activity on successful requests"""
        if (hasattr(request, 'user') and 
            request.user.is_authenticated and 
            hasattr(request.user, 'profile') and
            response.status_code < 400):
            
            # Update last activity (but don't do it on every request to avoid DB load)
            last_activity = request.user.profile.last_activity
            if not last_activity or (timezone.now() - last_activity).seconds > 300:  # 5 minutes
                request.user.profile.last_activity = timezone.now()
                request.user.profile.save(update_fields=['last_activity'])
        
        return response


class SecurityHeadersMiddleware(MiddlewareMixin):
    """
    Middleware to add security headers for authentication endpoints
    """
    
    def process_response(self, request, response):
        """Add security headers"""
        # Add security headers for auth endpoints
        if request.path.startswith('/api/auth/'):
            # Prevent caching of auth responses
            response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            response['Pragma'] = 'no-cache'
            response['Expires'] = '0'
            
            # Add CSRF protection headers
            response['X-Content-Type-Options'] = 'nosniff'
            response['X-Frame-Options'] = 'DENY'
            response['X-XSS-Protection'] = '1; mode=block'
        
        return response


class TokenCleanupMiddleware(MiddlewareMixin):
    """
    Middleware to clean up invalid tokens from cookies
    """
    
    def process_response(self, request, response):
        """Clean up invalid tokens"""
        access_token = request.COOKIES.get('access_token')
        refresh_token = request.COOKIES.get('refresh_token')
        
        # If we have tokens but user is not authenticated, clear the cookies
        if (access_token or refresh_token) and not request.user.is_authenticated:
            clear_auth_cookies(response)
        
        # If access token is expired and refresh failed, clear cookies
        if access_token and is_token_expired(access_token) and not refresh_token:
            clear_auth_cookies(response)
        
        return response


class RateLimitingMiddleware(MiddlewareMixin):
    """
    Simple rate limiting middleware for authentication endpoints
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.rate_limit_cache = {}
        super().__init__(get_response)
    
    def process_request(self, request):
        """Apply rate limiting to auth endpoints"""
        if not request.path.startswith('/api/auth/'):
            return None
        
        # Get client IP
        from .utils import get_client_ip
        client_ip = get_client_ip(request)
        
        # Rate limit login attempts
        if request.path == '/api/auth/login/' and request.method == 'POST':
            return self.check_rate_limit(client_ip, 'login', max_attempts=5, window=300)  # 5 attempts per 5 minutes
        
        # Rate limit registration
        if request.path == '/api/auth/register/' and request.method == 'POST':
            return self.check_rate_limit(client_ip, 'register', max_attempts=3, window=3600)  # 3 attempts per hour
        
        return None
    
    def check_rate_limit(self, client_ip, action, max_attempts, window):
        """Check if rate limit is exceeded"""
        from django.http import JsonResponse
        
        key = f"{client_ip}_{action}"
        now = timezone.now().timestamp()
        
        if key not in self.rate_limit_cache:
            self.rate_limit_cache[key] = []
        
        # Clean old attempts
        self.rate_limit_cache[key] = [
            timestamp for timestamp in self.rate_limit_cache[key] 
            if now - timestamp < window
        ]
        
        # Check if limit exceeded
        if len(self.rate_limit_cache[key]) >= max_attempts:
            return JsonResponse({
                'error': f'Rate limit exceeded. Try again later.',
                'retry_after': window
            }, status=429)
        
        # Add current attempt
        self.rate_limit_cache[key].append(now)
        
        return None


class CSRFCookieMiddleware(MiddlewareMixin):
    """
    Middleware to ensure CSRF cookie is set for authenticated requests
    """
    
    def process_response(self, request, response):
        """Set CSRF cookie for authenticated users"""
        if (hasattr(request, 'user') and 
            request.user.is_authenticated and 
            request.path.startswith('/api/')):
            
            # Ensure CSRF cookie is set
            from django.middleware.csrf import get_token
            get_token(request)
        
        return response