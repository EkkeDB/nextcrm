from pathlib import Path
from datetime import timedelta
from decouple import config
import os


BASE_DIR = Path(__file__).resolve().parent.parent

# ⚠️ Recuerda cambiar esto en producción
SECRET_KEY = "django-insecure-oqo_+5zfc&t68!7d*tqu0h-d9)fz1rjtx)b@$-+eu7@&oxyoe#"

DEBUG = True

if DEBUG:
    # Desactivar seguridad HTTPS en entorno local
    SECURE_SSL_REDIRECT = False
    SESSION_COOKIE_SECURE = False
    CSRF_COOKIE_SECURE = False
    SIMPLE_JWT["AUTH_COOKIE_SECURE"] = False

ALLOWED_HOSTS = ["localhost", "127.0.0.1"]


# ============================
#       INSTALLED_APPS
# ============================
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # External apps
    "rest_framework",
    "corsheaders",
    "rest_framework_simplejwt.token_blacklist",
    "reversion",
    # Your apps
    "nextcrm",
]

# ============================
#       MIDDLEWARE
# ============================
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "nextcrm.middleware.CookieToHeaderMiddleware", 
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# ============================
#       TEMPLATES
# ============================
ROOT_URLCONF = "core.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "core.wsgi.application"

# ============================
#       DATABASE
# ============================

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('POSTGRES_DB'),
        'USER': config('POSTGRES_USER'),
        'PASSWORD': config('POSTGRES_PASSWORD'),
        'HOST': config('POSTGRES_HOST', default='localhost'),
        'PORT': config('POSTGRES_PORT', default='5432'),
    }
}


# ============================
#   PASSWORD VALIDATION
# ============================
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"
    },
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ============================
#     INTERNATIONALIZATION
# ============================
LANGUAGE_CODE = "es-es"

TIME_ZONE = "Europe/Madrid"

USE_I18N = True
USE_L10N = True  # (opcional, pero recomendable para formatos regionales)

USE_TZ = True

# ============================
#       STATIC FILES
# ============================
STATIC_URL = "static/"

# ============================
#   DEFAULT PRIMARY KEY TYPE
# ============================
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ============================
#       DJANGO REST FRAMEWORK
# ============================
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ]
}

# ============================
#     SIMPLE JWT CONFIG
# ============================
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=10),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
    # Opcional si usas cookies personalizadas (en vistas)
    "AUTH_COOKIE": "access_token",
    "AUTH_COOKIE_SECURE": True,  # Solo HTTPS
    "AUTH_COOKIE_HTTP_ONLY": True,  # No accesible por JS
    "AUTH_COOKIE_SAMESITE": "Lax",  # Protege contra CSRF
}

# ============================
#           CORS
# ============================
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # Next.js local
    "http://172.25.32.1:3000",
    "http://172.27.0.159:3000",
    "http://127.0.0.1:3000",
    
]


# ============================
#           MEDIA
# ============================

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media/"