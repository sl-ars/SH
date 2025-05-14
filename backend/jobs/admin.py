from django.contrib import admin
from .models import Job

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = (
        'title', 
        'company', 
        'type', 
        'industry', 
        'location',
        'salary_min',
        'salary_max',
        'posted_date', 
        'deadline', 
        'is_active', 
        'featured',
        'created_by',
        'view_count',
        'application_count'
    )
    list_filter = (
        'is_active',
        'featured',
        'type', 
        'industry', 
        'location',
        'created_by',
    )
    search_fields = (
        'title', 
        'company', 
        'description',
        'location',
    )
    ordering = ('-posted_date',)
    readonly_fields = (
        'posted_date', 
        'view_count', 
        'application_count',
    )
    
    fieldsets = (
        (None, {
            'fields': ('title', 'company', 'company_id', 'created_by')
        }),
        ('Job Details', {
            'fields': ('description', 'requirements', 'responsibilities', 'benefits', 'logo')
        }),
        ('Categorization & Type', {
            'fields': ('industry', 'type', 'location')
        }),
        ('Salary & Dates', {
            'fields': ('salary_min', 'salary_max', 'posted_date', 'deadline')
        }),
        ('Status & Visibility', {
            'fields': ('is_active', 'featured', 'status')
        }),
        ('Analytics (Read-Only)', {
            'fields': ('view_count', 'application_count'),
            'classes': ('collapse',), # Collapsible section
        }),
    )

    def get_queryset(self, request):
        # Prefetch related user for created_by to optimize admin display
        return super().get_queryset(request).select_related('created_by')

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        # Optionally, you might want to limit choices for 'created_by' if needed
        # For example, to only users with an 'employer' role, if you have such a role field.
        # if db_field.name == "created_by":
        #     kwargs["queryset"] = User.objects.filter(role='employer') # Example
        return super().formfield_for_foreignkey(db_field, request, **kwargs)
