from rest_framework import serializers
from analytics.models import JobView, JobApplicationMetrics, EmployerMetrics
from users.serializers import UserSerializer
from jobs.serializers import JobSerializer
from applications.serializers import ApplicationSerializer

class JobViewSerializer(serializers.ModelSerializer):
    viewer = UserSerializer(read_only=True)
    job = JobSerializer(read_only=True)

    class Meta:
        model = JobView
        fields = ['id', 'job', 'viewer', 'ip_address', 'duration', 'viewed_at']
        read_only_fields = ['id', 'job', 'viewer', 'ip_address', 'viewed_at', 'duration']

class JobApplicationMetricsSerializer(serializers.ModelSerializer):
    job = JobSerializer(read_only=True)
    application = ApplicationSerializer(read_only=True)

    class Meta:
        model = JobApplicationMetrics
        fields = ['id', 'job', 'application', 'source', 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'job', 'application', 'created_at', 'updated_at']

class EmployerMetricsSerializer(serializers.ModelSerializer):
    employer = UserSerializer(read_only=True)

    class Meta:
        model = EmployerMetrics
        fields = ['id', 'employer', 'total_jobs', 'total_applications',
                 'total_interviews', 'total_hires', 'average_time_to_hire',
                 'created_at', 'updated_at']
        read_only_fields = ['id', 'employer', 'created_at', 'updated_at', 'total_jobs', 
                            'total_applications', 'total_interviews', 'total_hires', 'average_time_to_hire'] 