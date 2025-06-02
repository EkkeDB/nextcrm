# backend/apps/authentication/views.py
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken, UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.views import TokenRefreshView
from django.contrib.auth import login, logout, authenticate
from django.utils import timezone
from django.contrib.auth.models import update_last_login, User
from django.conf import settings
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import jwt
from datetime import datetime, timedelta

from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, 
    UserProfileSerializer, ChangePasswordSerializer, GDPRConsentSerializer
)
from .models import UserProfile, AuditLog, GDPRRecord
from .utils import get_client_ip, log_user_action, set_auth_cookies, clear_auth_cookies

# ==================== AUTHENTICATION ENDPOINTS ====================

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register(request):
    """User registration endpoint with HttpOnly cookie authentication"""
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        
        # Set GDPR consent date
        if hasattr(user, 'profile'):
            user.profile.gdpr_consent_date = timezone.now()
            user.profile.save()
        
        # Create GDPR record
        GDPRRecord.objects.create(
            user=user,
            consent_type='registration',
            consent_given=True,
            ip_address=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        # Log registration
        log_user_action(user, 'REGISTER', 'User', user.id, str(user), request=request)
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        # Create response
        response = Response({
            'message': 'User registered successfully',
            'user': UserProfileSerializer(user).data,
            'csrf_token': get_token(request)
        }, status=status.HTTP_201_CREATED)
        
        # Set HttpOnly cookies
        set_auth_cookies(response, str(refresh.access_token), str(refresh))
        
        return response
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    """User login endpoint with HttpOnly cookie authentication"""
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        # Update last login and activity
        update_last_login(None, user)
        if hasattr(user, 'profile'):
            user.profile.last_activity = timezone.now()
            user.profile.last_login_ip = get_client_ip(request)
            user.profile.failed_login_attempts = 0
            user.profile.save()
        
        # Log login
        log_user_action(user, 'LOGIN', 'User', user.id, str(user), request=request)
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        # Create response
        response = Response({
            'message': 'Login successful',
            'user': UserProfileSerializer(user).data,
            'csrf_token': get_token(request)
        }, status=status.HTTP_200_OK)
        
        # Set HttpOnly cookies
        set_auth_cookies(response, str(refresh.access_token), str(refresh))
        
        return response
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    """User logout endpoint - clears HttpOnly cookies"""
    try:
        # Get refresh token from cookie
        refresh_token = request.COOKIES.get('refresh_token')
        
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except (InvalidToken, TokenError):
                pass  # Token already invalid/expired
        
        # Log logout
        log_user_action(request.user, 'LOGOUT', 'User', request.user.id, str(request.user), request=request)
        
        # Create response
        response = Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)
        
        # Clear HttpOnly cookies
        clear_auth_cookies(response)
        
        return response
        
    except Exception as e:
        # Even if there's an error, clear cookies and logout
        response = Response({'message': 'Logout completed'}, status=status.HTTP_200_OK)
        clear_auth_cookies(response)
        return response

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def refresh_token_view(request):
    """Refresh access token using refresh token from HttpOnly cookie"""
    refresh_token = request.COOKIES.get('refresh_token')
    
    if not refresh_token:
        return Response({'error': 'Refresh token not found'}, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        # Validate refresh token
        token = RefreshToken(refresh_token)
        
        # Get user from token
        user_id = token.payload.get('user_id')
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Generate new tokens
        new_refresh = RefreshToken.for_user(user)
        
        # Log token refresh
        log_user_action(user, 'TOKEN_REFRESH', 'User', user.id, str(user), request=request)
        
        # Create response
        response = Response({
            'message': 'Token refreshed successfully',
            'csrf_token': get_token(request)
        }, status=status.HTTP_200_OK)
        
        # Set new HttpOnly cookies
        set_auth_cookies(response, str(new_refresh.access_token), str(new_refresh))
        
        return response
        
    except (InvalidToken, TokenError) as e:
        response = Response({'error': 'Invalid refresh token'}, status=status.HTTP_401_UNAUTHORIZED)
        clear_auth_cookies(response)
        return response

# ==================== USER MANAGEMENT ENDPOINTS ====================

@api_view(['GET', 'PUT'])
@permission_classes([permissions.IsAuthenticated])
def profile_view(request):
    """User profile endpoint"""
    if request.method == 'GET':
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            old_data = UserProfileSerializer(request.user).data
            user = serializer.save()
            
            # Log profile update
            log_user_action(
                request.user, 'UPDATE', 'UserProfile', 
                user.profile.id if hasattr(user, 'profile') else user.id, 
                str(user), 
                changes={'old': old_data, 'new': serializer.data}, 
                request=request
            )
            
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def change_password(request):
    """Change user password"""
    serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        # Log password change
        log_user_action(user, 'PASSWORD_CHANGE', 'User', user.id, str(user), request=request)
        
        # Generate new tokens (invalidate old ones)
        refresh = RefreshToken.for_user(user)
        
        response = Response({'message': 'Password changed successfully'}, status=status.HTTP_200_OK)
        
        # Set new HttpOnly cookies
        set_auth_cookies(response, str(refresh.access_token), str(refresh))
        
        return response
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_permissions(request):
    """Get user permissions and roles"""
    user = request.user
    permissions_data = {
        'user_id': user.id,
        'username': user.username,
        'is_staff': user.is_staff,
        'is_superuser': user.is_superuser,
        'groups': [group.name for group in user.groups.all()],
        'permissions': [perm.codename for perm in user.user_permissions.all()],
    }
    return Response(permissions_data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def check_auth_status(request):
    """Check authentication status - useful for frontend auth checks"""
    return Response({
        'authenticated': True,
        'user': UserProfileSerializer(request.user).data,
        'csrf_token': get_token(request)
    })

# ==================== GDPR COMPLIANCE ENDPOINTS ====================

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def gdpr_consent(request):
    """Update GDPR consent"""
    serializer = GDPRConsentSerializer(data=request.data)
    if serializer.is_valid():
        consent_record, created = GDPRRecord.objects.get_or_create(
            user=request.user,
            consent_type=serializer.validated_data['consent_type'],
            defaults={
                'consent_given': serializer.validated_data['consent_given'],
                'ip_address': get_client_ip(request),
                'user_agent': request.META.get('HTTP_USER_AGENT', '')
            }
        )
        
        if not created:
            consent_record.consent_given = serializer.validated_data['consent_given']
            consent_record.consent_date = timezone.now()
            consent_record.save()
        
        # Log GDPR consent change
        log_user_action(
            request.user, 'GDPR_CONSENT', 'GDPRRecord', 
            consent_record.id, str(consent_record), request=request
        )
        
        return Response({'message': 'GDPR consent updated successfully'}, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def export_user_data(request):
    """Export user data for GDPR compliance"""
    user = request.user
    
    # Collect all user data
    user_data = {
        'profile': UserProfileSerializer(user).data,
        'gdpr_records': [
            {
                'consent_type': record.consent_type,
                'consent_given': record.consent_given,
                'consent_date': record.consent_date
            } for record in user.gdprrecord_set.all()
        ],
        'audit_logs': [
            {
                'action': log.action,
                'timestamp': log.timestamp,
                'model_name': log.model_name
            } for log in user.auditlog_set.all()[:100]  # Last 100 actions
        ]
    }
    
    # Log data export
    log_user_action(user, 'DATA_EXPORT', 'User', user.id, str(user), request=request)
    
    return Response({
        'message': 'User data exported successfully',
        'data': user_data,
        'export_date': timezone.now()
    })

# ==================== UTILITY ENDPOINTS ====================

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def csrf_token_view(request):
    """Get CSRF token for frontend"""
    return Response({'csrf_token': get_token(request)})

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def auth_root(request):
    """Auth root endpoint"""
    return Response({
        'message': 'NextCRM Authentication API',
        'version': '1.0.0',
        'endpoints': {
            'register': '/api/auth/register/',
            'login': '/api/auth/login/',
            'logout': '/api/auth/logout/',
            'refresh': '/api/auth/refresh/',
            'profile': '/api/auth/profile/',
            'check_status': '/api/auth/status/',
            'csrf_token': '/api/auth/csrf/',
        }
    })

# ==================== CUSTOM TOKEN REFRESH VIEW ====================

class CustomTokenRefreshView(TokenRefreshView):
    """Custom token refresh view that works with HttpOnly cookies"""
    
    def post(self, request, *args, **kwargs):
        # Get refresh token from cookie instead of request body
        refresh_token = request.COOKIES.get('refresh_token')
        
        if not refresh_token:
            return Response({'error': 'Refresh token not found'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Add refresh token to request data for parent class
        request.data['refresh'] = refresh_token
        
        # Call parent method
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            # Get new tokens from response
            data = response.data
            access_token = data.get('access')
            
            # If we have a new refresh token, use it, otherwise keep the old one
            new_refresh_token = data.get('refresh', refresh_token)
            
            # Set new cookies
            set_auth_cookies(response, access_token, new_refresh_token)
            
            # Remove tokens from response body for security
            response.data = {'message': 'Token refreshed successfully'}
            
            # Log token refresh if user is available
            if hasattr(request, 'user') and request.user.is_authenticated:
                log_user_action(request.user, 'TOKEN_REFRESH', 'User', request.user.id, str(request.user), request=request)
        
        return response