from rest_framework import serializers
from jobs.models import Job
from companies.models import Company
from applications.models import Application
from django.db.models import Count
from users.serializers import UserSerializer

class JobSerializer(serializers.ModelSerializer):
    application_stats = serializers.SerializerMethodField(read_only=True)
    company_name = serializers.SerializerMethodField(read_only=True)
    created_by_name = serializers.SerializerMethodField(read_only=True)
    is_applied = serializers.SerializerMethodField(read_only=True)
    is_saved = serializers.SerializerMethodField(read_only=True)
    logo = serializers.ImageField(required=False, allow_null=True)
    
    class Meta:
        model = Job
        fields = '__all__'
        read_only_fields = ['created_by', 'view_count', 'application_count', 'company_name', 
                           'created_by_name', 'application_stats', 'is_applied', 'is_saved']
    
    def get_application_stats(self, obj):

        stats = {}
        if self.context and 'request' in self.context:
            user = self.context['request'].user
            if user.is_authenticated and (user.is_staff or (obj.created_by and obj.created_by.id == user.id)):
                applications = Application.objects.filter(job=obj)
                status_counts = applications.values('status').annotate(count=Count('status'))
                for status_count in status_counts:
                    stats[status_count['status']] = status_count['count']
        return stats
    
    def get_company_name(self, obj):

        return obj.company
    
    def get_created_by_name(self, obj):

        if obj.created_by:
            return f"{obj.created_by.first_name} {obj.created_by.last_name}"
        return None
    
    def get_is_applied(self, obj):

        if self.context and 'request' in self.context:
            user = self.context['request'].user
            if user.is_authenticated and user.role == 'student':
                return Application.objects.filter(job=obj, applicant=user).exists()
        return False
    
    def get_is_saved(self, obj):

        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.role == 'student':
            if hasattr(request.user, 'student_profile') and request.user.student_profile:
                return request.user.student_profile.saved_jobs.filter(pk=obj.pk).exists()
        return False
    
    def validate(self, data):


        deadline = data.get('deadline')
        posted_date = data.get('posted_date')
        
        if deadline and posted_date and deadline < posted_date:
            raise serializers.ValidationError("Deadline must be later than the posting date.")
        if 'requirements' in data and not data.get('requirements'):
            raise serializers.ValidationError("Job requirements must be specified.")
        
        return data
    
    def create(self, validated_data):

        request = self.context.get('request')
        if request and request.user.is_authenticated:
            if request.user.role == 'employer' and not validated_data.get('company_id'):
                companies = Company.objects.filter(id=1)
                if companies.exists():
                    validated_data['company'] = companies.first().name
                    validated_data['company_id'] = companies.first().id
        
        return super().create(validated_data)

class JobListSerializer(serializers.ModelSerializer):
    company_name = serializers.SerializerMethodField(read_only=True)
    is_saved = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Job
        fields = ['id', 'title', 'company', 'company_name', 'location', 'type', 'industry', 'salary_min', 'salary_max',
                 'posted_date', 'deadline', 'is_active', 'featured', 'view_count', 
                 'application_count', 'is_saved']
    
    def get_company_name(self, obj):
        return obj.company

    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.role == 'student':
            if hasattr(request.user, 'student_profile') and request.user.student_profile:
                return request.user.student_profile.saved_jobs.filter(pk=obj.pk).exists()
        return False
