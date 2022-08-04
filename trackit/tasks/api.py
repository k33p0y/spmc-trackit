from rest_framework import viewsets, permissions
from rest_framework.response import Response
from django.db.models import Q
from .serializers import TasksSerializer
from .models import Task, Team

class TaskViewSet(viewsets.ModelViewSet):    
   serializer_class = TasksSerializer
   queryset = Task.objects.all()
   permission_classes = [permissions.IsAuthenticated, permissions.DjangoModelPermissions]
   http_method_names = ['get', 'head']

