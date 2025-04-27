#!/bin/bash
set -e
mkdir -p /app/staticfiles /app/media

echo "📦 Running Django migrations..."
python manage.py makemigrations
python manage.py migrate --noinput

echo "🎨 Collecting static files..."
python manage.py collectstatic --noinput

echo "🚀 Starting Gunicorn..."
exec gunicorn config.wsgi:application --bind 0.0.0.0:8000
