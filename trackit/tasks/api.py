from unicodedata import category
from rest_framework import status, viewsets, permissions
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from django.db.models import Q
from .serializers import (
   OpenTasksSerializer,
   RemoveTasksSerializer, 
   RemoveTeamPersonSerializer,
   ShareTaskSerializer, 
   ShareTaskOfficersSerializer,
   TasksListSerializer,)
from .models import OpenTask, Task, Team
from requests.models import Notification

import datetime

class TaskListViewSet(viewsets.ModelViewSet):    
   serializer_class = TasksListSerializer
   permission_classes = [permissions.IsAuthenticated]
   queryset = Task.objects.all()
   http_method_names = ['get', 'head',]

class MyTaskListViewSet(viewsets.ModelViewSet):    
   serializer_class = TasksListSerializer
   queryset = Task.objects.all()
   permission_classes = [permissions.IsAuthenticated]
   http_method_names = ['get', 'head',]

   def get_queryset(self):
      # Search & Filter Parameters
      search = self.request.query_params.get('search', None)
      task_type = self.request.query_params.get('task_type', None)
      category = self.request.query_params.get('category', None)
      date_from = self.request.query_params.get('date_from', None)
      date_to = self.request.query_params.get('date_to', None)
      
      qs = Task.objects.filter(officers=self.request.user, date_completed__isnull=True)
      
      if search: qs = qs.filter(Q(ticket__ticket_no__icontains=search) | Q(ticket__reference_no__icontains=search) | Q(ticket__description__icontains=search))
      if task_type: qs = qs.filter(task_type__status=task_type)
      if category: qs = qs.filter(ticket__category=category)
      if date_from: qs = qs.filter(date_created__gte=date_from)
      if date_to: qs = qs.filter(date_created__lte=datetime.datetime.strptime(date_to + "23:59:59", '%Y-%m-%d%H:%M:%S'))
      return qs

class TaskListCompleteViewSet(viewsets.ModelViewSet):    
   serializer_class = TasksListSerializer
   permission_classes = [permissions.IsAuthenticated]
   queryset = Task.objects.all()
   http_method_names = ['get', 'head',]

   def get_queryset(self):
      # Search & Filter Parameters
      search = self.request.query_params.get('search', None)
      task_type = self.request.query_params.get('task_type', None)
      category = self.request.query_params.get('category', None)
      date_from = self.request.query_params.get('date_from', None)
      date_to = self.request.query_params.get('date_to', None)
      
      qs = Task.objects.filter(officers=self.request.user, date_completed__isnull=False).order_by('-date_completed')
      
      if search: qs = qs.filter(Q(ticket__ticket_no__icontains=search) | Q(ticket__reference_no__icontains=search) | Q(ticket__description__icontains=search))
      if task_type: qs = qs.filter(task_type__status=task_type)
      if category: qs = qs.filter(ticket__category=category)
      if date_from: qs = qs.filter(date_completed__gte=date_from)
      if date_to: qs = qs.filter(date_completed__lte=datetime.datetime.strptime(date_to + "23:59:59", '%Y-%m-%d%H:%M:%S'))
      
      return qs
   
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
   
class ShareTaskOfficersViewSet(viewsets.ModelViewSet):    
   serializer_class = ShareTaskOfficersSerializer
   permission_classes = [permissions.IsAuthenticated]
   queryset = Task.objects.all()
   http_method_names = ['get', 'head',]

class OpenTaskViewSet(viewsets.ModelViewSet):    
   serializer_class = OpenTasksSerializer
   queryset = OpenTask.objects.all()
   permission_classes = [permissions.IsAuthenticated]
   paginator = PageNumberPagination()
   paginator.page_size = 8
   http_method_names = ['get', 'head', 'put']
   
   def get_queryset(self):
      search = self.request.query_params.get("search", None)
      task_type = self.request.query_params.get("task_type", None)
      category = self.request.query_params.get('category', None)
      user_groups = list(self.request.user.groups.all())
      
      qs = OpenTask.objects.select_related('ticket', 'task_type').filter(task_type__officer=self.request.user, ticket__category__groups__in=user_groups).distinct()
      
      if search: qs = qs.filter(Q(ticket__ticket_no__icontains=search) | Q(ticket__reference_no__icontains=search) | Q(ticket__description__icontains=search))
      if task_type: qs = qs.filter(task_type__status=task_type)
      if category: qs = qs.filter(ticket__category=category)
      return qs.order_by('-id')

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
