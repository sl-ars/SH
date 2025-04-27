from django.shortcuts import render
from rest_framework import viewsets, status, filters, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, F
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes
from resources.models import Resource, ResourceFile
from resources.serializers import ResourceSerializer, ResourceFileSerializer
from resources.permissions import ResourcePermissions
from rest_framework.parsers import MultiPartParser, FormParser

@extend_schema(tags=['resources'])
class ResourceViewSet(viewsets.ModelViewSet):
    queryset = Resource.objects.all().prefetch_related('files')
    serializer_class = ResourceSerializer
    permission_classes = [ResourcePermissions]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = {
        'category': ['exact'],
        'type': ['exact'],
        'is_demo': ['exact'],
        'author__id': ['exact'],
    }
    search_fields = ['title']
    ordering_fields = ['published_at', 'views', 'downloads', 'title', 'category', 'type', 'estimated_time']
    ordering = ['-published_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user

        if not user.is_authenticated:
            queryset = queryset.filter(is_demo=True)
        
        return queryset

    def perform_create(self, serializer):
        serializer.save(author=self.request.user, created_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save()

    @extend_schema(
        summary="Increment view count for a resource",
        request=None,
        responses={200: ResourceSerializer}
    )
    @action(detail=True, methods=['post'])
    def view(self, request, pk=None):
        resource = self.get_object()
        Resource.objects.filter(pk=pk).update(views=F('views') + 1)
        resource.refresh_from_db()
        serializer = self.get_serializer(resource)
        return Response(serializer.data)

    @extend_schema(
        summary="List all distinct resource categories",
        description="Retrieves a list of unique category names available for resources.",
        responses={200: {'type': 'array', 'items': {'type': 'string'}}}
    )
    @action(detail=False, methods=['get'])
    def categories(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        categories = queryset.values_list('category', flat=True).distinct().order_by('category')
        return Response(list(categories))

    @extend_schema(
        summary="List all distinct resource types",
        description="Retrieves a list of unique type names available for resources.",
        responses={200: {'type': 'array', 'items': {'type': 'string'}}}
    )
    @action(detail=False, methods=['get'])
    def types(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        types = queryset.values_list('type', flat=True).distinct().order_by('type')
        return Response(list(types))

@extend_schema(tags=['resource-files'])
class ResourceFileViewSet(viewsets.ModelViewSet):
    queryset = ResourceFile.objects.all()
    serializer_class = ResourceFileSerializer
    permission_classes = [ResourcePermissions]
    parser_classes = [MultiPartParser, FormParser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = {
        'resource': ['exact'],
        'file_type': ['exact'],
        'uploaded_by__id': ['exact'],
    }
    search_fields = ['title', 'resource__title']
    ordering_fields = ['created_at', 'title', 'size', 'file_type']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user

        if not user.is_authenticated:
            queryset = queryset.filter(resource__is_demo=True)
        
        return queryset

    def perform_create(self, serializer):
        resource_id = self.request.data.get('resource')
        if resource_id:
            try:
                resource = Resource.objects.get(pk=resource_id)
                if not self.permission_classes[0]().has_object_permission(self.request, self, resource):
                    self.permission_denied(
                        self.request, message='You do not have permission to add files to this resource.'
                    )
            except Resource.DoesNotExist:
                raise serializers.ValidationError({"resource": "Resource not found."})
        else:
            raise serializers.ValidationError({"resource": "This field is required."})

        serializer.save(uploaded_by=self.request.user)

    @extend_schema(
        summary="Download a resource file",
        description="Retrieves a resource file and increments the parent resource's download count.",
        responses={
            200: {'description': 'File download initiated', 'content': {'application/*': {'schema': {'type': 'string', 'format': 'binary'}}}},
            404: {'description': 'File not found.'}
        }
    )
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        instance = self.get_object()

        if not instance.resource.is_demo and not request.user.is_authenticated:
            self.permission_denied(request, message='Authentication required to download this file.')

        Resource.objects.filter(pk=instance.resource.pk).update(downloads=F('downloads') + 1)
        
        if instance.file:
            file_url = request.build_absolute_uri(instance.file.url)
            return Response({
                'message': 'File download ready.',
                'file_url': file_url,
                'open_in_new_tab': instance.open_in_new_tab
            }, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'File not found.'}, status=status.HTTP_404_NOT_FOUND)
