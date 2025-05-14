from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Job(models.Model):
    INDUSTRY_CHOICES = [
        ('technology', 'Technology'),
        ('finance', 'Finance'),
        ('healthcare', 'Healthcare'),
        ('education', 'Education'),
        ('manufacturing', 'Manufacturing'),
        ('retail', 'Retail'),
        ('marketing', 'Marketing'),
        ('media', 'Media & Entertainment'),
        ('construction', 'Construction'),
        ('transportation', 'Transportation'),
        ('energy', 'Energy'),
        ('telecommunications', 'Telecommunications'),
        ('other', 'Other'),
    ]

    SCOPE_CHOICES = [
        ('personal', 'My Jobs'),
    ]

    JOB_TYPE_CHOICES = [
    ('full-time', 'Full-Time'),
    ('part-time', 'Part-Time'),
    ('contract', 'Contract'),
    ('internship', 'Internship'),
    ('temporary', 'Temporary'),
]

    title = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    company_id = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    type = models.CharField(max_length=50, choices=JOB_TYPE_CHOICES)
    salary_min = models.PositiveIntegerField(null=True, blank=True)
    salary_max = models.PositiveIntegerField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    requirements = models.JSONField(null=True, blank=True)
    responsibilities = models.JSONField(null=True, blank=True)
    benefits = models.JSONField(null=True, blank=True)
    posted_date = models.DateTimeField(auto_now_add=True)
    deadline = models.DateTimeField(null=True, blank=True)
    featured = models.BooleanField(default=False)
    logo = models.ImageField(upload_to='job_logos/', null=True, blank=True)
    industry = models.CharField(max_length=255, choices=INDUSTRY_CHOICES, null=True, blank=True)
    view_count = models.IntegerField(default=0)
    application_count = models.IntegerField(default=0)
    status = models.CharField(max_length=50, default='active')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posted_jobs', null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.title