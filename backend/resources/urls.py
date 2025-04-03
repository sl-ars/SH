from django.urls import path, include
from rest_framework.routers import DefaultRouter
from resources.views import ResourceViewSet, ResourceFileViewSet

router = DefaultRouter()
router.register(r'resources', ResourceViewSet)
router.register(r'resource-files', ResourceFileViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 