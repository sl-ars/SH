from django.db import models
from django.conf import settings
from jobs.models import Job
from applications.models import Application

class JobView(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='job_views')
    viewer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    ip_address = models.GenericIPAddressField()
    viewed_at = models.DateTimeField(auto_now_add=True)
    duration = models.IntegerField(null=True, blank=True)

    class Meta:
        ordering = ['-viewed_at']
        indexes = [
            models.Index(fields=['job', 'viewed_at']),
            models.Index(fields=['ip_address', 'viewed_at']),
        ]

class JobApplicationMetrics(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='application_metrics')
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='metrics')
    source = models.CharField(max_length=50, null=True, blank=True)
    status = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['job', 'status']),
            models.Index(fields=['created_at']),
        ]

class EmployerMetrics(models.Model):
    employer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='metrics')
    total_jobs = models.IntegerField(default=0)
    total_applications = models.IntegerField(default=0)
    total_interviews = models.IntegerField(default=0)
    total_hires = models.IntegerField(default=0)
    average_time_to_hire = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['employer', 'created_at']),
        ]
