from rest_framework import generics, viewsets
from rest_framework.response import Response
from django.core.paginator import Paginator

from .serializers import DepartmentSerializer, CategorySerializer
from .models import Department, Category

# Viewset API
class DepartmentViewSet(viewsets.ModelViewSet):    
   serializer_class = DepartmentSerializer
   queryset = Department.objects.all().order_by('id')
   datatables_always_serialize = ('id',)

class CategoryViewSet(viewsets.ModelViewSet):    
   serializer_class = CategorySerializer
   queryset = Category.objects.all()
