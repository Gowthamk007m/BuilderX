from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from projects.views import GenerateProjectView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/login/', TokenObtainPairView.as_view(), name='jwt_login'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='jwt_refresh'),
    path('api/generate-project/', GenerateProjectView.as_view(), name='generate-project'),
    path('api/projects/', include('projects.urls')),
]
