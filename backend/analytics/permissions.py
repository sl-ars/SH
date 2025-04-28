from rest_framework import permissions

class AnalyticsPermissions(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_staff:
            return True
        if view.__class__.__name__ == 'EmployerAnalyticsView':
            return request.user.role == 'employer'



        if view.__class__.__name__ in ['JobViewViewSet', 'JobApplicationMetricsViewSet', 'EmployerMetricsViewSet']:
            if view.action in ['summary', 'trends'] and request.user.role == 'employer':
                return True
            return False 
        
        return False

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_staff:
            return True
        if request.user.role == 'employer':
            if view.__class__.__name__ == 'JobApplicationMetricsViewSet' and view.action == 'trends':
                return obj.job.created_by == request.user
            if view.__class__.__name__ == 'EmployerMetricsViewSet' and view.action == 'summary':
                return obj.employer == request.user

        return False