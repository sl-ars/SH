from django.contrib import admin
from .models import Campus, CampusStudent

@admin.register(Campus)
class CampusAdmin(admin.ModelAdmin):
    list_display = ('name', 'admin', 'contact_email', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'admin__email', 'contact_email')
    date_hierarchy = 'created_at'

@admin.register(CampusStudent)
class CampusStudentAdmin(admin.ModelAdmin):
    list_display = ('student_id', 'user', 'campus', 'status', 'enrollment_date')
    list_filter = ('status', 'enrollment_date', 'campus')
    search_fields = ('student_id', 'user__email', 'user__first_name', 'user__last_name')
    date_hierarchy = 'enrollment_date'
