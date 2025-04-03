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
        

        return True 

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True 

        if not request.user or not request.user.is_authenticated:
            return False


        if request.user.is_staff:
            return True


        if hasattr(obj, 'created_by'):
            return obj.created_by == request.user
        elif hasattr(obj, 'resource') and hasattr(obj.resource, 'created_by'): 
            return obj.resource.created_by == request.user
        
        return False 