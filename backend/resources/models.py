from django.db import models
from django.contrib.auth import get_user_model
import uuid

from core.storage import PublicAssetStorage

User = get_user_model()

class Resource(models.Model):
    RESOURCE_TYPES = [
        ('Guide', 'Guide'),
        ('Video Course', 'Video Course'),
        ('Webinar', 'Webinar'),
        ('E-book', 'E-book'),
        ('Article', 'Article'),
        ('Workshop', 'Workshop'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField()
    type = models.CharField(max_length=50, choices=RESOURCE_TYPES)
    content = models.TextField(blank=True)
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='authored_resources_content')
    published_at = models.DateTimeField(auto_now_add=True)
    estimated_time = models.CharField(max_length=50)
    category = models.CharField(max_length=100)
    tags = models.JSONField(default=list)
    is_demo = models.BooleanField(default=False)
    views = models.IntegerField(default=0)
    downloads = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_resources_entries')

    class Meta:
        ordering = ['-published_at']

    def __str__(self):
        return self.title

class ResourceFile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name='files')
    title = models.CharField(max_length=255)
    file = models.FileField(storage=PublicAssetStorage(), upload_to='resources/')
    file_type = models.CharField(max_length=50)
    size = models.BigIntegerField(default=0, help_text="File size in bytes")
    open_in_new_tab = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='uploaded_resource_files')

    def __str__(self):
        return f"{self.title} - {self.resource.title}"
