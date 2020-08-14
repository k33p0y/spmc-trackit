from rest_framework import generics, viewsets, permissions
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.core.paginator import Paginator

from .serializers import FormTypeSerializer
from .models import FormType

class FormTypeViewSet(viewsets.ModelViewSet):    
   queryset = FormType.objects.all()
   serializer_class = FormTypeSerializer
   permission_classes = [permissions.IsAuthenticated]