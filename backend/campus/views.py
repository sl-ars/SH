from django.shortcuts import render
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Count, Q
from django.utils import timezone
from django.contrib.auth import get_user_model
from .models import Campus, CampusStudent
from .serializers import CampusSerializer, CampusStudentSerializer

User = get_user_model()

class IsCampusAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if isinstance(obj, Campus):
            return obj.admin == request.user
        elif isinstance(obj, CampusStudent):
            return obj.campus.admin == request.user
        return False

class CampusViewSet(viewsets.ModelViewSet):
    queryset = Campus.objects.all()
    serializer_class = CampusSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'address', 'contact_email']
    ordering_fields = ['name', 'created_at']

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsCampusAdmin()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(admin=self.request.user)

    @action(detail=True, methods=['post'])
    def register_student(self, request, pk=None):
        campus = self.get_object()
        if campus.admin != request.user:
            return Response(
                {"detail": "Only campus admin can register students"},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = CampusStudentSerializer(
            data=request.data,
            context={'campus': campus}
        )
        if serializer.is_valid():
            serializer.save(campus=campus)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def bulk_register_students(self, request, pk=None):
        campus = self.get_object()
        if campus.admin != request.user:
            return Response(
                {"detail": "Only campus admin can register students"},
                status=status.HTTP_403_FORBIDDEN
            )

        students_data = request.data.get('students', [])
        created_students = []
        errors = []

        for student_data in students_data:
            serializer = CampusStudentSerializer(
                data=student_data,
                context={'campus': campus}
            )
            if serializer.is_valid():
                student = serializer.save(campus=campus)
                created_students.append(serializer.data)
            else:
                errors.append({
                    'data': student_data,
                    'errors': serializer.errors
                })

        return Response({
            'created': created_students,
            'errors': errors
        }, status=status.HTTP_201_CREATED if created_students else status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def students(self, request, pk=None):
        campus = self.get_object()
        status_filter = request.query_params.get('status')
        search_query = request.query_params.get('search')
        
        students = campus.students.all()
        
        if status_filter:
            students = students.filter(status=status_filter)
        
        if search_query:
            students = students.filter(
                Q(user__first_name__icontains=search_query) |
                Q(user__last_name__icontains=search_query) |
                Q(student_id__icontains=search_query)
            )
            
        serializer = CampusStudentSerializer(students, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        campus = self.get_object()
        
        # Get student counts by status
        status_counts = campus.students.values('status').annotate(
            count=Count('id')
        )
        
        # Get new students in last 30 days
        thirty_days_ago = timezone.now() - timezone.timedelta(days=30)
        new_students = campus.students.filter(
            created_at__gte=thirty_days_ago
        ).count()
        
        return Response({
            'total_students': campus.students.count(),
            'status_distribution': status_counts,
            'new_students_last_30_days': new_students,
        })

class CampusStudentViewSet(viewsets.ModelViewSet):
    serializer_class = CampusStudentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['student_id', 'user__first_name', 'user__last_name', 'user__email']
    ordering_fields = ['enrollment_date', 'created_at', 'status']

    def get_queryset(self):
        if self.request.user.administered_campus.exists():
            queryset = CampusStudent.objects.filter(
                campus=self.request.user.administered_campus.first()
            )
            
            # Filter by status
            status = self.request.query_params.get('status', None)
            if status:
                queryset = queryset.filter(status=status)
                
            return queryset
        return CampusStudent.objects.none()

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsCampusAdmin()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        campus = self.request.user.administered_campus.first()
        if not campus:
            raise permissions.PermissionDenied(
                "Only campus admins can create students"
            )
        serializer.save(campus=campus)

    @action(detail=True, methods=['post'])
    def change_status(self, request, pk=None):
        student = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in dict(CampusStudent.STUDENT_STATUS):
            return Response(
                {"detail": "Invalid status"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        student.status = new_status
        student.save()
        
        serializer = self.get_serializer(student)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def bulk_status_change(self, request):
        student_ids = request.data.get('student_ids', [])
        new_status = request.data.get('status')
        
        if not new_status or new_status not in dict(CampusStudent.STUDENT_STATUS):
            return Response(
                {"detail": "Invalid status"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        campus = self.request.user.administered_campus.first()
        if not campus:
            return Response(
                {"detail": "Only campus admins can change student statuses"},
                status=status.HTTP_403_FORBIDDEN
            )
            
        updated_students = CampusStudent.objects.filter(
            id__in=student_ids,
            campus=campus
        ).update(status=new_status)
        
        return Response({
            "detail": f"Updated {updated_students} students"
        })