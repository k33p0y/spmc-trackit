from django.urls import path
from rest_framework import routers
from .api import DepartmentViewSet, CategoryViewSet, CategoryTypeViewSet, StatusViewSet
from . import views

router = routers.DefaultRouter()
router.register('api/config/department', DepartmentViewSet)
router.register('api/config/category', CategoryViewSet)
router.register('api/config/categorytype', CategoryTypeViewSet)
router.register('api/config/status', StatusViewSet)

urlpatterns = [
   path('config/department', views.department, name='department'),
   path('config/category', views.category, name='category'),
   path('config/types', views.types, name='types'),
   path('config/forms', views.forms, name='forms'),
]

urlpatterns += router.urls