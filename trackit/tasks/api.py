from rest_framework import status, viewsets, permissions
from rest_framework.response import Response
from django.db.models import Q
from .serializers import (
   OpenTasksSerializer,
   RemoveTasksSerializer, 
   RemoveTeamPersonSerializer,
   ShareTaskSerializer, 
   TasksListSerializer,)
from .models import OpenTask, Task, Team
from requests.models import Notification

class TaskListViewSet(viewsets.ModelViewSet):    
   serializer_class = TasksListSerializer
   queryset = Task.objects.all()
   permission_classes = [permissions.IsAuthenticated]
   http_method_names = ['get', 'head',]

class MyTaskListViewSet(viewsets.ModelViewSet):    
   serializer_class = TasksListSerializer
   queryset = Task.objects.all()
   permission_classes = [permissions.IsAuthenticated]
   http_method_names = ['get', 'head',]

   def get_queryset(self):
      mytask = Task.objects.filter(officers=self.request.user, date_completed__isnull=True)
      return mytask

class TaskListCompleteViewSet(viewsets.ModelViewSet):    
   serializer_class = TasksListSerializer
   queryset = Task.objects.all()
   permission_classes = [permissions.IsAuthenticated]
   http_method_names = ['get', 'head',]

   def get_queryset(self):
      return Task.objects.filter(officers=self.request.user, date_completed__isnull=False).order_by('-date_completed')
 
class RemoveTaskViewSet(viewsets.ModelViewSet):    
   serializer_class = RemoveTasksSerializer
   queryset = Task.objects.all()
   permission_classes = [permissions.IsAuthenticated]
   http_method_names = ['get', 'head', 'put']

class ShareTaskViewSet(viewsets.ModelViewSet):    
   serializer_class = ShareTaskSerializer
   queryset = Task.objects.all()
   permission_classes = [permissions.IsAuthenticated]
   http_method_names = ['get', 'head', 'put']

class OpenTaskViewSet(viewsets.ModelViewSet):    
   serializer_class = OpenTasksSerializer
   queryset = OpenTask.objects.all()
   permission_classes = [permissions.IsAuthenticated]
   http_method_names = ['get', 'head', 'put']

   def get_queryset(self):
      search = self.request.query_params.get("search", None)
      qs = OpenTask.objects.filter(task_type__officer=self.request.user)
      if search: qs = qs.filter(Q(ticket__ticket_no__iexact=search) | Q(ticket__reference_no__icontains=search) | Q(ticket__description__icontains=search))
      return qs

class RemoveTeamPersonViewSet(viewsets.ModelViewSet):    
   serializer_class = RemoveTeamPersonSerializer
   queryset = Team.objects.all()
   permission_classes = [permissions.IsAuthenticated]
   http_method_names = ['head', 'delete']

   def perform_destroy(self, instance):
      from easyaudit.models import CRUDEvent
      from django.contrib.contenttypes.models import ContentType
      
      team_id = instance.pk
      officers = list(instance.task.officers.all().values_list('id', flat=True))
      instance.delete()
      # create notification instance
      ctype = ContentType.objects.get(model='team')
      log = CRUDEvent.objects.filter(object_id=team_id, content_type=ctype).latest('datetime')
      for officer in officers:
         if not log.user_id == officer:
            Notification(log=log, user_id=officer).save()
   
