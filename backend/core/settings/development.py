# backend/core/settings/development.py
from .base import *
import os

# Development specific settings
DEBUG = True

# PostgreSQL with URI to avoid Windows encoding issues
import dj_database_url

# Use URI connection string
DATABASE_URL = os.environ.get(
    'DATABASE_URL', 
    'postgresql://nextcrm_user:nextcrm_password_2024@127.0.0.1:5432/nextcrm?client_encoding=utf8'
)

DATABASES = {
    'default': dj_database_url.parse(DATABASE_URL)
}

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