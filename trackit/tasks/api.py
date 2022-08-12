from rest_framework import viewsets, permissions
from rest_framework.response import Response
from django.db.models import Q
from .serializers import TasksSerializer, OpenTasksSerializer
from .models import OpenTask, Task, Team

class TaskViewSet(viewsets.ModelViewSet):    
   serializer_class = TasksSerializer
   queryset = Task.objects.all()
   permission_classes = [permissions.IsAuthenticated, permissions.DjangoModelPermissions]
   http_method_names = ['get', 'head',]

   def get_queryset(self):
      return Task.objects.filter(officers=self.request.user)

class OpenTaskViewSet(viewsets.ModelViewSet):    
   serializer_class = OpenTasksSerializer
   queryset = OpenTask.objects.all()
   permission_classes = [permissions.IsAuthenticated, permissions.DjangoModelPermissions]
   http_method_names = ['get', 'head', 'put', 'patch']

   def get_queryset(self):
      search = self.request.query_params.get("search", None)
      qs = OpenTask.objects.filter(task_type__officer=self.request.user)
      if search: qs = qs.filter(Q(ticket__ticket_no__iexact=search) | Q(ticket__reference_no__icontains=search) | Q(ticket__description__icontains=search))
      return qs

