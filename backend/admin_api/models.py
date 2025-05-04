from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

User = get_user_model()

class ModerationLog(models.Model):
    """Лог действий модерации для отслеживания активности администраторов."""
    ACTIONS = [
        ('approve', 'Approve'),
        ('reject', 'Reject'),
        ('suspend', 'Suspend'),
        ('restore', 'Restore'),
        ('edit', 'Edit'),
    ]
    
    admin = models.ForeignKey(User, on_delete=models.CASCADE, related_name='moderation_logs')
    action = models.CharField(max_length=20, choices=ACTIONS)
    timestamp = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)
    
    # Для связи с любой моделью (Job, Company, User, etc.)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    
    def __str__(self):
        return f"{self.admin.email} - {self.action} - {self.timestamp}"

class AdminNotification(models.Model):
    """Уведомления для администраторов о действиях, требующих внимания."""
    TYPE_CHOICES = [
        ('new_company', 'New Company Registration'),
        ('new_job', 'New Job Posting'),
        ('reported_content', 'Reported Content'),
        ('verification_request', 'Verification Request'),
    ]
    
    title = models.CharField(max_length=255)
    message = models.TextField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    
    # Для связи с объектом, к которому относится уведомление
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    content_object = GenericForeignKey('content_type', 'object_id')
    
    def __str__(self):
        return self.title

class AdminDashboardSetting(models.Model):
    """Настройки дашборда администратора."""
    admin = models.OneToOneField(User, on_delete=models.CASCADE, related_name='dashboard_settings')
    default_filters = models.JSONField(default=dict, blank=True)
    layout_preferences = models.JSONField(default=dict, blank=True)
    email_notifications = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.admin.email}'s Dashboard Settings"

class SystemSettings(models.Model):
    """Глобальные настройки системы."""
    siteName = models.CharField(max_length=255, default='StudentHunter')
    supportEmail = models.EmailField(default='support@studenthunter.com')
    maintenanceMode = models.BooleanField(default=False)
    emailNotifications = models.BooleanField(default=True)
    pushNotifications = models.BooleanField(default=False)
    twoFactorAuth = models.BooleanField(default=False)
    passwordExpiry = models.BooleanField(default=True)
    smtpServer = models.CharField(max_length=255, default='smtp.example.com')
    smtpPort = models.CharField(max_length=5, default='587')
    smtpUsername = models.CharField(max_length=255, blank=True)
    smtpPassword = models.CharField(max_length=255, blank=True)
    smtpSecure = models.BooleanField(default=True)
    logoUrl = models.CharField(max_length=255, default='/images/logo.svg')
    faviconUrl = models.CharField(max_length=255, default='/favicon.ico')
    primaryColor = models.CharField(max_length=7, default='#3B82F6')
    primaryAccentColor = models.CharField(max_length=7, default='#2563EB')
    secondaryColor = models.CharField(max_length=7, default='#10B981')
    allowOpenRegistration = models.BooleanField(default=True)
    requireEmailVerification = models.BooleanField(default=True)
    allowStudentRegistration = models.BooleanField(default=True)
    allowEmployerRegistration = models.BooleanField(default=True)
    jobApprovalRequired = models.BooleanField(default=False)
    companyVerificationRequired = models.BooleanField(default=True)
    maxFileSizeInMb = models.PositiveIntegerField(default=5)
    allowedFileTypes = models.JSONField(default=list)
    cookieConsentRequired = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "System Settings"
        verbose_name_plural = "System Settings"
    
    def __str__(self):
        return "System Settings"
    
    @classmethod
    def get_settings(cls):
        """Получение настроек системы (синглтон)."""
        settings = cls.objects.first()
        if not settings:
            settings = cls.objects.create()
        return settings
