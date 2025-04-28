# serializers.py

from rest_framework import serializers
from companies.models import Company
from jobs.models import Job  # Import the Job model
from jobs.serializers import JobSerializer  # Import the JobSerializer

class CompanySerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='name', read_only=True)
    company = serializers.CharField(source='name', read_only=True)
    company_id = serializers.CharField(read_only=True)
    jobs = serializers.SerializerMethodField()
    similar_companies = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = '__all__'

    def get_jobs(self, obj):
        from jobs.models import Job
        from jobs.serializers import JobSerializer
        jobs = Job.objects.filter(company_id=str(obj.id), is_active=True)
        return JobSerializer(jobs, many=True, context=self.context).data

    def get_similar_companies(self, obj):
        similar = Company.objects.filter(
            industry=obj.industry,
            location=obj.location
        ).exclude(id=obj.id)[:3]
        return [
            {
                'id': c.id,
                'name': c.name,
                'industry': c.industry,
                'location': c.location,
                'logo': c.logo.url if c.logo else None
            }
            for c in similar
        ]
