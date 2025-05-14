from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CampusViewSet, CampusStudentViewSet
from rest_framework.documentation import include_docs_urls

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'campuses', CampusViewSet, basename='campus')
router.register(r'campus-students', CampusStudentViewSet, basename='campus-student')

# The API URLs are now determined automatically by the router.
urlpatterns = [
    # API endpoints
    path('', include(router.urls)),
    
    # Custom endpoints for campuses
    path('campuses/<int:pk>/register-student/', 
         CampusViewSet.as_view({'post': 'register_student'}),
         name='campus-register-student'),
    
    path('campuses/<int:pk>/bulk-register-students/', 
         CampusViewSet.as_view({'post': 'bulk_register_students'}),
         name='campus-bulk-register-students'),
    
    path('campuses/<int:pk>/students/', 
         CampusViewSet.as_view({'get': 'students'}),
         name='campus-students-list'),
    
    path('campuses/<int:pk>/statistics/', 
         CampusViewSet.as_view({'get': 'statistics'}),
         name='campus-statistics'),
    
    # Custom endpoints for campus students
    path('campus-students/<int:pk>/change-status/', 
         CampusStudentViewSet.as_view({'post': 'change_status'}),
         name='student-change-status'),
    
    path('campus-students/bulk-status-change/', 
         CampusStudentViewSet.as_view({'post': 'bulk_status_change'}),
         name='student-bulk-status-change'),
]
