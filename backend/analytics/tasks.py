from celery import shared_task
from django.utils import timezone
from django.db.models import Count, Avg, F, ExpressionWrapper, fields
from django.contrib.auth import get_user_model
from jobs.models import Job
from applications.models import Application, ApplicationStatus
from analytics.models import EmployerMetrics

User = get_user_model()

@shared_task(name='update_employer_metrics_task')
def update_employer_metrics():
    employers = User.objects.filter(role='employer')

    for employer in employers:
        jobs_by_employer = Job.objects.filter(created_by=employer)
        applications_for_employer_jobs = Application.objects.filter(job__in=jobs_by_employer)

        total_jobs = jobs_by_employer.count()
        total_applications = applications_for_employer_jobs.count()
        total_interviews = applications_for_employer_jobs.filter(status=ApplicationStatus.INTERVIEWED).count()
        hired_applications = applications_for_employer_jobs.filter(status=ApplicationStatus.ACCEPTED) 
        total_hires = hired_applications.count()

        avg_time_to_hire_days = None
        if total_hires > 0:


            durations = []
            for app in hired_applications:
                if app.created_at and app.updated_at:

                    if isinstance(app.created_at, timezone.datetime) and isinstance(app.updated_at, timezone.datetime):
                        duration = app.updated_at - app.created_at
                        durations.append(duration.days)
            if durations:
                avg_time_to_hire_days = sum(durations) / len(durations)
        
        EmployerMetrics.objects.update_or_create(
            employer=employer,
            defaults={
                'total_jobs': total_jobs,
                'total_applications': total_applications,
                'total_interviews': total_interviews,
                'total_hires': total_hires,
                'average_time_to_hire': avg_time_to_hire_days,
                'updated_at': timezone.now()
            }
        )
    return f"Employer metrics updated for {employers.count()} employers at {timezone.now()}" 