from rest_framework import generics, viewsets, permissions
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.core.paginator import Paginator
from easyaudit.models import CRUDEvent
from .serializers import DepartmentSerializer, CategorySerializer, CategoryTypeSerializer, StatusSerializer, RemarkSerializer
from .models import Department, Category, CategoryType, Status, Remark


# Viewset API
class DepartmentViewSet(viewsets.ModelViewSet):    
   # queryset = Department.objects.all().order_by('id')
   serializer_class = DepartmentSerializer
   permission_classes = [permissions.IsAuthenticated, permissions.DjangoModelPermissions]

   def get_queryset(self):

      search_input = self.request.GET.get('search_input', None)
      is_active = self.request.GET.get('is_active', None)

      if 'is_archive' in self.request.GET:
         return Department.objects.filter(is_archive=True)
      else:
         if not self.request.user.has_perm('config.view_department'):
            return Department.objects.none()
         else:
            # return Department.objects.all().order_by('id')
            qs = Department.objects.all()
            qs = qs.filter(is_archive=False)
            if search_input:
               qs = qs.filter(name__icontains=search_input)
            if is_active:
               if is_active == "1":
                  qs = qs.filter(is_active=True)
               else:
                  qs = qs.filter(is_active=False)

            return qs.order_by('id')

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
      search_input = self.request.GET.get('search_input', None)
      category_type_id = self.request.GET.get('category_type_id', None)
      is_active = self.request.GET.get('is_active', None)


      if 'is_archive' in self.request.GET:
         return Category.objects.filter(is_archive=True)
      else:
         if not self.request.user.has_perm('config.view_category'):
            return Category.objects.none()
         else:
            # return Category.objects.all().order_by('id')
            qs = Category.objects.all()
            qs = qs.filter(is_archive=False)
            if search_input:
               qs = qs.filter(name__icontains=search_input)
            if category_type_id:
               qs = qs.filter(category_type_id__exact=category_type_id)
            if is_active:
               if is_active == "1":
                  qs = qs.filter(is_active=True)
               else:
                  qs = qs.filter(is_active=False)

            return qs.order_by('id')

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
      search_input = self.request.GET.get('search_input', None)
      is_active = self.request.GET.get('is_active', None)

      if 'is_archive' in self.request.GET:
         return CategoryType.objects.filter(is_archive=True)
      else:
         if not self.request.user.has_perm('config.view_categorytype'):
            return CategoryType.objects.none()
         else:
            # return CategoryType.objects.all().order_by('id')
            qs = CategoryType.objects.all()
            qs = qs.filter(is_archive=False)
            if search_input:
               qs = qs.filter(name__icontains=search_input)
            if is_active:
               if is_active == "1":
                  qs = qs.filter(is_active=True)
               else:
                  qs = qs.filter(is_active=False)

            return qs.order_by('id')

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
      search_input = self.request.GET.get('search_input', None)
      is_active = self.request.GET.get('is_active', None)

      if 'is_archive' in self.request.GET:
         return Status.objects.filter(is_archive=True)
      else:
         if not self.request.user.has_perm('config.view_status'):
            return Status.objects.none()
         else:
            # return Status.objects.all().order_by('id')
            qs = Status.objects.all()
            qs = qs.filter(is_archive=False)
            if search_input:
               qs = qs.filter(name__icontains=search_input)
            if is_active:
               if is_active == "1":
                  qs = qs.filter(is_active=True)
               else:
                  qs = qs.filter(is_active=False)

            return qs.order_by('id')

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

      log = CRUDEvent.objects.filter(object_id=ticket).latest('datetime')
      obj = Remark.objects.create(remark=remark, ticket_id=ticket, user=self.request.user, log=log)
      obj.save()
      
      serializer = RemarkSerializer(obj)
      return Response(serializer.data)
      
   