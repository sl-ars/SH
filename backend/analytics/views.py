from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets, permissions, filters
from rest_framework.decorators import action
from django.utils import timezone
from datetime import timedelta
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes
from django_filters.rest_framework import DjangoFilterBackend
from jobs.models import Job
from applications.models import Application, ApplicationStatus
from analytics.models import JobView, JobApplicationMetrics, EmployerMetrics
from analytics.serializers import JobViewSerializer, JobApplicationMetricsSerializer, EmployerMetricsSerializer
from analytics.permissions import AnalyticsPermissions
from django.db.models import Count, Avg, F, Sum, DateField, Q
from django.db.models.functions import TruncDay, TruncMonth, TruncYear, Cast
from .utils import get_date_range_and_trunc
from django.contrib.auth import get_user_model

User = get_user_model()

@extend_schema(
    tags=['analytics'],
    summary="Retrieve Employer Analytics Data",
    description="Provides comprehensive analytics data for employers including job statistics, application trends, and performance metrics."
)
class EmployerAnalyticsView(APIView):
    permission_classes = [AnalyticsPermissions]

    @extend_schema(
        parameters=[
            OpenApiParameter(name='period', description='Time period for analytics aggregation (e.g., "week", "month", "year"). Default is "month".', required=False, type=OpenApiTypes.STR, enum=['week', 'month', 'year']),
            OpenApiParameter(name='employer_id', description='(Admin only) ID of the employer to fetch analytics for.', required=False, type=OpenApiTypes.INT, location=OpenApiParameter.QUERY)
        ]
    )
    def get(self, request):
        if not request.user.is_authenticated:
            return Response({"status": "error", "message": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        target_employer_user = request.user

        if request.user.is_staff:
            employer_id_param = request.query_params.get('employer_id')
            if employer_id_param:
                try:
                    target_employer_user = User.objects.get(pk=employer_id_param, role='employer')
                except User.DoesNotExist:
                    return Response({"status": "error", "message": "Employer not found for specified employer_id."}, status=status.HTTP_404_NOT_FOUND)
                except ValueError:
                    return Response({"status": "error", "message": "Invalid employer_id format."}, status=status.HTTP_400_BAD_REQUEST)


        elif request.user.role != 'employer':
             return Response({"status": "error", "message": "Access Denied. Only employers or admins can access this data."}, status=status.HTTP_403_FORBIDDEN)
        if not target_employer_user.company_id:

            empty_response_data = {
                "summary": {"total_jobs": 0, "active_jobs": 0, "total_applications": 0, "application_status_counts": {}, "total_job_views": 0},
                "time_series": {"applications_over_time": [], "job_views_over_time": []},
                "popular_jobs": []
            }
            return Response({
                "status": "success", 
                "message": "Employer not associated with a company, or no company ID found.", 
                "data": empty_response_data
            }, status=status.HTTP_200_OK)

        period = request.query_params.get('period', 'month')
        start_date, end_date, trunc_function = get_date_range_and_trunc(period)
        employer_jobs = Job.objects.filter(company_id=target_employer_user.company_id)
        job_ids = employer_jobs.values_list('id', flat=True)
        total_jobs_count = employer_jobs.count()
        active_jobs_count = employer_jobs.filter(is_active=True).count()


        applications_qs = Application.objects.filter(job_id__in=job_ids)
        total_applications_count = applications_qs.count()
        
        application_status_counts = {status[0]: 0 for status in ApplicationStatus.choices}
        status_agg = applications_qs.values('status').annotate(count=Count('id'))
        for item in status_agg:
            application_status_counts[item['status']] = item['count']
        total_job_views_count = JobView.objects.filter(job_id__in=job_ids).count()
        application_stats_by_date = applications_qs.filter(created_at__gte=start_date, created_at__lte=end_date).annotate(
            date=trunc_function('created_at')
        ).values('date').annotate(applications=Count('id')).order_by('date')
        job_view_stats_by_date = JobView.objects.filter(job_id__in=job_ids, viewed_at__gte=start_date, viewed_at__lte=end_date).annotate(
            date=trunc_function('viewed_at')
        ).values('date').annotate(views=Count('id')).order_by('date')



        popular_jobs_data = list(employer_jobs.annotate(
            num_applications=Count('applications')
        ).order_by('-view_count', '-num_applications')[:5].values('id', 'title', 'view_count', num_applications=F('num_applications')))

        response_data = {
            "summary": {
                "total_jobs": total_jobs_count,
                "active_jobs": active_jobs_count,
                "total_applications": total_applications_count,
                "application_status_counts": application_status_counts,
                "total_job_views": total_job_views_count,
            },
            "time_series": {
                "applications_over_time": list(application_stats_by_date),
                "job_views_over_time": list(job_view_stats_by_date),
            },
            "popular_jobs": popular_jobs_data,
        }
        return Response({"status": "success", "data": response_data}, status=status.HTTP_200_OK)

@extend_schema(tags=['analytics'])
class JobViewViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = JobView.objects.all()
    serializer_class = JobViewSerializer
    permission_classes = [AnalyticsPermissions]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['job', 'viewer', 'ip_address']
    ordering_fields = ['viewed_at', 'duration']
    ordering = ['-viewed_at']


@extend_schema(tags=['analytics'])
class JobApplicationMetricsViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = JobApplicationMetrics.objects.all()
    serializer_class = JobApplicationMetricsSerializer
    permission_classes = [AnalyticsPermissions]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['job', 'application', 'source', 'status']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']

    @extend_schema(
        summary="Get Job View and Application Trends for a specific Job Metric (or its related Job)",
        parameters=[
            OpenApiParameter(name='days', description='Number of past days to fetch trends for (default 30).', required=False, type=OpenApiTypes.INT)
        ]
    )
    @action(detail=True, methods=['get'])
    def trends(self, request, pk=None):
        try:
            metric_instance = self.get_object()
            job = metric_instance.job
        except JobApplicationMetrics.DoesNotExist:
            return Response({"error": "JobApplicationMetrics not found."}, status=status.HTTP_404_NOT_FOUND)
        except Job.DoesNotExist:
             return Response({"error": "Associated Job not found for this metric."}, status=status.HTTP_404_NOT_FOUND)
        if request.user.role == 'employer' and job.created_by != request.user:
            return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

        days = int(request.query_params.get('days', 30))
        start_date, end_date, _ = EmployerAnalyticsView()._get_date_range_and_trunc(str(days))

        daily_views = JobView.objects.filter(job=job, viewed_at__gte=start_date, viewed_at__lte=end_date)\
            .annotate(date=TruncDay('viewed_at'))\
            .values('date').annotate(count=Count('id')).order_by('date')

        daily_applications = Application.objects.filter(job=job, created_at__gte=start_date, created_at__lte=end_date)\
            .annotate(date=TruncDay('created_at'))\
            .values('date').annotate(count=Count('id')).order_by('date')

        return Response({'views': list(daily_views), 'applications': list(daily_applications)})

@extend_schema(tags=['analytics'])
class EmployerMetricsViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = EmployerMetrics.objects.all()
    serializer_class = EmployerMetricsSerializer
    permission_classes = [AnalyticsPermissions]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['employer']
    ordering_fields = ['updated_at']
    ordering = ['-updated_at']

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return super().get_queryset()
        if user.role == 'employer':
            return super().get_queryset().filter(employer=user)
        return EmployerMetrics.objects.none()

    @extend_schema(summary="Get Employer Performance Metrics Summary")
    @action(detail=False, methods=['get'])
    def summary(self, request):

        employer_user = request.user
        if request.user.is_staff and request.query_params.get('employer_id'):
            try:
                from django.contrib.auth import get_user_model
                User = get_user_model()
                employer_user = User.objects.get(pk=request.query_params.get('employer_id'), role='employer')
            except User.DoesNotExist:
                return Response({"error": "Employer not found."}, status=status.HTTP_404_NOT_FOUND)
        
        metrics = EmployerMetrics.objects.filter(employer=employer_user).aggregate(
            total_jobs_sum=Sum('total_jobs'),
            total_applications_sum=Sum('total_applications'),
            total_interviews_sum=Sum('total_interviews'),
            total_hires_sum=Sum('total_hires'),


        )
        latest_metric = EmployerMetrics.objects.filter(employer=employer_user).order_by('-updated_at').first()

        return Response({
            'total_jobs': metrics['total_jobs_sum'] or 0,
            'total_applications': metrics['total_applications_sum'] or 0,
            'total_interviews': metrics['total_interviews_sum'] or 0,
            'total_hires': metrics['total_hires_sum'] or 0,
            'average_time_to_hire': latest_metric.average_time_to_hire if latest_metric else None
        })
