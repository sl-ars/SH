from rest_framework import permissions


class IsEmployerOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True

        return request.user.is_authenticated and (
                request.user.role == 'employer' or
                request.user.role == 'admin' or
                request.user.is_staff
        )

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        return request.user.is_authenticated and (
                obj.created_by == request.user or
                request.user.role == 'admin' or
                request.user.is_staff
        )


class IsApplicantOrEmployer(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if obj.applicant == request.user:
            return True

        if obj.job.created_by == request.user:
            return True

        return request.user.role == 'admin' or request.user.is_staff


class IsOwnerOrAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object or admins to edit it.
    Read-only access for everyone else.
    """

    def has_permission(self, request, view):
        # Allow GET, HEAD, OPTIONS requests for any user (authenticated or not)
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # For other methods (POST, PUT, PATCH, DELETE), user must be authenticated
        # For POST (create), ownership is set in perform_create, so just check authentication.
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Allow GET, HEAD, OPTIONS requests for any user for existing objects
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner of the job or an admin.
        # obj.created_by is the user who created the job.
        if hasattr(obj, 'created_by'): # Check if the object has 'created_by' (e.g., a Job instance)
            return obj.created_by == request.user or (request.user and request.user.is_staff)
        
        # Fallback for safety, or if used on an object without created_by unexpectedly.
        # Admins should still be able to operate if object context is unclear but user is admin.
        return request.user and request.user.is_staff