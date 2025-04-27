from django.urls import path, include
from rest_framework.routers import DefaultRouter
from admin_api.views import (
    AdminUserViewSet, AdminJobViewSet, AdminCompanyViewSet, 
    AdminApplicationViewSet, ModerationLogViewSet, AdminNotificationViewSet,
    AdminDashboardStatsView, AdminDashboardSettingViewSet, AdminAnalyticsView,
    SystemSettingsView
)

router = DefaultRouter()
router.register(r'users', AdminUserViewSet, basename='admin-users')
router.register(r'jobs', AdminJobViewSet, basename='admin-jobs')
router.register(r'companies', AdminCompanyViewSet, basename='admin-companies')
router.register(r'applications', AdminApplicationViewSet, basename='admin-applications')
router.register(r'moderation-logs', ModerationLogViewSet, basename='moderation-logs')
router.register(r'notifications', AdminNotificationViewSet, basename='admin-notifications')
router.register(r'dashboard-settings', AdminDashboardSettingViewSet, basename='dashboard-settings')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/stats/', AdminDashboardStatsView.as_view(), name='admin-dashboard-stats'),
    path('analytics/', AdminAnalyticsView.as_view(), name='admin-analytics'),
    path('settings/', SystemSettingsView.as_view(), name='system-settings'),
] 