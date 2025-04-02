from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, StudentProfile, Resume, Education, Experience, EmployerProfile, CampusProfile
from .models import UserSettings, CompanySettings

@admin.register(UserSettings)
class UserSettingsAdmin(admin.ModelAdmin):
    list_display = ('user', 'email_notifications', 'push_notifications', 'two_factor_auth')
    search_fields = ('user__email', 'user__username')
    list_filter = ('email_notifications', 'push_notifications',  'two_factor_auth')

@admin.register(CompanySettings)
class CompanySettingsAdmin(admin.ModelAdmin):
    list_display = ('user', 'company_name', 'company_website')
    search_fields = ('user__email', 'user__username', 'company_name')
    list_filter = ('company_name',)

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ['email', 'name', 'role', 'is_staff', 'is_active']
    list_filter = ['role', 'is_staff', 'is_active']
    search_fields = ['email', 'name']
    ordering = ['email']
    readonly_fields = ('last_login', 'created_at')
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('name', 'role', 'phone', 'avatar', 'university', 'company', 'company_id', 'location')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'created_at')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password', 'password2', 'name', 'role'),
        }),
    )

class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'get_email')
    search_fields = ('user__email', 'user__name')
    list_select_related = ('user',)

    def get_email(self, obj):
        return obj.user.email
    get_email.short_description = 'Email'
    get_email.admin_order_field = 'user__email'

class ResumeAdmin(admin.ModelAdmin):
    list_display = ('student', 'name', 'file', 'created_at')
    search_fields = ('student__user__email', 'name')
    list_filter = ('created_at',)
    list_select_related = ('student__user',)

class EducationAdmin(admin.ModelAdmin):
    list_display = ('student', 'university', 'degree', 'field', 'start_date', 'end_date', 'gpa')
    search_fields = ('student__user__email', 'university', 'degree', 'field')
    list_filter = ('university', 'degree', 'start_date', 'end_date')
    list_select_related = ('student__user',)

class ExperienceAdmin(admin.ModelAdmin):
    list_display = ('student', 'company', 'position', 'start_date', 'end_date', 'current')
    search_fields = ('student__user__email', 'company', 'position')
    list_filter = ('company', 'current', 'start_date', 'end_date')
    list_select_related = ('student__user',)

@admin.register(EmployerProfile)
class EmployerProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'get_company_name', 'industry', 'get_email')
    search_fields = ('user__email', 'company__name', 'industry')
    list_filter = ('industry',)
    list_select_related = ('user', 'company')

    def get_email(self, obj):
        return obj.user.email
    get_email.short_description = 'Email'
    get_email.admin_order_field = 'user__email'

    def get_company_name(self, obj):
        if obj.company:
            return obj.company.name
        return "N/A"
    get_company_name.short_description = 'Company Name' 
    get_company_name.admin_order_field = 'company__name'

class CampusProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'university', 'department', 'position', 'get_email')
    search_fields = ('user__email', 'university', 'department', 'position')
    list_filter = ('university', 'department')
    list_select_related = ('user',)

    def get_email(self, obj):
        return obj.user.email
    get_email.short_description = 'Email'
    get_email.admin_order_field = 'user__email'

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(StudentProfile, StudentProfileAdmin)
admin.site.register(Resume, ResumeAdmin)
admin.site.register(Education, EducationAdmin)
admin.site.register(Experience, ExperienceAdmin)
admin.site.register(CampusProfile, CampusProfileAdmin)
