import os

# Default to development settings
environment = os.environ.get('DJANGO_ENVIRONMENT', 'dev')

if environment == 'prod':
    from config.settings.prod import *
else:
    from config.settings.dev import *
