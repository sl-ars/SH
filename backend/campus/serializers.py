from rest_framework import serializers
from .models import Campus, CampusStudent
from users.serializers import UserSerializer

class CampusSerializer(serializers.ModelSerializer):
    admin_details = UserSerializer(source='admin', read_only=True)
    student_count = serializers.SerializerMethodField()

    class Meta:
        model = Campus
        fields = [
            'id', 'name', 'address', 'contact_email', 'contact_phone',
            'created_at', 'updated_at', 'admin', 'admin_details',
            'is_active', 'student_count'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_student_count(self, obj):
        return obj.students.filter(status='active').count()

class CampusStudentSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    campus_name = serializers.CharField(source='campus.name', read_only=True)

    class Meta:
        model = CampusStudent
        fields = [
            'id', 'user', 'user_details', 'campus', 'campus_name',
            'student_id', 'enrollment_date', 'status', 'created_at',
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def validate_student_id(self, value):
        campus = self.context.get('campus')
        if campus:
            if CampusStudent.objects.filter(
                campus=campus,
                student_id=value
            ).exists():
                raise serializers.ValidationError(
                    "This student ID already exists in this campus."
                )
        return value 