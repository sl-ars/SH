from django.contrib import admin
from resources.models import Resource, ResourceFile

class ResourceFileInline(admin.TabularInline):
    model = ResourceFile
    extra = 1

@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ('title', 'type', 'category', 'author', 'published_at', 'is_demo')
    list_filter = ('type', 'category', 'is_demo')
    search_fields = ('title', 'description', 'author')
    inlines = [ResourceFileInline]
    readonly_fields = ('views', 'downloads')

@admin.register(ResourceFile)
class ResourceFileAdmin(admin.ModelAdmin):
    list_display = ('title', 'resource', 'file_type', 'size')
    list_filter = ('file_type',)
    search_fields = ('title', 'resource__title')
