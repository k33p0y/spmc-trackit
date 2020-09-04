from rest_framework import generics, viewsets, permissions
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.core.paginator import Paginator

from .serializers import RequestFormSerializer
from .models import RequestForm

class RequestFormViewSet(viewsets.ModelViewSet):    
   queryset = RequestForm.objects.all()
   serializer_class = RequestFormSerializer
   permission_classes = [permissions.IsAuthenticated]