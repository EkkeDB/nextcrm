# apps/authentication/middleware.py
from django.utils.deprecation import MiddlewareMixin
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth.models import AnonymousUser

class CookieJWTAuthentication(JWTAuthentication):
    """
    Custom JWT authentication that reads tokens from HttpOnly cookies
    """
    def get_raw_token(self, request):
        """
        Extract JWT token from HttpOnly cookie instead of Authorization header
        """
        raw_token = request.COOKIES.get('access_token')
        return raw_token.encode('utf-8') if raw_token else None

class JWTCookieMiddleware(MiddlewareMixin):
    """
    Middleware to handle JWT authentication from cookies for DRF views
    """
    def process_request(self, request):
        # Skip for non-API requests
        if not request.path.startswith('/api/'):
            return None
            
        # Skip for auth endpoints that don't need authentication
        auth_endpoints = ['/api/auth/login/', '/api/auth/register/', '/api/health/']
        if any(request.path.startswith(endpoint) for endpoint in auth_endpoints):
            return None
        
        # Try to authenticate using cookie
        auth = CookieJWTAuthentication()
        try:
            user_auth_tuple = auth.authenticate(request)
            if user_auth_tuple is not None:
                request.user, request.auth = user_auth_tuple
            else:
                request.user = AnonymousUser()
        except (InvalidToken, TokenError):
            request.user = AnonymousUser()
        
        return None