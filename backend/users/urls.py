from django.urls import path, include
from rest_framework.routers import DefaultRouter
from users.views import RegisterViewSet, ProfileViewSet, ResumeViewSet, UserSettingsViewSet

router = DefaultRouter()

router.register(r"register", RegisterViewSet, basename="register")
router.register(r"resumes", ResumeViewSet, basename="resumes")
router.register(r"profile", ProfileViewSet, basename="user-profile")
router.register(r"settings", UserSettingsViewSet, basename="user-settings")

urlpatterns = [
    path("", include(router.urls)),
]
