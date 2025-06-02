# apps/authentication/serializers.py
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.utils import timezone
from .models import UserProfile, GDPRRecord

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    gdpr_consent = serializers.BooleanField()
    
    # Profile fields
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    company = serializers.CharField(max_length=100, required=False, allow_blank=True)
    position = serializers.CharField(max_length=100, required=False, allow_blank=True)
    marketing_consent = serializers.BooleanField(required=False, default=False)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'first_name', 'last_name', 
            'password', 'password_confirm', 'gdpr_consent', 
            'phone', 'company', 'position', 'marketing_consent'
        ]
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email already exists.")
        return value
    
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists.")
        return value
    
    def validate_gdpr_consent(self, value):
        if not value:
            raise serializers.ValidationError("GDPR consent is required.")
        return value
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords do not match.")
        
        try:
            validate_password(attrs['password'])
        except ValidationError as e:
            raise serializers.ValidationError({"password": e.messages})
        
        return attrs
    
    def create(self, validated_data):
        # Extract profile fields
        profile_fields = {
            'phone': validated_data.pop('phone', ''),
            'company': validated_data.pop('company', ''),
            'position': validated_data.pop('position', ''),
            'gdpr_consent': validated_data.pop('gdpr_consent'),
            'marketing_consent': validated_data.pop('marketing_consent', False),
        }
        
        # Remove password confirm
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        # Create user
        user = User.objects.create_user(password=password, **validated_data)
        
        # Update profile (created automatically by signal)
        profile = user.profile
        for field, value in profile_fields.items():
            setattr(profile, field, value)
        
        if profile.gdpr_consent:
            profile.gdpr_consent_date = timezone.now()
        
        profile.save()
        
        return user

class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        
        if username and password:
            # Check if it's email or username
            if '@' in username:
                try:
                    user_obj = User.objects.get(email=username)
                    username = user_obj.username
                except User.DoesNotExist:
                    raise serializers.ValidationError("Invalid credentials.")
            
            user = authenticate(username=username, password=password)
            if not user:
                # Increment failed login attempts
                try:
                    user_obj = User.objects.get(username=username)
                    if hasattr(user_obj, 'profile'):
                        user_obj.profile.failed_login_attempts += 1
                        user_obj.profile.save()
                except User.DoesNotExist:
                    pass
                raise serializers.ValidationError("Invalid credentials.")
                
            if not user.is_active:
                raise serializers.ValidationError("User account is disabled.")
                
            # Check if account is locked
            if (hasattr(user, 'profile') and user.profile.account_locked_until and 
                user.profile.account_locked_until > timezone.now()):
                raise serializers.ValidationError("Account is temporarily locked. Please try again later.")
            
            # Reset failed attempts on successful login
            if hasattr(user, 'profile'):
                user.profile.failed_login_attempts = 0
                user.profile.last_activity = timezone.now()
                user.profile.save()
            
            attrs['user'] = user
        else:
            raise serializers.ValidationError("Username and password are required.")
        
        return attrs

class UserProfileSerializer(serializers.ModelSerializer):
    # User fields (no source needed - these are direct User fields)
    username = serializers.CharField(read_only=True)
    email = serializers.EmailField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    last_login = serializers.DateTimeField(read_only=True)
    date_joined = serializers.DateTimeField(read_only=True)
    
    # Profile fields (these need source since they're on the related profile)
    phone = serializers.CharField(source='profile.phone', required=False, allow_blank=True)
    company = serializers.CharField(source='profile.company', required=False, allow_blank=True)
    position = serializers.CharField(source='profile.position', required=False, allow_blank=True)
    timezone = serializers.CharField(source='profile.timezone', required=False)
    language = serializers.CharField(source='profile.language', required=False)
    avatar = serializers.ImageField(source='profile.avatar', required=False, allow_null=True)
    gdpr_consent = serializers.BooleanField(source='profile.gdpr_consent', read_only=True)
    marketing_consent = serializers.BooleanField(source='profile.marketing_consent', read_only=True)
    last_activity = serializers.DateTimeField(source='profile.last_activity', read_only=True)
    is_mfa_enabled = serializers.BooleanField(source='profile.is_mfa_enabled', read_only=True)
    
    # Computed field
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User  # Change this to User instead of UserProfile
        fields = [
            'username', 'email', 'first_name', 'last_name', 'full_name',
            'phone', 'company', 'position', 'timezone', 'language',
            'avatar', 'last_login', 'date_joined', 'is_mfa_enabled',
            'gdpr_consent', 'marketing_consent', 'last_activity'
        ]
    
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()
    
    def update(self, instance, validated_data):
        # Update user fields directly
        user_fields = ['email', 'first_name', 'last_name']
        for field in user_fields:
            if field in validated_data:
                setattr(instance, field, validated_data[field])
        
        # Update profile fields
        profile_data = validated_data.pop('profile', {})
        if profile_data:
            profile, created = UserProfile.objects.get_or_create(user=instance)
            for field, value in profile_data.items():
                setattr(profile, field, value)
            profile.save()
        
        instance.save()
        return instance

class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField()
    new_password = serializers.CharField(min_length=8)
    confirm_password = serializers.CharField()
    
    def validate_current_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError("New passwords do not match.")
        
        try:
            validate_password(attrs['new_password'], user=self.context['request'].user)
        except ValidationError as e:
            raise serializers.ValidationError({"new_password": e.messages})
        
        return attrs

class GDPRConsentSerializer(serializers.ModelSerializer):
    class Meta:
        model = GDPRRecord
        fields = ['consent_type', 'consent_given', 'consent_date']
        read_only_fields = ['consent_date']