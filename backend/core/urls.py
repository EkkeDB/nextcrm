from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.http import JsonResponse

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def health_check(request):
    """Health check endpoint"""
    return Response({
        'status': 'healthy',
        'message': 'NextCRM API is running!'
    }, status=status.HTTP_200_OK)

def home_view(request):
    """Temporary home page"""
    return JsonResponse({
        'message': 'Welcome to NextCRM!',
        'version': '1.0.0',
        'status': 'running',
        'admin': '/admin/',
        'api_health': '/api/health/',
        'api_auth': '/api/auth/',
        'documentation': 'https://github.com/EkkeDB/NewCRM'
    })

urlpatterns = [
    # Home page
    path('', home_view, name='home'),
    
    # Admin
    path('admin/', admin.site.urls),
    
    # Health check
    path('api/health/', health_check, name='health_check'),
    
    # Authentication
    path('api/auth/', include('apps.authentication.urls')),
    
    # NextCRM API
    path('api/nextcrm/', include('apps.nextcrm.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Customize admin
admin.site.site_header = 'NextCRM Administration'
admin.site.site_title = 'NextCRM Admin'