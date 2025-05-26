from .base import *
import os

# Development specific settings
DEBUG = True

# Email backend for development
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# CORS settings for development
CORS_ALLOW_ALL_ORIGINS = True

# Static files for development
STATICFILES_DIRS = [
    BASE_DIR / 'static',
]

# Ensure directories exist
import pathlib
static_dir = BASE_DIR / 'static'
media_dir = BASE_DIR / 'media'
static_dir.mkdir(exist_ok=True)
media_dir.mkdir(exist_ok=True)