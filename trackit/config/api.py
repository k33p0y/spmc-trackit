from rest_framework import generics, viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.core.paginator import Paginator

from .serializers import DepartmentSerializer, CategorySerializer, CategoryTypeSerializer
from .models import Department, Category, CategoryType

# Viewset API
class DepartmentViewSet(viewsets.ModelViewSet):    
   queryset = Department.objects.all().order_by('id')
   serializer_class = DepartmentSerializer
   # permission_classes = [IsAuthenticated]

class CategoryViewSet(viewsets.ModelViewSet):    
   serializer_class = CategorySerializer
   queryset = Category.objects.all()

class CategoryTypeViewSet(viewsets.ModelViewSet):    
   serializer_class = CategoryTypeSerializer
   queryset = CategoryType.objects.all()
