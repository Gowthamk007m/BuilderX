from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import GenerateProjectView, ProjectViewSet
from .views import ProjectViewSet

router = DefaultRouter()
router.register('', ProjectViewSet, basename='project')

urlpatterns = [
    path('generate-project/', GenerateProjectView.as_view(), name='generate-project'),
    path('', include(router.urls)),
]
