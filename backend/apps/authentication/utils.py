# backend/apps/authentication/utils.py
from django.conf import settings
from django.utils import timezone
from rest_framework_simplejwt.settings import api_settings
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth.models import User
import jwt


def get_client_ip(request):
    """Get client IP address from request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def log_user_action(user, action, model_name='User', object_id=None, object_repr='', changes=None, request=None):
    """Log user action for audit purposes"""
    from .models import AuditLog
    
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


def set_auth_cookies(response, access_token, refresh_token):
    """Set authentication cookies on response"""
    # Access token cookie (shorter expiry)
    response.set_cookie(
        'access_token',
        access_token,
        max_age=int(api_settings.ACCESS_TOKEN_LIFETIME.total_seconds()),
        httponly=True,
        secure=not settings.DEBUG,  # True in production (HTTPS)
        samesite='Lax',
        domain=getattr(settings, 'COOKIE_DOMAIN', None)
    )
    
    # Refresh token cookie (longer expiry)
    response.set_cookie(
        'refresh_token',
        refresh_token,
        max_age=int(api_settings.REFRESH_TOKEN_LIFETIME.total_seconds()),
        httponly=True,
        secure=not settings.DEBUG,  # True in production (HTTPS)
        samesite='Lax',
        domain=getattr(settings, 'COOKIE_DOMAIN', None)
    )


def clear_auth_cookies(response):
    """Clear authentication cookies from response"""
    response.delete_cookie(
        'access_token',
        domain=getattr(settings, 'COOKIE_DOMAIN', None),
        samesite='Lax'
    )
    response.delete_cookie(
        'refresh_token',
        domain=getattr(settings, 'COOKIE_DOMAIN', None),
        samesite='Lax'
    )


def get_user_from_token(token):
    """Get user from JWT token"""
    try:
        # Validate token
        UntypedToken(token)
        
        # Decode token to get user_id
        decoded_token = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=['HS256']
        )
        
        user_id = decoded_token.get('user_id')
        if user_id:
            return User.objects.get(id=user_id)
        
    except (InvalidToken, TokenError, User.DoesNotExist, jwt.InvalidTokenError):
        pass
    
    return None


def is_token_expired(token):
    """Check if JWT token is expired"""
    try:
        UntypedToken(token)
        return False
    except (InvalidToken, TokenError):
        return True


def get_token_expiry(token):
    """Get expiry time from JWT token"""
    try:
        decoded_token = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=['HS256']
        )
        exp_timestamp = decoded_token.get('exp')
        if exp_timestamp:
            return timezone.datetime.fromtimestamp(exp_timestamp, tz=timezone.utc)
    except (jwt.InvalidTokenError, KeyError):
        pass
    
    return None


def validate_password_strength(password):
    """Validate password strength beyond Django's default validation"""
    errors = []
    
    if len(password) < 8:
        errors.append("Password must be at least 8 characters long.")
    
    if not any(c.isupper() for c in password):
        errors.append("Password must contain at least one uppercase letter.")
    
    if not any(c.islower() for c in password):
        errors.append("Password must contain at least one lowercase letter.")
    
    if not any(c.isdigit() for c in password):
        errors.append("Password must contain at least one digit.")
    
    special_chars = "!@#$%^&*()_+-=[]{}|;:,.<>?"
    if not any(c in special_chars for c in password):
        errors.append("Password must contain at least one special character.")
    
    return errors


def check_rate_limiting(user, action='login'):
    """Check if user has exceeded rate limits for specific actions"""
    if not hasattr(user, 'profile'):
        return False
    
    profile = user.profile
    
    # Check account lockout
    if profile.account_locked_until and profile.account_locked_until > timezone.now():
        return True
    
    # Check failed login attempts
    if action == 'login' and profile.failed_login_attempts >= 5:
        # Lock account for 30 minutes after 5 failed attempts
        profile.account_locked_until = timezone.now() + timezone.timedelta(minutes=30)
        profile.save()
        return True
    
    return False


def sanitize_user_agent(user_agent):
    """Sanitize user agent string for logging"""
    if not user_agent:
        return ''
    
    # Truncate long user agent strings
    max_length = 500
    if len(user_agent) > max_length:
        user_agent = user_agent[:max_length] + '...'
    
    return user_agent


def format_audit_message(action, model_name, object_repr, changes=None):
    """Format audit log message"""
    message = f"{action} {model_name}"
    
    if object_repr:
        message += f": {object_repr}"
    
    if changes and isinstance(changes, dict):
        if 'old' in changes and 'new' in changes:
            message += " (Updated)"
        elif changes:
            message += f" ({', '.join(changes.keys())})"
    
    return message


def generate_session_data(user, request=None):
    """Generate session data for user"""
    session_data = {
        'user_id': user.id,
        'username': user.username,
        'login_time': timezone.now().isoformat(),
        'ip_address': get_client_ip(request) if request else None,
        'user_agent': sanitize_user_agent(
            request.META.get('HTTP_USER_AGENT', '') if request else ''
        )
    }
    
    return session_data


def cleanup_expired_tokens():
    """Cleanup expired tokens and sessions (for management command)"""
    from .models import AuditLog
    
    # Clean up old audit logs (keep last 6 months)
    six_months_ago = timezone.now() - timezone.timedelta(days=180)
    old_logs = AuditLog.objects.filter(timestamp__lt=six_months_ago)
    deleted_count = old_logs.count()
    old_logs.delete()
    
    return deleted_count