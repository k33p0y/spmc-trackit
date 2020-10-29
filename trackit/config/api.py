from rest_framework import generics, viewsets, permissions
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.core.paginator import Paginator

from .serializers import DepartmentSerializer, CategorySerializer, CategoryTypeSerializer, StatusSerializer
from .models import Department, Category, CategoryType, Status

# Viewset API
class DepartmentViewSet(viewsets.ModelViewSet):    
   queryset = Department.objects.all().order_by('id')
   serializer_class = DepartmentSerializer
   permission_classes = [permissions.IsAuthenticated]

class CategoryViewSet(viewsets.ModelViewSet):    
   serializer_class = CategorySerializer
   queryset = Category.objects.all()
   permission_classes = [permissions.IsAuthenticated]

class CategoryTypeViewSet(viewsets.ModelViewSet):    
   serializer_class = CategoryTypeSerializer
   queryset = CategoryType.objects.all()
   permission_classes = [permissions.IsAuthenticated]

class StatusViewSet(viewsets.ModelViewSet):
   serializer_class = StatusSerializer
   queryset = Status.objects.all()
   permission_classes = [permissions.IsAuthenticated]