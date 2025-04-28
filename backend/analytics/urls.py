from django.urls import path, include
from rest_framework.routers import DefaultRouter
from analytics import views

router = DefaultRouter()
router.register(r'job-views', views.JobViewViewSet, basename='jobview')
router.register(r'job-application-metrics', views.JobApplicationMetricsViewSet, basename='jobapplicationmetric')
router.register(r'employer-metrics', views.EmployerMetricsViewSet, basename='employermetric')

urlpatterns = [
    path('', include(router.urls)),
    path('employer/', views.EmployerAnalyticsView.as_view(), name='employer-analytics'),
] 