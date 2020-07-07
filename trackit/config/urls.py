from django.urls import path
from rest_framework import routers
from .api import DepartmentViewSet, CategoryViewSet
from . import views

router = routers.DefaultRouter()
router.register('api/config/department', DepartmentViewSet)
router.register('api/config/category', CategoryViewSet)

urlpatterns = [
   path('config/department', views.department, name='department'),
   path('config/category', views.category, name='category'),
]

urlpatterns += router.urls