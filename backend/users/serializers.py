from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import (
    TokenObtainPairSerializer,
    TokenVerifySerializer as BaseTokenVerifySerializer,
    TokenRefreshSerializer as BaseTokenRefreshSerializer
)
from rest_framework_simplejwt.settings import api_settings
from rest_framework_simplejwt.tokens import (
    AccessToken,
    RefreshToken,
    UntypedToken,
)
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

from users.models import (
    CustomUser,
    Education,
    Experience,
    StudentProfile,
    EmployerProfile,
    CampusProfile,
    Resume, UserSettings, CompanySettings
)
from companies.models import Company

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(use_url=True, required=False, allow_null=True)

    class Meta:
        model = CustomUser
        fields = [
            'id', 'email', 'name', 'role', 'avatar',
            'phone', 'location', 'university', 'company',
            'company_id', 'created_at', 'last_login', 'is_active'
        ]


class RegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['email', 'name', 'password', 'password2', 'role']
        extra_kwargs = {
            'password': {'write_only': True},
            'role': {'required': True}
        }

    def validate(self, data):
        if data["password"] != data["password2"]:
            raise serializers.ValidationError("Passwords do not match.")
        return data

    def create(self, validated_data):
        validated_data.pop("password2")
        user = CustomUser.objects.create_user(**validated_data)
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user).data
        return data


class TokenVerifySerializer(BaseTokenVerifySerializer):
    def validate(self, attrs):
        try:
            from rest_framework_simplejwt.tokens import AccessToken
            token_str = attrs["token"]
            token = AccessToken(token_str)
            user_id = token.payload.get("user_id")
            if not user_id:
                raise serializers.ValidationError("Token contains no user_id.", code="no_user_id_in_token")

            user = CustomUser.objects.get(id=user_id)
            return {
                "isValid": True,
                "user": UserSerializer(user).data
            }
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError("User not found for this token.", code="user_not_found")
        except TokenError as e:
            raise serializers.ValidationError(str(e), code="token_not_valid")
        except Exception as e:
            raise serializers.ValidationError("Token verification failed due to an unexpected error.",
                                              code="token_verify_error")


class TokenRefreshSerializer(BaseTokenRefreshSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        return {
            "access": data["access"]
        }

class DateTrimMixin:
    def to_internal_value(self, data):
        data = super().to_internal_value(data)
        if isinstance(data, dict):
            if 'start_date' in data and isinstance(data['start_date'], str):
                if len(data['start_date']) == 7:
                    data['start_date'] = f"{data['start_date']}-01"

            if 'end_date' in data and isinstance(data['end_date'], str):
                if len(data['end_date']) == 7:
                    data['end_date'] = f"{data['end_date']}-01"
        return data

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        if ret.get('start_date') and isinstance(ret['start_date'], str):
            ret['start_date'] = ret['start_date'][:7]

        if ret.get('end_date') and isinstance(ret['end_date'], str):
            ret['end_date'] = ret['end_date'][:7]
        return ret

class EducationSerializer(DateTrimMixin, serializers.ModelSerializer):
    start_date = serializers.DateField(
        input_formats=['%Y-%m', '%Y-%m-%d'],
        required=True
    )
    end_date = serializers.DateField(
        input_formats=['%Y-%m', '%Y-%m-%d'],
        required=False,
        allow_null=True
    )

    class Meta:
        model = Education
        fields = "__all__"
        read_only_fields = ["student"]


class ExperienceSerializer(DateTrimMixin, serializers.ModelSerializer):
    start_date = serializers.DateField(
        input_formats=['%Y-%m', '%Y-%m-%d'],
        required=True
    )
    end_date = serializers.DateField(
        input_formats=['%Y-%m', '%Y-%m-%d'],
        required=False,
        allow_null=True
    )

    class Meta:
        model = Experience
        fields = "__all__"
        read_only_fields = ["student"]

class BaseProfileSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="user.name", required=False, allow_blank=True, allow_null=True)
    email = serializers.EmailField(source="user.email", required=False, allow_blank=True, allow_null=True)
    avatar = serializers.ImageField(source="user.avatar", required=False, allow_null=True)
    phone = serializers.CharField(source="user.phone", required=False, allow_blank=True, allow_null=True)
    location = serializers.CharField(source="user.location", required=False, allow_blank=True, allow_null=True)
    university = serializers.CharField(source="user.university", required=False, allow_blank=True, allow_null=True)
    company = serializers.CharField(source="user.company", required=False, allow_blank=True, allow_null=True)
    id = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    created_at = serializers.SerializerMethodField()
    last_login = serializers.SerializerMethodField()
    is_active = serializers.SerializerMethodField()

    def get_id(self, obj):
        return obj.user.id

    def get_role(self, obj):
        return obj.user.role

    def get_created_at(self, obj):
        return obj.user.created_at

    def get_last_login(self, obj):
        return obj.user.last_login

    def get_is_active(self, obj):
        return obj.user.is_active

    def _update_user_fields(self, instance, validated_data):
        user_data_from_payload = validated_data.pop("user", {})
        user_fields_on_base = ['name', 'email', 'avatar', 'phone', 'location', 'university', 'company']
        user_changed = False
        for field_name in user_fields_on_base:
            if field_name in validated_data:
                value = validated_data.pop(field_name)
                if value is not None or field_name == 'avatar':
                    setattr(instance.user, field_name, value)
                    user_changed = True

        for attr, value in user_data_from_payload.items():
            if hasattr(instance.user, attr) and (value is not None or attr == 'avatar'):
                setattr(instance.user, attr, value)
                user_changed = True

        if user_changed:
            instance.user.save()

    def _update_profile_fields(self, instance, validated_data):
        self._update_user_fields(instance, validated_data)
        for attr, value in validated_data.items():
            if hasattr(instance, attr) and value is not None:
                setattr(instance, attr, value)
            elif hasattr(instance, attr) and value is None and self.fields[attr].allow_null:
                setattr(instance, attr, value)
        instance.save()
        return instance

    def validate(self, data):
        if 'user' in data and 'avatar' in data['user']:
            del data['user']['avatar']
        return data

class ResumeSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = Resume
        fields = ['id', 'name', 'created_at', 'file', 'url']
        read_only_fields = ['id', 'created_at', 'name', 'url']

    def get_url(self, obj):
        if obj.file:
            try:
                return obj.file.url
            except ValueError:
                return None
        return None

    def validate_file(self, value):
        if not value:
            raise serializers.ValidationError("No file was submitted.")
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("File size must be less than 5MB")
        valid_types = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ]
        if value.content_type not in valid_types:
            raise serializers.ValidationError(
                "File type not supported. Please upload a PDF, DOC, or DOCX file."
            )

        return value


class ResumeListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = ['id', 'name', 'created_at']
        read_only_fields = ['id', 'name', 'created_at']


STUDENT_COMPLETENESS_CHECKS = {
    'name': lambda user, profile: bool(user.name and user.name.strip()),
    'avatar': lambda user, profile: bool(user.avatar),
    'phone': lambda user, profile: bool(user.phone and user.phone.strip()),
    'location': lambda user, profile: bool(user.location and user.location.strip()),
    'university_affiliation': lambda user, profile: bool(user.university and user.university.strip()),
    'bio': lambda user, profile: bool(profile.bio and profile.bio.strip()),
    'skills': lambda user, profile: bool(profile.skills),
    'achievements': lambda user, profile: bool(profile.achievements),
    'resumes': lambda user, profile: profile.resumes.exists(),
    'education_history': lambda user, profile: profile.education.exists(),
    'work_experience': lambda user, profile: profile.experience.exists(),
}
STUDENT_FIELD_FRIENDLY_NAMES = {
    'name': "Full Name",
    'avatar': "Profile Picture",
    'phone': "Phone Number",
    'location': "Location",
    'university_affiliation': "Primary University",
    'bio': "Biography",
    'skills': "Skills",
    'achievements': "Achievements",
    'resumes': "At least one Resume",
    'education_history': "Education History (at least one entry)",
    'work_experience': "Work Experience (at least one entry)",
}

class StudentProfileSerializer(BaseProfileSerializer):
    education = EducationSerializer(many=True, required=False)
    experience = ExperienceSerializer(many=True, required=False)
    skills = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        allow_empty=True,
        default=list
    )
    achievements = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        allow_empty=True,
        default=list
    )
    bio = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    resumes = ResumeListSerializer(many=True, read_only=True)
    profile_completeness_percentage = serializers.SerializerMethodField()
    missing_profile_fields = serializers.SerializerMethodField()

    class Meta:
        model = StudentProfile
        fields = [
            "id", "name", "email", "role", "avatar", "phone", "location",
            "university", "company", "created_at", "last_login", "is_active",
            "bio", "skills", "resumes", "education", "experience", "achievements",
            "profile_completeness_percentage", "missing_profile_fields"
        ]
        read_only_fields = ["id", "email", "role", "created_at", "last_login", "is_active"]

    def _get_completeness_info(self, obj: StudentProfile):
        user = obj.user
        filled_fields_count = 0
        missing_field_keys = []
        total_fields = len(STUDENT_COMPLETENESS_CHECKS)

        for field_key, check_func in STUDENT_COMPLETENESS_CHECKS.items():
            is_filled = check_func(user, obj)
            if is_filled:
                filled_fields_count += 1
            else:
                missing_field_keys.append(STUDENT_FIELD_FRIENDLY_NAMES.get(field_key, field_key))
        
        percentage = (filled_fields_count / total_fields) * 100 if total_fields > 0 else 0
        return round(percentage, 2), missing_field_keys

    def get_profile_completeness_percentage(self, obj: StudentProfile):
        if obj.user.role != 'student':
            return None
        percentage, _ = self._get_completeness_info(obj)
        return percentage

    def get_missing_profile_fields(self, obj: StudentProfile):
        if obj.user.role != 'student':
            return []
        _, missing_fields = self._get_completeness_info(obj)
        return missing_fields

    def update(self, instance, validated_data):
        education_data = validated_data.pop("education", None)
        experience_data = validated_data.pop("experience", None)

        instance = self._update_profile_fields(instance, validated_data)

        if education_data is not None:
            existing_items_qs = instance.education.all()
            existing_item_ids = set(existing_items_qs.values_list('id', flat=True))
            payload_item_ids = set()

            for item_payload in education_data:
                item_id = item_payload.get('id')
                if item_id:
                    payload_item_ids.add(item_id)
                    try:
                        item_instance = existing_items_qs.get(id=item_id, student=instance)
                        for attr, value in item_payload.items():
                            if attr == 'id': continue
                            setattr(item_instance, attr, value)
                        item_instance.full_clean()
                        item_instance.save()
                    except Education.DoesNotExist:







                        Education.objects.create(student=instance, **item_payload)
                else:
                    new_item = Education.objects.create(student=instance, **item_payload)
                    payload_item_ids.add(new_item.id)

            ids_to_delete = existing_item_ids - payload_item_ids
            if ids_to_delete:
                instance.education.filter(id__in=ids_to_delete).delete()

        if experience_data is not None:
            existing_items_qs = instance.experience.all()
            existing_item_ids = set(existing_items_qs.values_list('id', flat=True))
            payload_item_ids = set()

            for item_payload in experience_data:
                item_id = item_payload.get('id')
                if item_id:
                    payload_item_ids.add(item_id)
                    try:
                        item_instance = existing_items_qs.get(id=item_id, student=instance)
                        for attr, value in item_payload.items():
                            if attr == 'id': continue
                            setattr(item_instance, attr, value)
                        item_instance.full_clean()
                        item_instance.save()
                    except Experience.DoesNotExist:
                        Experience.objects.create(student=instance, **item_payload)
                else:
                    new_item = Experience.objects.create(student=instance, **item_payload)
                    payload_item_ids.add(new_item.id)
            
            ids_to_delete = existing_item_ids - payload_item_ids
            if ids_to_delete:
                instance.experience.filter(id__in=ids_to_delete).delete()

        return instance


class EmployerProfileSerializer(BaseProfileSerializer):
    company_name_display = serializers.CharField(source='company.name', read_only=True, allow_null=True)
    company_id = serializers.PrimaryKeyRelatedField(
        queryset=Company.objects.all(), 
        source='company', 
        allow_null=True, 
        required=False, 
        write_only=True
    )

    class Meta:
        model = EmployerProfile
        fields = [
            "id", "name", "email", "role", "avatar", "phone", "location",
            "university", "company",
            "created_at", "last_login", "is_active",
            
            "company_id",
            "company_name_display",# Output for EmployerProfile.company.name
            "industry", "website", "description" # Fields on EmployerProfile model
        ]
        read_only_fields = ["id", "email", "role", "created_at", "last_login", "is_active", "company_name_display"]

    def update(self, instance: EmployerProfile, validated_data):
        industry = validated_data.get('industry', instance.industry)
        website = validated_data.get('website', instance.website)
        description = validated_data.get('description', instance.description)


        instance = self._update_profile_fields(instance, validated_data)

        linked_company_object = instance.company

        if linked_company_object:



            changed_company_attrs = False
            if 'industry' in validated_data and industry is not None:
                linked_company_object.industry = industry
                changed_company_attrs = True
            if 'website' in validated_data and website is not None:
                linked_company_object.website = website
                changed_company_attrs = True

            if 'description' in validated_data and description is not None: 
                linked_company_object.description = description
                changed_company_attrs = True

            user_location = validated_data.get('user', {}).get('location', instance.user.location)
            if user_location is not None and linked_company_object.location != user_location:
                linked_company_object.location = user_location
                changed_company_attrs = True
            
            if changed_company_attrs:
                linked_company_object.save()
            instance.user.company = linked_company_object.name
            instance.user.company_id = str(linked_company_object.id)
        else:
            instance.user.company = None
            instance.user.company_id = None
        
        instance.user.save()




        return instance


class CampusProfileSerializer(BaseProfileSerializer):
    university = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = CampusProfile
        fields = [
            "id", "name", "email", "role", "avatar", "phone", "location",
            "university",
            "company",
            "created_at", "last_login", "is_active",
            "department", "position"
        ]
        read_only_fields = ["id", "email", "role", "created_at", "last_login", "is_active"]

    def update(self, instance, validated_data):
        return self._update_profile_fields(instance, validated_data)




class PublicProfileSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(read_only=True, use_url=True)

    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'role', 'avatar']


class VerifyTokenSerializer(serializers.Serializer):
    token = serializers.CharField()

    def validate(self, attrs):
        tok = attrs["token"]
        try:
            UntypedToken(tok)
            validated = AccessToken(tok)
            user_id = validated.get(api_settings.USER_ID_CLAIM)
            user = User.objects.get(pk=user_id)
            return {"is_valid": True, "user": UserSerializer(user).data}
        except (TokenError, InvalidToken, User.DoesNotExist):

            return {"is_valid": False}


class RefreshSerializer(serializers.Serializer):
    refresh = serializers.CharField(help_text="Refresh token issued by the server.")


class UserSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSettings
        fields = [
           'email_notifications', 'push_notifications', 'two_factor_auth',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class CompanySettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanySettings
        fields = [
            'company_name', 'company_website',
            'company_description'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class PublicEducationSerializer(serializers.ModelSerializer):
    start_date = serializers.DateField(format="%Y-%m", input_formats=['%Y-%m', '%Y-%m-%d'], allow_null=True, required=False)
    end_date = serializers.DateField(format="%Y-%m", input_formats=['%Y-%m', '%Y-%m-%d'], allow_null=True, required=False)
    class Meta:
        model = Education
        fields = ['university', 'degree', 'field', 'start_date', 'end_date', 'gpa']

class PublicExperienceSerializer(serializers.ModelSerializer):
    start_date = serializers.DateField(format="%Y-%m", input_formats=['%Y-%m', '%Y-%m-%d'], allow_null=True, required=False)
    end_date = serializers.DateField(format="%Y-%m", input_formats=['%Y-%m', '%Y-%m-%d'], allow_null=True, required=False)
    class Meta:
        model = Experience
        fields = ['company', 'position', 'start_date', 'end_date', 'current', 'description']

class PublicStudentDataSerializer(serializers.ModelSerializer):
    education = PublicEducationSerializer(many=True, read_only=True, source='education.all')
    experience = PublicExperienceSerializer(many=True, read_only=True, source='experience.all')

    class Meta:
        model = StudentProfile
        fields = ['bio', 'skills', 'achievements', 'education', 'experience']

class PublicCompanyDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['name', 'logo', 'industry', 'website', 'description', 'location']
        extra_kwargs = {
            'logo': {'use_url': True, 'required': False, 'allow_null': True},
            'industry': {'required': False, 'allow_null': True, 'allow_blank': True},
            'website': {'required': False, 'allow_null': True, 'allow_blank': True},
            'description': {'required': False, 'allow_null': True, 'allow_blank': True},
            'location': {'required': False, 'allow_null': True, 'allow_blank': True},
        }

class PublicEmployerDataSerializer(serializers.ModelSerializer):
    company_details = PublicCompanyDataSerializer(source='company', read_only=True, allow_null=True)
    class Meta:
        model = EmployerProfile
        fields = [
            'industry',
            'website',
            'description',
            'company_details'
        ]

class PublicCampusDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = CampusProfile
        fields = ['department', 'position']
class PublicProfileSerializer(serializers.ModelSerializer):

    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(read_only=True)
    role = serializers.CharField(read_only=True)
    avatar = serializers.ImageField(read_only=True, use_url=True, allow_null=True, required=False)
    location = serializers.CharField(read_only=True, allow_blank=True, allow_null=True, required=False)
    university = serializers.CharField(read_only=True, allow_blank=True, allow_null=True, required=False)

    student_info = PublicStudentDataSerializer(source='student_profile', read_only=True, required=False, allow_null=True)
    employer_info = PublicEmployerDataSerializer(source='employer_profile', read_only=True, required=False, allow_null=True)
    campus_info = PublicCampusDataSerializer(source='campus_profile', read_only=True, required=False, allow_null=True)

    class Meta:
        model = User
        fields = [
            'id', 'name', 'role', 'avatar', 'location', 'university',
            'student_info', 'employer_info', 'campus_info'
        ]


    def to_representation(self, instance):
        representation = super().to_representation(instance)
        role = instance.role

        if role != 'student':
            representation.pop('student_info', None)
        if role != 'employer':
            representation.pop('employer_info', None)
        if role != 'campus':
            representation.pop('campus_info', None)


             
        return representation
