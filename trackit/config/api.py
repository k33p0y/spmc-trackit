from rest_framework import generics, viewsets, permissions
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.core.paginator import Paginator

from .serializers import DepartmentSerializer, CategorySerializer, CategoryTypeSerializer, StatusSerializer
from .models import Department, Category, CategoryType, Status

# Viewset API
class DepartmentViewSet(viewsets.ModelViewSet):    
   # queryset = Department.objects.all().order_by('id')
   serializer_class = DepartmentSerializer
   permission_classes = [permissions.IsAuthenticated, permissions.DjangoModelPermissions]

   def get_queryset(self):
      if not self.request.user.has.perm('config.view_department'):
         return Department.objects.none()
      else:
         return Department.objects.all().order_by('id')

class CategoryViewSet(viewsets.ModelViewSet):    
   # serializer_class = CategorySerializer
   # queryset = Category.objects.all()
   permission_classes = [permissions.IsAuthenticated, permissions.DjangoModelPermissions]

   def get_queryset(self):
      if not self.request.user.has.perm('config.view_category'):
         return Department.objects.none()
      else:
         return Department.objects.all().order_by('id')

class CategoryTypeViewSet(viewsets.ModelViewSet):    
   # serializer_class = CategoryTypeSerializer
   # queryset = CategoryType.objects.all()
   permission_classes = [permissions.IsAuthenticated, permissions.DjangoModelPermissions]

   def get_queryset(self):
      if not self.request.user.has.perm('config.view_categorytype'):
         return Department.objects.none()
      else:
         return Department.objects.all().order_by('id')

class StatusViewSet(viewsets.ModelViewSet):
   serializer_class = StatusSerializer
   # queryset = Status.objects.all()
   permission_classes = [permissions.IsAuthenticated, permissions.DjangoModelPermissions]

   def get_queryset(self):
      if not self.request.user.has.perm('config.view_status'):
         return Department.objects.none()
      else:
         return Department.objects.all().order_by('id')