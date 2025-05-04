from config.settings.base import *

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = env('SECRET_KEY')

DEBUG = False

ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=['example.com'])

# ─── Database ────────────────────────────────────────────────────

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': env('POSTGRES_DB', default='postgres'),
        'USER': env('POSTGRES_USER', default='postgres'),
        'PASSWORD': env('POSTGRES_PASSWORD'),
        'HOST': env('POSTGRES_DB_HOST', default='postgres'),
        'PORT': env('POSTGRES_DB_PORT', default='5432'),
    }
}

# ─── Security ────────────────────────────────────────────────────

SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_PRELOAD = True
SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
X_FRAME_OPTIONS = 'DENY'

# ─── Logging ─────────────────────────────────────────────────────

# LOGGING = {
#     'version': 1,
#     'disable_existing_loggers': False,
#     'formatters': {
#         'verbose': {
#             'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
#             'style': '{',
#         },
#     },
#     'handlers': {
#         'file': {
#             'level': 'ERROR',
#             'class': 'logging.FileHandler',
#             'filename': BASE_DIR / 'logs/django.log',
#             'formatter': 'verbose',
#         },
#     },
#     'loggers': {
#         'django': {
#             'handlers': ['file'],
#             'level': 'ERROR',
#             'propagate': True,
#         },
#     },
# }

# ─── Celery ──────────────────────────────────────────────────────
# https://docs.celeryq.dev/en/stable/userguide/configuration.html
CELERY_BROKER_URL = env('CELERY_BROKER_URL', default='redis://sh-redis:6379/0')
CELERY_RESULT_BACKEND = env('CELERY_RESULT_BACKEND', default='redis://sh-redis:6379/0')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'UTC'  # Or your preferred timezone

# ─── JWT ─────────────────────────────────────────────────────────

SIMPLE_JWT.update({
    "SIGNING_KEY": SECRET_KEY,
})

# ─── API Docs Permissions ───────────────────────────────────────

SPECTACULAR_SETTINGS.update({
    'SERVE_PERMISSIONS': ['rest_framework.permissions.IsAdminUser'],
})
