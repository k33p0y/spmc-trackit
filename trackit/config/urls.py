from django.urls import path
from rest_framework import routers
from .api import DepartmentViewSet, CategoryViewSet, CategoryTypeViewSet, StatusViewSet
from . import views

router = routers.DefaultRouter()
router.register('api/config/department', DepartmentViewSet, basename='Department')
router.register('api/config/category', CategoryViewSet, basename='Category')
router.register('api/config/categorytype', CategoryTypeViewSet, basename='CategoryType')
router.register('api/config/status', StatusViewSet, basename='Status')

urlpatterns = [
   path('config/department', views.department, name='department'),
   path('config/category', views.category, name='category'),
   path('config/types', views.types, name='types'),
   path('config/forms', views.forms, name='forms'),
   path('config/status', views.status_list, name='status_list'),
]

urlpatterns += router.urls