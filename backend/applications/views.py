from django.utils import timezone
from django.contrib.contenttypes.models import ContentType
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes
from django.db.models import F
from rest_framework.exceptions import PermissionDenied

from applications.models import Application, ApplicationStatus
from applications.serializers import ApplicationSerializer, ApplicationDetailSerializer, ScheduleInterviewSerializer
from jobs.models import Job
from core.permissions import IsOwnerOrEmployer
from core.utils import ok, fail
from analytics.models import JobApplicationMetrics
from users.models import StudentProfile

# Import Celery tasks
from .tasks import send_new_application_email_task, send_interview_scheduled_email_task

STUDENT_COMPLETENESS_CHECKS = {
    'name': lambda user, profile: bool(user.name and user.name.strip()),
    'avatar': lambda user, profile: bool(user.avatar),
    'phone': lambda user, profile: bool(user.phone and user.phone.strip()),
    'location': lambda user, profile: bool(user.location and user.location.strip()),
    'university_affiliation': lambda user, profile: bool(user.university and user.university.strip()),
    'bio': lambda user, profile: bool(profile.bio and profile.bio.strip()),
    'skills': lambda user, profile: bool(profile.skills),
    'achievements': lambda user, profile: bool(profile.achievements),
    'resumes': lambda user, profile: profile.resumes.exists(),
    'education_history': lambda user, profile: profile.education.exists(),
    'work_experience': lambda user, profile: profile.experience.exists(),
}

def get_student_profile_completeness_percentage(user):
    if user.role != 'student':
        return 100

    try:
        profile = user.student_profile
    except StudentProfile.DoesNotExist:
        return 0

    filled_fields_count = 0
    total_fields = len(STUDENT_COMPLETENESS_CHECKS)

    if total_fields == 0:
        return 100

    for field_key, check_func in STUDENT_COMPLETENESS_CHECKS.items():
        if check_func(user, profile):
            filled_fields_count += 1
    
    percentage = (filled_fields_count / total_fields) * 100
    return round(percentage, 2)


@extend_schema(tags=['applications'])
class ApplicationViewSet(viewsets.ModelViewSet):
    """Application management API."""
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrEmployer]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'job']
    ordering_fields = ['created_at', 'updated_at']

    def get_serializer_class(self):
        if self.action in ['retrieve', 'update', 'partial_update']:
            return ApplicationDetailSerializer
        return ApplicationSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Application.objects.all()
        if user.role == 'employer':
            if user.company_id:
                return Application.objects.filter(job__company_id=user.company_id)
            else:
                return Application.objects.none()
        if user.role == 'student':
            return Application.objects.filter(applicant=user)
        return Application.objects.none()

    def perform_create(self, serializer):
        job = serializer.validated_data.get('job')
        applicant = self.request.user

        if job.created_by == applicant:
            raise PermissionDenied("You cannot apply to your own job posting.")

        if applicant.role == 'student':
            completeness_percentage = get_student_profile_completeness_percentage(applicant)
            if completeness_percentage < 70:
                raise PermissionDenied(
                    f"Your profile is only {completeness_percentage}% complete. "
                    f"Please complete at least 70% of your profile before applying for jobs."
                )

        application_instance = serializer.save(applicant=applicant)
        Job.objects.filter(pk=job.pk).update(application_count=F('application_count') + 1)
        
        JobApplicationMetrics.objects.create(
            job=job,
            application=application_instance,
            status=application_instance.status,
        )
        
        try:
            from admin_api.models import AdminNotification
            AdminNotification.objects.create(
                title=f"New Application for {job.title}",
                message=f"A new application has been submitted by {self.request.user.email} for the job: {job.title}",
                type='new_application',
                content_type=ContentType.objects.get_for_model(Application),
                object_id=serializer.instance.id
            )
        except (ImportError, ContentType.DoesNotExist):
            pass

        # Send email notification to employer
        try:
            send_new_application_email_task.delay(application_instance.id)
            print(f"Celery task send_new_application_email_task queued for application ID: {application_instance.id}")
        except Exception as e:
            # Log this error, but don't let it break the application creation flow
            print(f"Error queuing Celery task send_new_application_email_task for application ID {application_instance.id}: {e}")

    @extend_schema(
        summary="Update application status",
        request={
            'application/json': {
                'schema': {
                    'type': 'object',
                    'properties': {
                        'status': {'type': 'string', 'enum': [choice[0] for choice in ApplicationStatus]},
                        'notes': {'type': 'string', 'nullable': True}
                    },
                    'required': ['status']
                }
            }
        },
        responses={
            200: ApplicationSerializer,
            400: {'description': 'Invalid status provided.'},
            403: {'description': 'Permission denied.'},
            404: {'description': 'Application not found.'}
        }
    )
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        application = self.get_object()
        new_status = request.data.get('status')
        notes = request.data.get('notes', application.notes)

        if new_status not in ApplicationStatus.values:
            return fail('Invalid status', code=status.HTTP_400_BAD_REQUEST)
        if request.user.role == 'employer':
            if application.job.created_by != request.user:
                return fail('Permission denied. Not the job owner.', code=status.HTTP_403_FORBIDDEN)
        elif request.user.role == 'student':
            if application.applicant != request.user:
                return fail('Permission denied. Not your application.', code=status.HTTP_403_FORBIDDEN)
            if new_status != ApplicationStatus.CANCELED:
                return fail('Permission denied. Students can only cancel applications.', code=status.HTTP_403_FORBIDDEN)


        elif not request.user.is_staff:
             pass


        old_status = application.status
        application.status = new_status
        application.notes = notes
        application.save()
        
        JobApplicationMetrics.objects.update_or_create(
            application=application,
            defaults={
                'job': application.job,
                'status': new_status,
            }
        )
        
        return ok(self.get_serializer(application).data)

    @extend_schema(
        summary="Schedule interview",
        request=ScheduleInterviewSerializer,
        responses={
            200: ApplicationDetailSerializer,
            400: {'description': 'Invalid data. Interview date is required or data format is incorrect.'},
            403: {'description': 'Permission denied. User is not authorized or is a student.'},
            404: {'description': 'Application not found.'}
        }
    )
    @action(detail=True, methods=['post'])
    def schedule_interview(self, request, pk=None):
        application = self.get_object()

        if request.user.role == 'student':
            return fail('Permission denied. Students cannot schedule interviews.', code=status.HTTP_403_FORBIDDEN)




        serializer = ScheduleInterviewSerializer(data=request.data)
        if not serializer.is_valid():
            return fail('Invalid data provided.', errors=serializer.errors, code=status.HTTP_400_BAD_REQUEST)
        
        validated_data = serializer.validated_data
        interview_date = validated_data.get('interview_date')
        notes = validated_data.get('notes', application.notes) 
        
        application.interview_date = interview_date
        application.notes = notes
        application.status = ApplicationStatus.INTERVIEWED 
        application.save()
        
        response_serializer = ApplicationDetailSerializer(application, context=self.get_serializer_context())
        
        # Send email notification to student about the interview
        try:
            send_interview_scheduled_email_task.delay(application.id)
            print(f"Celery task send_interview_scheduled_email_task queued for application ID: {application.id}")
        except Exception as e:
            # Log this error, but don't let it break the interview scheduling flow
            print(f"Error queuing Celery task send_interview_scheduled_email_task for application ID {application.id}: {e}")
            
        return ok(response_serializer.data)

    @extend_schema(
        summary="Application statistics",
        description="Returns application statistics depending on user role.",
        responses={200: OpenApiTypes.OBJECT}
    )
    @action(detail=False, methods=['get'])
    def stats(self, request):
        user = request.user
        result = {'total': 0, 'by_status': {}, 'recent': 0}
        if user.role == 'employer':
            applications = Application.objects.filter(job__created_by=user)
            result.update({
                'total': applications.count(),
                'recent': applications.filter(created_at__gte=timezone.now() - timezone.timedelta(days=7)).count(),
                'by_job': {
                    job.id: {'title': job.title, 'count': applications.filter(job=job).count()}
                    for job in Job.objects.filter(created_by=user)
                }
            })
        elif user.role == 'student':
            applications = Application.objects.filter(applicant=user)
            result['total'] = applications.count()
            result['recent'] = applications.filter(created_at__gte=timezone.now() - timezone.timedelta(days=7)).count()
        elif user.is_staff:
            applications_qs = Application.objects.all()
            all_jobs = Job.objects.all()
            result['total'] = applications_qs.count()
            result['recent'] = applications_qs.filter(created_at__gte=timezone.now() - timezone.timedelta(days=7)).count()
            result['by_job_type'] = {
                str(job_type): applications_qs.filter(job__type=job_type).count()
                for job_type in all_jobs.values_list('type', flat=True).distinct() if job_type
            }
            result['by_location'] = {
                str(location): applications_qs.filter(job__location=location).count()
                for location in all_jobs.values_list('location', flat=True).distinct() if location
            }
        for status_code, _ in ApplicationStatus:
            result['by_status'][status_code] = applications_qs.filter(status=status_code).count()
        return ok(result)