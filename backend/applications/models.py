from django.db import models
from django.conf import settings
from jobs.models import Job


class ApplicationStatus(models.TextChoices):
    PENDING = 'pending', 'Pending'
    REVIEWING = 'reviewing', 'Reviewing'
    INTERVIEWED = 'interviewed', 'Interviewed'
    ACCEPTED = 'accepted', 'Accepted'
    REJECTED = 'rejected', 'Rejected'
    CANCELED = 'canceled', 'Canceled'


class InterviewStatus(models.TextChoices):
    NOT_SCHEDULED = 'not_scheduled', 'Not Scheduled'
    SCHEDULED = 'scheduled', 'Scheduled'
    COMPLETED = 'completed', 'Completed'
    CANCELED = 'canceled', 'Canceled'


def resume_upload_path(instance, filename):
    return f"resumes/{instance.applicant.id}/{filename}"


class Application(models.Model):
    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name='applications'
    )
    applicant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='applications'
    )
    status = models.CharField(
        max_length=20,
        choices=ApplicationStatus.choices,
        default=ApplicationStatus.PENDING
    )
    interview_status = models.CharField(
        max_length=20,
        choices=InterviewStatus.choices,
        default=InterviewStatus.NOT_SCHEDULED
    )
    interview_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Planned interview date and time"
    )
    cover_letter = models.TextField(blank=True)
    resume = models.ForeignKey('users.Resume', on_delete=models.SET_NULL, null=True, blank=True,
                               related_name='applications')

    notes = models.TextField(blank=True, help_text="Internal notes by employer")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['job', 'applicant'],
                name='unique_application_per_job'
            )
        ]

    def __str__(self):
        job_title = getattr(self.job, 'title', 'Unknown Job')
        applicant_email = getattr(self.applicant, 'email', 'Unknown Applicant')
        return f"Application by {applicant_email} for '{job_title}' [{self.status}]"
