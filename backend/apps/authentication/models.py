# apps/authentication/models.py
from django.contrib.auth.models import User
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
import uuid

class UserProfile(models.Model):
    """Extended user profile for NextCRM"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    
    # Additional profile fields
    phone = models.CharField(max_length=20, blank=True)
    company = models.CharField(max_length=100, blank=True)
    position = models.CharField(max_length=100, blank=True)
    timezone = models.CharField(max_length=50, default='UTC')
    language = models.CharField(max_length=10, default='en')
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    
    # GDPR compliance fields
    gdpr_consent = models.BooleanField(default=False)
    gdpr_consent_date = models.DateTimeField(null=True, blank=True)
    marketing_consent = models.BooleanField(default=False)
    
    # Security fields
    is_mfa_enabled = models.BooleanField(default=False)
    failed_login_attempts = models.IntegerField(default=0)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    account_locked_until = models.DateTimeField(null=True, blank=True)
    
    # Activity tracking
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_activity = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'user_profiles'
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'
    
    def __str__(self):
        return f"{self.user.username} Profile"
    
    @property
    def full_name(self):
        return f"{self.user.first_name} {self.user.last_name}".strip()

class GDPRRecord(models.Model):
    """GDPR compliance tracking"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    consent_type = models.CharField(max_length=50)
    consent_given = models.BooleanField(default=False)
    consent_date = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    
    class Meta:
        unique_together = ['user', 'consent_type']
        db_table = 'gdpr_records'
        verbose_name = 'GDPR Record'
        verbose_name_plural = 'GDPR Records'
    
    def __str__(self):
        return f"{self.user.username} - {self.consent_type}"

class AuditLog(models.Model):
    """Audit log for tracking all user actions"""
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=20)  # CREATE, UPDATE, DELETE, VIEW, LOGIN, LOGOUT
    model_name = models.CharField(max_length=50)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    object_repr = models.CharField(max_length=200)
    changes = models.JSONField(default=dict)
    ip_address = models.GenericIPAddressField(null=True)
    user_agent = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'audit_logs'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', 'timestamp']),
            models.Index(fields=['model_name', 'object_id']),
            models.Index(fields=['action', 'timestamp']),
        ]
    
    def __str__(self):
        return f"{self.user} - {self.action} - {self.timestamp}"

# Signals to automatically create/save user profile
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    if hasattr(instance, 'profile'):
        instance.profile.save()