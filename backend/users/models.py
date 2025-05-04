from django.db import models
from django.contrib.auth.models import AbstractUser

from core.storage import PublicAssetStorage
from users.managers import CustomUserManager
from users.storage import AvatarStorage, ResumeStorage
import boto3
from django.conf import settings
from botocore.exceptions import NoCredentialsError, ClientError

class CustomUser(AbstractUser):
    objects = CustomUserManager()

    ROLE_CHOICES = [
        ('student', 'Student'),
        ('employer', 'Employer'),
        ('campus', 'Campus'),
        ('admin', 'Admin'),
    ]

    class Meta:
        app_label = 'users'

    username = None
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    phone = models.CharField(max_length=20, blank=True, null=True)
    avatar = models.ImageField(storage=PublicAssetStorage(), upload_to="avatars/", blank=True, null=True, help_text="Profile picture")
    university = models.CharField(max_length=255, blank=True, null=True, default="")
    company = models.CharField(max_length=255, blank=True, null=True, default="")
    company_id = models.CharField(max_length=255, blank=True, null=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    location = models.CharField(max_length=255, blank=True, null=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def save(self, *args, **kwargs):
        if self.role == 'admin':
            self.is_staff = True
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.email} ({self.role})"


class StudentProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name="student_profile")
    bio = models.TextField(blank=True, null=True)
    skills = models.JSONField(blank=True, null=True, default=list)
    achievements = models.JSONField(blank=True, null=True, default=list)
    resume = models.FileField(upload_to="resumes/", null=True, blank=True)
    saved_jobs = models.ManyToManyField('jobs.Job', blank=True, related_name="saved_by_students")

    def __str__(self):
        return f"Student Profile: {self.user.email}"

def upload_to_student_directory(instance, filename):
    user_id = instance.student.user.id
    return f"{user_id}/{filename}"
class Resume(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name="resumes")
    file = models.FileField(storage=ResumeStorage(), upload_to=upload_to_student_directory)
    name = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Resume: {self.name or self.file.name} for {self.student.user.email}"

    def save(self, *args, **kwargs):
        if not self.name and self.file:
            self.name = self.file.name
        super().save(*args, **kwargs)




class Education(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name="education")
    university = models.CharField(max_length=255)
    degree = models.CharField(max_length=255)
    field = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    gpa = models.CharField(max_length=10, blank=True, null=True)

    def clean(self):
        if isinstance(self.start_date, str) and len(self.start_date) == 7:
            self.start_date = f"{self.start_date}-01"
        if isinstance(self.end_date, str) and len(self.end_date) == 7:
            self.end_date = f"{self.end_date}-01"

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)


class Experience(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name="experience")
    company = models.CharField(max_length=255)
    position = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    current = models.BooleanField(default=False)
    description = models.TextField(blank=True)


class EmployerProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name="employer_profile")
    industry = models.CharField(max_length=100)
    website = models.URLField(blank=True, null=True)
    description = models.TextField(blank=True)
    company = models.ForeignKey('companies.Company', on_delete=models.SET_NULL, null=True, blank=True, related_name="employer_profiles")

    def __str__(self):
        company_name_str = self.company.name if self.company else "No Company Assigned"
        return f"Employer Profile for: {self.user.email} ({company_name_str})"


class CampusProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name="campus_profile")
    university = models.CharField(max_length=255)
    department = models.CharField(max_length=255, blank=True)
    position = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"Campus: {self.university}"


class UserSettings(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='settings')
    email_notifications = models.BooleanField(default=True)
    push_notifications = models.BooleanField(default=True)
    two_factor_auth = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'User Settings'
        verbose_name_plural = 'User Settings'

    def __str__(self):
        return f'Settings for {self.user.email}'

class CompanySettings(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='company_settings')
    company_name = models.CharField(max_length=255)
    company_website = models.URLField(blank=True, null=True)
    company_description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Company Settings'
        verbose_name_plural = 'Company Settings'

    def __str__(self):
        return f'Company settings for {self.user.email}'


