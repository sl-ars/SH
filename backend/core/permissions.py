from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminOrReadOnly(BasePermission):
    """
    Allows access only to admin users, or read-only access to other users.
    """

    def has_permission(self, request, view):
        return bool(
            request.method in SAFE_METHODS or
            request.user and request.user.is_staff
        )


class IsOwnerOrReadOnly(BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    Assumes the model instance has an `owner` attribute.
    """

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.owner == request.user


class IsAuthenticatedOrReadOnly(BasePermission):
    """
    Allows access only to authenticated users, or read-only access to other users.
    """

    def has_permission(self, request, view):
        return bool(
            request.method in SAFE_METHODS or
            request.user and request.user.is_authenticated
        )


class IsSuperUser(BasePermission):
    """
    Allows access only to superusers.
    """

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_superuser)


class IsAdminUser(BasePermission):
    """
    Allows access only to admin users (is_staff).
    """

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_staff)


class IsAuthenticated(BasePermission):
    """
    Allows access only to authenticated users.
    """

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)


class AllowAny(BasePermission):
    """
    Allow any access.
    This isn't strictly needed, as DRF defaults to AllowAny.
    But it can be useful to be explicit.
    """

    def has_permission(self, request, view):
        return True


class IsStudent(BasePermission):
    """
    Allows access only to users with the 'student' role.
    """

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'student')


class IsEmployer(BasePermission):
    """
    Allows access only to users with the 'employer' role.
    """

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'employer')


class IsCampus(BasePermission):
    """
    Allows access only to users with the 'campus' role.
    """

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'campus')


class IsAdminRole(BasePermission):
    """
    Allows access only to users with the 'admin' role.
    """

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'admin')


class IsOwnerOrEmployer(BasePermission):
    """
    Custom permission to allow:
    - students to access only their own applications,
    - employers to access applications for jobs they created,
    - admins (staff) to access everything.
    - Only students to create new applications.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            # This check is technically redundant if IsAuthenticated is always used first,
            # but good for a standalone permission.
            return False

        if view.action == 'create':
            # Only users with the 'student' role can create applications.
            return hasattr(request.user, 'role') and request.user.role == 'student'
        
        # For other actions (list, retrieve, update, delete, custom actions),
        # allow access if user is authenticated. 
        # Further specific access control will be handled by:
        # - get_queryset (for list views)
        # - has_object_permission (for detail views and object-specific actions)
        return True

    def has_object_permission(self, request, view, obj):
        user = request.user

        if user.is_staff:
            return True

        if user.role == 'student':
            return obj.applicant == user

        if user.role == 'employer':
            # Align with get_queryset: check if the application's job belongs to the employer's company.
            if hasattr(obj, 'job') and obj.job and hasattr(obj.job, 'company_id') and \
               hasattr(user, 'company_id') and user.company_id is not None:
                return obj.job.company_id == user.company_id
            return False

        return False