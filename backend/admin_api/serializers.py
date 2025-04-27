from rest_framework import serializers
from admin_api.models import ModerationLog, AdminNotification, AdminDashboardSetting, SystemSettings
from django.contrib.auth import get_user_model
from jobs.models import Job
from companies.models import Company
from applications.models import Application

User = get_user_model()

class ModerationLogSerializer(serializers.ModelSerializer):
    admin_email = serializers.EmailField(source='admin.email', read_only=True)
    content_type_name = serializers.CharField(source='content_type.model', read_only=True)
    
    class Meta:
        model = ModerationLog
        fields = ['id', 'admin', 'admin_email', 'action', 'timestamp', 'notes', 
                  'content_type', 'content_type_name', 'object_id']
        read_only_fields = ['admin_email', 'content_type_name']

class AdminNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminNotification
        fields = ['id', 'title', 'message', 'type', 'created_at', 'is_read',
                 'content_type', 'object_id']

class AdminDashboardSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminDashboardSetting
        fields = ['id', 'admin', 'default_filters', 'layout_preferences', 'email_notifications']

class UserAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'role', 'is_active', 'date_joined', 'company', 'company_id', 'university']

class JobAdminSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company', read_only=True)
    created_by_email = serializers.EmailField(source='created_by.email', read_only=True)
    
    class Meta:
        model = Job
        fields = ['id', 'title', 'company', 'company_name', 'location', 'type', 
                  'salary_min', 'salary_max', 'posted_date', 'deadline', 'is_active', 'status',
                  'created_by', 'created_by_email', 'view_count', 'application_count']

class CompanyAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['id', 'name', 'industry', 'location', 'verified', 'featured', 'description', 'website']

class ApplicationAdminSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source='job.title', read_only=True)
    company_name = serializers.CharField(source='job.company', read_only=True)
    applicant_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Application
        fields = ['id', 'job', 'job_title', 'company_name', 'applicant', 
                  'applicant_name', 'status', 'created_at', 'updated_at']
    
    def get_applicant_name(self, obj):
        return f"{obj.applicant.first_name} {obj.applicant.last_name}"

class AdminDashboardStatsSerializer(serializers.Serializer):
    total_users = serializers.IntegerField()
    new_users_today = serializers.IntegerField()
    total_jobs = serializers.IntegerField()
    new_jobs_today = serializers.IntegerField()
    total_applications = serializers.IntegerField()
    new_applications_today = serializers.IntegerField()
    total_companies = serializers.IntegerField()
    new_companies_today = serializers.IntegerField()
    pending_verifications = serializers.IntegerField()
    active_jobs = serializers.IntegerField()
    total_students = serializers.IntegerField()
    total_employers = serializers.IntegerField()

class SystemSettingsSerializer(serializers.ModelSerializer):
    """Сериализатор для системных настроек."""
    class Meta:
        model = SystemSettings
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class BulkUserFileUploadSerializer(serializers.Serializer):
    """
    Serializer for file upload in bulk user registration.
    Used for Swagger documentation to show a file upload field.
    """
    file = serializers.FileField(help_text="XLSX or CSV file containing user data for bulk registration.")

    class Meta:
        # No model needed, just for field definition for Swagger
        pass 