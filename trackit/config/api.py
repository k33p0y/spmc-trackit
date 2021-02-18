from rest_framework import generics, viewsets, permissions
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.core.paginator import Paginator
from django.db.models import Q
from easyaudit.models import CRUDEvent
from .serializers import DepartmentSerializer, CategorySerializer, CategoryTypeSerializer, StatusSerializer, RemarkSerializer
from .models import Department, Category, CategoryType, Status, Remark

import json

# Viewset API
class DepartmentViewSet(viewsets.ModelViewSet):    
   serializer_class = DepartmentSerializer
   permission_classes = [permissions.IsAuthenticated, permissions.DjangoModelPermissions]

   def get_queryset(self):
      # Search & Filter Parameter
      search = self.request.query_params.get('search', None)
      is_active = self.request.query_params.get('is_active', None)
      is_archive = self.request.query_params.get('is_archive', None)

      if not self.request.user.has_perm('config.view_department'):
         return Department.objects.none()
      else:
         # Queryset
         qs = Department.objects.select_related('department_head').order_by('-id')
         
         # Parameters
         if search: qs = qs.filter(Q(name__icontains=search) | Q(department_head__first_name__icontains=search) | Q(department_head__last_name__icontains=search))
         if is_active: qs = qs.filter(is_active=True) if is_active == '0' else qs.filter(is_active=False)
         if is_archive: qs = qs.filter(is_archive=json.loads(is_archive))
         
         return qs

   def partial_update(self, request, pk):
      department = Department.objects.get(pk=pk)
      serializer = DepartmentSerializer(department, data=request.data, partial=True)
      serializer.is_valid(raise_exception=True)
      serializer.save()
      return Response(serializer.data)
         
class CategoryViewSet(viewsets.ModelViewSet):    
   serializer_class = CategorySerializer
   permission_classes = [permissions.IsAuthenticated, permissions.DjangoModelPermissions]

   def get_queryset(self):
      # Search & Filter Parameters
      search = self.request.query_params.get('search', None)
      category_type = self.request.query_params.get('category_type', None)
      is_active = self.request.query_params.get('is_active', None)
      is_archive = self.request.query_params.get('is_archive', None)

      if not self.request.user.has_perm('config.view_category'):
         return Category.objects.none()
      else:
         # Queryset
         qs = Category.objects.select_related('category_type').order_by('-id')

         # Paramters
         if search: qs = qs.filter(name__icontains=search)
         if category_type: qs = qs.filter(category_type_id__exact=category_type)
         if is_active: qs = qs.filter(is_active=True) if is_active == '0' else qs.filter(is_active=False)
         if is_archive: qs = qs.filter(is_archive=json.loads(is_archive))

         return qs

   def partial_update(self, request, pk):
      category = Category.objects.get(pk=pk)
      serializer = CategorySerializer(category, data=request.data, partial=True)
      serializer.is_valid(raise_exception=True)
      serializer.save()
      return Response(serializer.data)

class CategoryTypeViewSet(viewsets.ModelViewSet):    
   serializer_class = CategoryTypeSerializer
   permission_classes = [permissions.IsAuthenticated, permissions.DjangoModelPermissions]

   def get_queryset(self):
      # Search & Filter Parameters
      search = self.request.query_params.get('search', None)
      is_active = self.request.query_params.get('is_active', None)
      is_archive = self.request.query_params.get('is_archive', None)

      if not self.request.user.has_perm('config.view_categorytype'):
         return CategoryType.objects.filter(is_archive=True)
      else:
         # Queryset
         qs = CategoryType.objects.all().order_by('-id')

         # Parameters
         if search: qs = qs.filter(name__icontains=search)
         if is_active: qs = qs.filter(is_active=True) if is_active == '0' else qs.filter(is_active=False)
         if is_archive: qs = qs.filter(is_archive=json.loads(is_archive))

         return qs

   def partial_update(self, request, pk):
      categoryType = CategoryType.objects.get(pk=pk)
      serializer = CategoryTypeSerializer(categoryType, data=request.data, partial=True)
      serializer.is_valid(raise_exception=True)
      serializer.save()
      return Response(serializer.data)

class StatusViewSet(viewsets.ModelViewSet):
   serializer_class = StatusSerializer
   permission_classes = [permissions.IsAuthenticated, permissions.DjangoModelPermissions]

   def get_queryset(self):
      # Search & Filter Parameters
      search = self.request.query_params.get('search', None)
      is_active = self.request.query_params.get('is_active', None)
      is_archive = self.request.query_params.get('is_archive', None)

      if not self.request.user.has_perm('config.view_status'):
         return Status.objects.none()
      else:
         # Queryset
         qs = Status.objects.all().order_by('-id')

         # Parameters
         if search: qs = qs.filter(name__icontains=search)
         if is_active: qs = qs.filter(is_active=True) if is_active == '0' else qs.filter(is_active=False)
         if is_archive: qs = qs.filter(is_archive=json.loads(is_archive))

         return qs

   def partial_update(self, request, pk):
      status = Status.objects.get(pk=pk)
      serializer = StatusSerializer(status, data=request.data, partial=True)
      serializer.is_valid(raise_exception=True)
      serializer.save()
      return Response(serializer.data)

class RemarkViewSet(viewsets.ModelViewSet):
   serializer_class = RemarkSerializer
   permission_classes = [permissions.IsAuthenticated, permissions.DjangoModelPermissions]
   queryset = Remark.objects.all()

   def create(self, request):
      ticket = request.data['ticket']
      remark = request.data['remark']
      status = request.data['status']
      is_approve = request.data['is_approve']
      is_pass = request.data['is_pass']

      log = CRUDEvent.objects.filter(object_id=ticket).latest('datetime')
      obj = Remark.objects.create(remark=remark, ticket_id=ticket, user=self.request.user, log=log, status_id=status, is_approve=is_approve, is_pass=is_pass)
      
      serializer = RemarkSerializer(obj)
      return Response(serializer.data)
      
   