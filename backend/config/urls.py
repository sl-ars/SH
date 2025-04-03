from django.contrib import admin
from django.http import JsonResponse
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView
)
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from rest_framework.permissions import AllowAny
from django.conf import settings
from django.conf.urls.static import static

from users.views import CustomRefreshView, CustomTokenObtainPairView, CustomVerifyView
def health_check(_):
    return JsonResponse({'status': 'ok'})

urlpatterns = [

    path('djangoadmin/', admin.site.urls),
                   
    path("health/", health_check),
    # ── JWT ────────
    path("api/auth/token/refresh/", CustomRefreshView.as_view(), name="token-refresh"),
    path("api/auth/token/verify/", CustomVerifyView.as_view(), name="token-verify"),
    path("api/auth/login/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),

    # Apps
    path("api/user/", include("users.urls")),
    path('api/', include('resources.urls')),


    # DRF Spectacular - Schema, Swagger UI, Redoc UI
    path('api/schema/', SpectacularAPIView.as_view(permission_classes=[AllowAny]), name='schema'),
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema', permission_classes=[AllowAny]),
         name='swagger-ui'),
    path('api/schema/redoc/', SpectacularRedocView.as_view(url_name='schema', permission_classes=[AllowAny]),
         name='redoc'),
]
