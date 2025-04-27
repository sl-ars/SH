from django.contrib import admin
from admin_api.models import ModerationLog, AdminNotification, AdminDashboardSetting

@admin.register(ModerationLog)
class ModerationLogAdmin(admin.ModelAdmin):
    list_display = ['admin', 'action', 'timestamp', 'content_type', 'object_id']
    list_filter = ['action', 'timestamp', 'admin']
    search_fields = ['notes', 'admin__email']
    date_hierarchy = 'timestamp'

@admin.register(AdminNotification)
class AdminNotificationAdmin(admin.ModelAdmin):
    list_display = ['title', 'type', 'created_at', 'is_read']
    list_filter = ['type', 'is_read', 'created_at']
    search_fields = ['title', 'message']
    date_hierarchy = 'created_at'

@admin.register(AdminDashboardSetting)
class AdminDashboardSettingAdmin(admin.ModelAdmin):
    list_display = ['admin', 'email_notifications']
    list_filter = ['email_notifications']
    search_fields = ['admin__email']
