from rest_framework import generics, viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.core.paginator import Paginator

from .serializers import DepartmentSerializer, CategorySerializer
from .models import Department, Category

# Viewset API
class DepartmentViewSet(viewsets.ModelViewSet):    
   queryset = Department.objects.all().order_by('id')
   serializer_class = DepartmentSerializer
   # permission_classes = [IsAuthenticated]

class CategoryViewSet(viewsets.ModelViewSet):    
   serializer_class = CategorySerializer
   queryset = Category.objects.all()
