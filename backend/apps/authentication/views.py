# apps/authentication/views.py
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from django.contrib.auth import login, logout
from django.utils import timezone
from django.contrib.auth.models import update_last_login
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, 
    UserProfileSerializer, ChangePasswordSerializer, GDPRConsentSerializer
)
from .models import User, AuditLog, GDPRRecord

def get_client_ip(request):
    """Get client IP address"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

def log_user_action(user, action, model_name='User', object_id=None, object_repr='', changes=None, request=None):
    """Log user action for audit"""
    AuditLog.objects.create(
        user=user,
        action=action,
        model_name=model_name,
        object_id=object_id,
        object_repr=object_repr,
        changes=changes or {},
        ip_address=get_client_ip(request) if request else None,
        user_agent=request.META.get('HTTP_USER_AGENT', '') if request else ''
    )

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register(request):
    """User registration endpoint"""
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        
        # Set GDPR consent date
        user.gdpr_consent_date = timezone.now()
        user.save()
        
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
        
        return Response({
            'message': 'User registered successfully',
            'user': UserProfileSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    """User login endpoint"""
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        # Update last login and activity
        update_last_login(None, user)
        user.last_activity = timezone.now()
        user.last_login_ip = get_client_ip(request)
        user.failed_login_attempts = 0
        user.save()
        
        # Log login
        log_user_action(user, 'LOGIN', 'User', user.id, str(user), request=request)
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'Login successful',
            'user': UserProfileSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    """User logout endpoint"""
    try:
        refresh_token = request.data.get("refresh_token")
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        
        # Log logout
        log_user_action(request.user, 'LOGOUT', 'User', request.user.id, str(request.user), request=request)
        
        return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT'])
@permission_classes([permissions.IsAuthenticated])
def profile_view(request):
    """User profile endpoint"""
    profile, created = UserProfile.objects.get_or_create(user=request.user)
    
    if request.method == 'GET':
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            old_data = UserProfileSerializer(profile).data
            profile = serializer.save()
            
            # Log profile update
            log_user_action(
                request.user, 'UPDATE', 'UserProfile', profile.id, str(profile), 
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
        
        return Response({'message': 'Password changed successfully'}, status=status.HTTP_200_OK)
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

# Custom Token Refresh View with logging
class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200 and request.user.is_authenticated:
            log_user_action(request.user, 'TOKEN_REFRESH', 'User', request.user.id, str(request.user), request=request)
        return response