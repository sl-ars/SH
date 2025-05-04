from config.settings.base import *

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = env('SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['*']

# Database
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Media and static files for development
MEDIA_ROOT = BASE_DIR / 'media'
MEDIA_URL = '/media/'
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'static'

# Allow all origins (for development only)
CORS_ALLOW_ALL_ORIGINS = True

# If you use credentials (cookies, Authorization headers), keep this True
CORS_ALLOW_CREDENTIALS = True

# Optional – define allowed methods
CORS_ALLOW_METHODS = [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
]

# Optional – define allowed headers
CORS_ALLOW_HEADERS = ["*"]


# Disable some security settings during development
CSRF_COOKIE_SECURE = False
SESSION_COOKIE_SECURE = False
SECURE_SSL_REDIRECT = False
SECURE_HSTS_SECONDS = 0
SECURE_HSTS_INCLUDE_SUBDOMAINS = False
SECURE_HSTS_PRELOAD = False

# Internal IPs
INTERNAL_IPS = [
    '127.0.0.1',
]


# JWT setting overrides for development
SIMPLE_JWT.update({
    "SIGNING_KEY": SECRET_KEY,
})

# DRF Spectacular settings for development
SPECTACULAR_SETTINGS.update({
    'SERVE_PERMISSIONS': ['rest_framework.permissions.AllowAny'],
})

REST_FRAMEWORK['DEFAULT_THROTTLE_CLASSES'] = []
REST_FRAMEWORK['DEFAULT_THROTTLE_RATES'] = {}

