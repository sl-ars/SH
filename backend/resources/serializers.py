from rest_framework import serializers
from resources.models import Resource, ResourceFile
from users.serializers import UserSerializer

class ResourceFileSerializer(serializers.ModelSerializer):
    uploaded_by = UserSerializer(read_only=True)
    file_url = serializers.SerializerMethodField()
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True, allow_null=True)
    resource = serializers.PrimaryKeyRelatedField(queryset=Resource.objects.all(), required=True)

    class Meta:
        model = ResourceFile
        fields = [
            'id', 'resource', 'title', 'file', 'file_url', 'file_type', 
            'size', 'created_at', 'uploaded_by', 'uploaded_by_name', 'open_in_new_tab'
        ]
        read_only_fields = ['id', 'file_url', 'size', 'created_at', 'uploaded_by', 'uploaded_by_name']
        extra_kwargs = {
            'file_type': {'required': False, 'allow_blank': True, 'allow_null': True},
            'title': {'required': False, 'allow_blank': True, 'allow_null': True}
        }

    def get_file_url(self, obj):
        request = self.context.get('request')
        if request and obj.file:
            return request.build_absolute_uri(obj.file.url)
        return None

class ResourceSerializer(serializers.ModelSerializer):
    files = ResourceFileSerializer(many=True, read_only=True)
    author = UserSerializer(read_only=True)
    created_by = UserSerializer(read_only=True)
    published_at = serializers.DateTimeField(format="%Y-%m-%d", read_only=True)
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    category_display = serializers.CharField(source='category', read_only=True)
    estimated_time_display = serializers.CharField(source='estimated_time', read_only=True)
    type_choices = Resource.RESOURCE_TYPES
    type_help_text = "Available types: " + ", ".join([choice[0] for choice in type_choices])
    type = serializers.ChoiceField(choices=type_choices, help_text=type_help_text)

    class Meta:
        model = Resource
        fields = [
            'id', 'title', 'description', 'type', 'type_display', 'content', 'author',
            'published_at', 'estimated_time', 'estimated_time_display', 
            'category', 'category_display', 'tags',
            'is_demo', 'views', 'downloads', 'files', 'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'views', 'downloads', 'author', 'created_by', 'published_at', 'created_at', 'updated_at',
            'type_display', 'category_display', 'estimated_time_display'
        ] 