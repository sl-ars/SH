from rest_framework import serializers
from applications.models import Application
from jobs.models import Job
from django.contrib.auth import get_user_model
from users.serializers import ResumeSerializer
from users.models import Resume

User = get_user_model()

class ApplicationSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source='job.title', read_only=True)
    job_company = serializers.CharField(source='job.company', read_only=True)
    applicant = serializers.SerializerMethodField(read_only=True)
    name = serializers.SerializerMethodField(read_only=True)
    position = serializers.SerializerMethodField(read_only=True)
    date = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Application
        fields = ['id', 'job', 'job_title', 'job_company', 'applicant', 'status', 'cover_letter',
                  'resume', 'created_at', 'updated_at', 'interview_date', 'notes',
                  'name', 'position', 'date']
        read_only_fields = ['applicant',
                           'job_title', 'job_company', 'created_at', 'updated_at',
                           'name', 'position', 'date', 'status', 'interview_date']

    
    def get_name(self, obj):
        if hasattr(obj.applicant, 'name') and obj.applicant.name:
            return obj.applicant.name
        return f"{obj.applicant.first_name} {obj.applicant.last_name}"
    
    def get_position(self, obj):
        return obj.job.title
    
    def get_date(self, obj):
        return obj.created_at.strftime('%Y-%m-%d')

    def get_applicant(self, obj):
        user = obj.applicant
        name = f"{user.first_name} {user.last_name}"
        if hasattr(user, 'name') and user.name:
            name = user.name

        return {
            'id': user.id,
            'name': name,
            'email': user.email,
            'phone': getattr(user, 'phone', None)
        }

    def validate(self, data):

        user = self.context['request'].user
        job = data.get('job')
        resume = data.get('resume')

        if self.instance is None:
            if Application.objects.filter(applicant=user, job=job).exists():
                raise serializers.ValidationError("You have already applied for this job.")

            if job and not job.is_active:
                raise serializers.ValidationError("Cannot apply to inactive job.")

            if resume:

                if not hasattr(resume, 'student') or not hasattr(resume.student, 'user') or resume.student.user != user:
                    raise serializers.ValidationError("You can only use your own resume.")
        
        return data
    
    def create(self, validated_data):
        return super().create(validated_data)

class ScheduleInterviewSerializer(serializers.Serializer):
    interview_date = serializers.DateTimeField()
    notes = serializers.CharField(required=False, allow_blank=True, allow_null=True)

class ApplicationDetailSerializer(serializers.ModelSerializer):

    job_title = serializers.CharField(source='job.title', read_only=True)
    job_company = serializers.CharField(source='job.company', read_only=True)
    job_location = serializers.CharField(source='job.location', read_only=True)
    job_type = serializers.CharField(source='job.type', read_only=True)
    job_details = serializers.SerializerMethodField(read_only=True)
    applicant = serializers.SerializerMethodField(read_only=True)
    status_history = serializers.SerializerMethodField(read_only=True)
    resume = ResumeSerializer(read_only=True)

    
    class Meta:
        model = Application
        fields = ['id', 'job', 'job_title', 'job_company', 'job_location', 'job_type',
                  'job_details', 'applicant', 'status', 'interview_status', 'status_history', 'cover_letter', 
                  'resume',  'created_at', 'updated_at', 'interview_date', 'notes']
        read_only_fields = ['job', 'created_at', 'updated_at', 
                           'job_title', 'job_company', 'job_location', 'job_type', 
                           'job_details', 'status_history']
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            if request.user.role == 'student':
                student_read_only_fields = ['status', 'interview_status', 'interview_date', 'notes']
                for field_name in student_read_only_fields:
                    if field_name in self.fields:
                        self.fields[field_name].read_only = True



    
    def get_applicant(self, obj):
        user = obj.applicant
        name = f"{user.first_name} {user.last_name}"
        if hasattr(user, 'name') and user.name:
            name = user.name
        
        return {
            'id': user.id,
            'avatar': user.avatar.url,
            'name': name,
            'email': user.email,
            'phone': getattr(user, 'phone', None)
        }
    

    
    def get_job_details(self, obj):

        job = obj.job
        return {
            'id': job.id,
            'title': job.title,
            'company': job.company,
            'location': job.location,
            'type': job.type,
            'salary_min': job.salary_min,
            'salary_max': job.salary_max,
            'description': job.description,
            'requirements': job.requirements,
        }
    
    def get_status_history(self, obj):
        return [
            {
                'status': obj.status,
                'timestamp': obj.updated_at,
                'notes': obj.notes
            }
        ] 