import logging
from functools import wraps

from django.contrib.auth.password_validation import validate_password
from drf_spectacular.utils import (
    extend_schema, OpenApiParameter, OpenApiTypes,
    PolymorphicProxySerializer, extend_schema_view
)
from rest_framework import status, viewsets, permissions, serializers
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import AuthenticationFailed, InvalidToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView
from rest_framework_simplejwt.tokens import UntypedToken
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.settings import api_settings
from django.db import transaction
from core.utils import ok, fail
from users.models import CampusProfile, EmployerProfile, StudentProfile, Resume
from users.serializers import (
    CustomTokenObtainPairSerializer,
    RegisterSerializer,
    UserSerializer,
    TokenRefreshSerializer, TokenVerifySerializer, CampusProfileSerializer, EmployerProfileSerializer,
    StudentProfileSerializer, ResumeSerializer, PublicProfileSerializer, VerifyTokenSerializer, RefreshSerializer,
    ResumeListSerializer, UserSettingsSerializer
)
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import UserSettings, CompanySettings
from .serializers import UserSettingsSerializer, CompanySettingsSerializer
from django.contrib.auth.password_validation import validate_password
from rest_framework.exceptions import ValidationError
from jobs.serializers import JobSerializer

User = get_user_model()
logger = logging.getLogger(__name__)


@extend_schema(
    request=CustomTokenObtainPairSerializer,
    responses={
        200: OpenApiTypes.OBJECT,
        401: OpenApiTypes.OBJECT,
    },
    tags=["authentication"],
    summary="Obtain JWT pair (access + refresh)",
    description="Authenticates the user and returns a JWT access and refresh token pair if credentials are valid."
)
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            return ok(serializer.validated_data, message="Login successful")
        except (AuthenticationFailed, InvalidToken) as e:
            return fail(message=str(e), code=401)


@extend_schema(
    request=VerifyTokenSerializer,
    responses={
        200: OpenApiTypes.OBJECT,
    },
    tags=["authentication"],
    summary="Verify JWT token",
    description="Validates access token and returns user data if valid."
)
class CustomVerifyView(APIView):
    permission_classes = [AllowAny]
    serializer_class = VerifyTokenSerializer

    def post(self, request):
        ser = self.serializer_class(data=request.data)
        if not ser.is_valid():
            return fail("Invalid token", code=401)
        payload = ser.validated_data
        if not payload.get("is_valid"):
            return ok({"is_valid": False}, message="Token invalid")
        return ok(payload, message="Token valid")


@extend_schema(
    request=RefreshSerializer,
    responses={
        200: {
            "type": "object",
            "properties": {
                "access": {"type": "string"},
                "refresh": {"type": "string"},
            }
        },
        401: OpenApiTypes.OBJECT,
    },
    tags=["authentication"],
    summary="Refresh JWT access token",
    description="Refreshes an access token using a valid refresh token."
)
class CustomRefreshView(APIView):
    permission_classes = [AllowAny]
    serializer_class = RefreshSerializer

    def post(self, request):
        raw = request.data.get("refresh")
        if not raw:
            return fail("Missing 'refresh' token")

        try:
            old_refresh = RefreshToken(raw)
        except TokenError:
            return fail("Invalid refresh token", code=401)

        try:
            user = User.objects.get(id=old_refresh["user_id"])
        except User.DoesNotExist:
            return fail("User not found", code=401)

        new_access = str(old_refresh.access_token)

        if api_settings.ROTATE_REFRESH_TOKENS:
            try:
                with transaction.atomic():
                    new_refresh = RefreshToken.for_user(user)

                    if api_settings.BLACKLIST_AFTER_ROTATION:
                        try:
                            old_refresh.blacklist()
                        except AttributeError:
                            logger.warning("simplejwt blacklist app not installed")

            except Exception as e:
                return fail("Failed to rotate token", details=str(e), code=500)

            return ok({"access": str(new_access), "refresh": str(new_refresh)}, message="Token refreshed")

        return ok({"access": str(new_access)}, message="Token refreshed")


@extend_schema(tags=['users'])
class RegisterViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(request=RegisterSerializer, responses={201: UserSerializer})
    def create(self, request):
        creator = request.user
        role_to_create = request.data.get("role")

        if not role_to_create:
            return Response({
                "status": "error",
                "data": {},
                "message": "Missing role field"
            }, status=status.HTTP_400_BAD_REQUEST)

        if creator.role == "admin":
            allowed = True
        elif creator.role == "campus" and role_to_create == "student":
            allowed = True
        else:
            allowed = False

        if not allowed:
            return Response({
                "status": "error",
                "data": {},
                "message": "You do not have permission to register this type of user"
            }, status=status.HTTP_403_FORBIDDEN)

        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "status": "success",
                "data": UserSerializer(user).data,
                "message": "User registered successfully"
            }, status=status.HTTP_201_CREATED)

        return Response({
            "status": "error",
            "data": {},
            "message": "Validation failed",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


@extend_schema_view(
    retrieve=extend_schema(
        summary="Retrieve a public user profile",
        description="Get public profile information for a user by their ID. Does not require authentication. Admin profiles and profiles of roles not explicitly listed (student, employer, campus) are not publicly accessible.",
        parameters=[
            OpenApiParameter("id", OpenApiTypes.INT, OpenApiParameter.PATH,
                             description="A unique integer identifying the user.")
        ],
        responses={
            200: PublicProfileSerializer,
            403: {
                "description": "Forbidden: Admin profiles are not public, or the profile type is not publicly viewable."},
            404: {"description": "User not found"}
        }
    )
)
@extend_schema(tags=['users'])
class ProfileViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]
    queryset = User.objects.all()
    lookup_field = 'id'
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    ME_PROFILE_SERIALIZER_COMPONENT_NAME = 'UserProfileMeResponse'

    def get_permissions(self):
        if self.action == 'retrieve':
            return [AllowAny()]
        return super().get_permissions()

    def _get_profile_info(self, user):
        if user.role == "student":
            profile_model = StudentProfile
            profile_serializer_class = StudentProfileSerializer
        elif user.role == "employer":
            profile_model = EmployerProfile
            profile_serializer_class = EmployerProfileSerializer
        elif user.role == "campus":
            profile_model = CampusProfile
            profile_serializer_class = CampusProfileSerializer
        elif user.role == "admin":
            return user, UserSerializer
        else:
            return None, None

        profile_instance, _ = profile_model.objects.get_or_create(user=user)
        return profile_instance, profile_serializer_class

    @extend_schema(
        summary="Get or update current user's profile",
        description=(
            "Retrieve or partially update the profile for the authenticated user. "
            "The specific profile fields depend on the user's role (student, employer, campus, or admin)."
        ),
        tags=['users'],
        methods=['GET', 'PATCH']
    )
    @extend_schema(methods=['GET'],
        responses={
            200: PolymorphicProxySerializer(
                component_name=ME_PROFILE_SERIALIZER_COMPONENT_NAME,
                serializers={
                    'student': StudentProfileSerializer,
                    'employer': EmployerProfileSerializer,
                    'campus': CampusProfileSerializer,
                    'admin': UserSerializer,
                },
                resource_type_field_name=None
            ),
            400: {"description": "Could not determine profile type for user."},
            401: {"description": "Authentication credentials were not provided."},
        }
    )
    @extend_schema(methods=['PATCH'],
        request=PolymorphicProxySerializer(
            component_name='UserProfileMeUpdate',
            serializers={
                'student': StudentProfileSerializer,
                'employer': EmployerProfileSerializer,
                'campus': CampusProfileSerializer,
                'admin': UserSerializer,
            },
            resource_type_field_name=None
        ),
        responses={
            200: PolymorphicProxySerializer(
                component_name=ME_PROFILE_SERIALIZER_COMPONENT_NAME,
                serializers={
                    'student': StudentProfileSerializer,
                    'employer': EmployerProfileSerializer,
                    'campus': CampusProfileSerializer,
                    'admin': UserSerializer,
                },
                resource_type_field_name=None
            ),
            400: {"description": "Validation error or could not determine profile type."},
            401: {"description": "Authentication credentials were not provided."},
        }
    )
    @action(detail=False, methods=['get', 'patch'], url_path='me')
    def me(self, request):
        user = request.user
        target_instance, profile_serializer_class = self._get_profile_info(user)

        if not profile_serializer_class:
            return fail(message="Could not determine profile type for user.", code=status.HTTP_400_BAD_REQUEST)

        if request.method == "GET":
            serializer = profile_serializer_class(target_instance, context={'request': request})
            return ok(data=serializer.data, message=f"{user.role.capitalize()} profile retrieved successfully")

        elif request.method == "PATCH":
            data_for_serializer = request.data.copy()

            if 'avatar' in request.FILES:
                user.avatar = request.FILES['avatar']
                user.save(update_fields=['avatar'])
                data_for_serializer.pop('avatar', None)
            elif 'avatar' in data_for_serializer and isinstance(data_for_serializer['avatar'], str):
                current_avatar_url = ""
                if user.avatar:
                    try:
                        current_avatar_url = request.build_absolute_uri(user.avatar.url)
                    except ValueError:
                        current_avatar_url = str(user.avatar)
                
                if data_for_serializer['avatar'] != current_avatar_url:
 
                    pass
                data_for_serializer.pop('avatar', None)

            serializer = profile_serializer_class(
                target_instance,
                data=data_for_serializer,
                partial=True,
                context={'request': request}
            )

            if serializer.is_valid():
                serializer.save()
                fresh_serializer = profile_serializer_class(target_instance, context={'request': request})
                return ok(data=fresh_serializer.data, message=f"{user.role.capitalize()} profile updated successfully")
            return fail(message="Validation error", details=serializer.errors, code=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, id=None):
        try:
            user = User.objects.get(id=id)
        except User.DoesNotExist:
            return fail(message="User not found", code=status.HTTP_404_NOT_FOUND)

        if user.role == "admin":
            return fail(message="Admin profiles are not publicly viewable", code=status.HTTP_403_FORBIDDEN)

        if user.role not in ["student", "employer", "campus"]:
            return fail(message=f"Profiles of type '{user.role}' are not publicly viewable", code=status.HTTP_403_FORBIDDEN)
        serializer = PublicProfileSerializer(user, context={'request': request})
        return ok(data=serializer.data, message="Public profile retrieved successfully")

    @extend_schema(
        summary="Get current user's saved jobs",
        description="Retrieve a list of jobs saved by the currently authenticated student.",
        tags=['users', 'jobs'],
        responses={
            200: JobSerializer(many=True),
            401: {"description": "Authentication credentials were not provided."},
            403: {"description": "User is not a student or profile does not exist."}
        }
    )
    @action(detail=False, methods=['get'], url_path='saved-jobs', permission_classes=[IsAuthenticated])
    def saved_jobs(self, request):
        user = request.user
        if user.role != 'student':
            return fail(message="Only students can have saved jobs.", code=status.HTTP_403_FORBIDDEN)
        
        try:
            student_profile = user.student_profile
        except StudentProfile.DoesNotExist:
            return fail(message="Student profile not found.", code=status.HTTP_404_NOT_FOUND)
        
        saved_jobs_queryset = student_profile.saved_jobs.all()
        serializer = JobSerializer(saved_jobs_queryset, many=True, context={'request': request})
        return ok(data=serializer.data, message="Saved jobs retrieved successfully")


@extend_schema(tags=['resumes'])
class ResumeViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'delete']
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return Resume.objects.filter(student__user=self.request.user)

    def get_serializer_class(self):
        if self.action == 'list':
            return ResumeListSerializer
        return ResumeSerializer

    def perform_create(self, serializer):
        student_profile = self.request.user.student_profile
        serializer.save(student=student_profile)

    def get_permissions(self):
        if self.action in ['list', 'create', 'destroy']:
            return [IsAuthenticated()]
        return super().get_permissions()

    @extend_schema(
        operation_id='list_resumes_for_student',
        summary="List resumes",
        description="List all resumes for the authenticated student",
        responses={
            200: ResumeSerializer(many=True)
        }
    )
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return ok(data=serializer.data, message="Resumes retrieved successfully")

    @extend_schema(
        operation_id='upload_resume',
        summary="Upload resume",
        description="Upload a new resume",
        request=ResumeSerializer,
        responses={
            201: ResumeSerializer,
            400: {'description': 'Validation error'}
        }
    )
    def create(self, request, *args, **kwargs):
        if 'file' not in request.FILES:
            return fail(message="No file provided", details={"file": ["This field is required."]})

        serializer = self.get_serializer(data={'file': request.FILES['file']})
        if serializer.is_valid():
            self.perform_create(serializer)
            return ok(data=serializer.data, message="Resume uploaded successfully", code=status.HTTP_201_CREATED)
        return fail(message="Validation error", details=serializer.errors)

    @extend_schema(
        operation_id='delete_resume',
        summary="Delete resume",
        description="Delete a resume",
        responses={
            200: {'description': 'Resume deleted successfully'},
        }
    )
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return ok(data={}, message="Resume deleted successfully")

    @extend_schema(
        operation_id='retrieve_resume',
        summary="Retrieve a specific resume",
        description="Get detailed information about a specific resume by its ID.",
        responses={
            200: ResumeSerializer,
            404: {"description": "Resume not found"}
        }
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)


@extend_schema(tags=['users'])
class UserSettingsViewSet(viewsets.GenericViewSet):
    serializer_class = UserSettingsSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        obj, _ = UserSettings.objects.get_or_create(user=self.request.user)
        return obj

    @extend_schema(
        summary="Get or update current user's settings",
        description="Retrieve or partially update the settings for the authenticated user.",
        tags=['users'],
        methods=['GET', 'PATCH'],
    )
    @extend_schema(methods=['GET'],
        responses={
            200: UserSettingsSerializer,
            401: {"description": "Authentication credentials were not provided."},
            403: {"description": "Permission denied."}
        }
    )
    @extend_schema(methods=['PATCH'],
        request=UserSettingsSerializer,
        responses={
            200: UserSettingsSerializer,
            400: {"description": "Invalid data provided."},
            401: {"description": "Authentication credentials were not provided."},
            403: {"description": "Permission denied."}
        }
    )
    @action(detail=False, methods=["get", "patch"], url_path="me")
    def me(self, request):
        instance = self.get_object()

        if request.method == "GET":
            serializer = self.serializer_class(instance)
            return ok(serializer.data, message="User settings retrieved")

        if request.method == "PATCH":
            serializer = self.serializer_class(instance, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return ok(serializer.data, message="User settings updated")
            return fail(message="Validation error", details=serializer.errors, code=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        summary="Change current user's password",
        description="Allows the authenticated user to change their password.",
        tags=['users'],
        request={
            'application/json': {
                'type': 'object',
                'properties': {
                    'old_password': {'type': 'string', 'format': 'password'},
                    'new_password': {'type': 'string', 'format': 'password'}
                },
                'required': ['old_password', 'new_password']
            }
        },
        responses={
            200: {"description": "Password changed successfully"},
            400: {"description": "Incorrect old password or invalid new password"},
            401: {"description": "Authentication credentials were not provided."},
            403: {"description": "Permission denied."}
        }
    )
    @action(detail=False, methods=["post"], url_path="change-password")
    def change_password(self, request):
        user = request.user
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")

        if not old_password or not new_password:
            return fail(message="Both old_password and new_password are required.", code=status.HTTP_400_BAD_REQUEST)

        if not user.check_password(old_password):
            return fail(message="Incorrect current password", code=status.HTTP_400_BAD_REQUEST)

        try:
            validate_password(new_password, user)
        except ValidationError as e:
            return fail(message="Password validation failed", details=e.messages, code=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()

        return ok(message="Password changed successfully")
