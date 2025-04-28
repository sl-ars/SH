from rest_framework import permissions

class ResourcePermissions(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True # Allows GET, HEAD, OPTIONS for all

        if not request.user or not request.user.is_authenticated:
            return False

        if view.action == 'create':
            # Admins, Campus, Employers can create
            return request.user.is_staff or request.user.role in ['campus', 'employer']
        
        # For other actions like update, destroy, permission is checked at object level
        # or if it's a non-detail action that requires authentication beyond create.
        return True 

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True # Allows GET, HEAD, OPTIONS for specific object for all

        if not request.user or not request.user.is_authenticated:
            return False

        # Admin can do anything to any object
        if request.user.is_staff:
            return True

        # Owner (creator of the resource entry) can update or delete
        if hasattr(obj, 'created_by'): # For Resource model
            return obj.created_by == request.user
        elif hasattr(obj, 'resource') and hasattr(obj.resource, 'created_by'): # For ResourceFile model (check owner of parent Resource)
            return obj.resource.created_by == request.user
        
        return False 