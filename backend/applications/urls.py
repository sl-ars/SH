from django.urls import path, include
from rest_framework.routers import DefaultRouter
from applications import views

router = DefaultRouter()
router.register('', views.ApplicationViewSet, basename='application')

urlpatterns = [
    path('', include(router.urls)),
] 