from django.urls import path, include
from rest_framework.routers import DefaultRouter
from companies.views import CompanyViewSet, employer_company_update

router = DefaultRouter()
router.register(r'', CompanyViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('employer/company/', CompanyViewSet.as_view({
        'get': 'employer_company', 
        'put': 'update_employer_company',
        'patch': 'update_employer_company'
    }), name='employer-company'),

    path('employer-company-update/', employer_company_update, name='employer-company-update'),
]
