# apps/authentication/urls.py
from django.urls import path
from . import views
from .views import auth_root

app_name = 'authentication'

urlpatterns = [
    # Authentication endpoints
    path('', auth_root, name='auth_root'),
    path('register/', views.register, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    
    # JWT token management
    path('token/refresh/', views.CustomTokenRefreshView.as_view(), name='token_refresh'),
    
    # User management
    path('profile/', views.profile_view, name='profile'),
    path('change-password/', views.change_password, name='change_password'),
    path('permissions/', views.user_permissions, name='user_permissions'),
    
    # GDPR compliance
    path('gdpr/consent/', views.gdpr_consent, name='gdpr_consent'),
    path('gdpr/export/', views.export_user_data, name='export_user_data'),
]