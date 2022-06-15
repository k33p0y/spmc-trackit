from rest_framework import viewsets, permissions
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from django.db.models import Q
from .serializers import (
   AttendanceSerializer, 
   EventCRUDSerializer, 
   EventDateSerializer, 
   EventDateCRUDSerializer, 
   EventDatePartialSerializer, 
   EventListSerializer,
   EventTicketSerializer,
)
from .models import Event, EventDate, EventTicket

import datetime, json

# viewsets
class EventListViewSet(viewsets.ModelViewSet):    
   serializer_class = EventListSerializer
   queryset = Event.objects.all()
   permission_classes = [permissions.IsAuthenticated, permissions.DjangoModelPermissions]
   http_method_names = ['get', 'head',]

   def get_queryset(self):
      search = self.request.query_params.get("search", None)
      event_for = self.request.query_params.get("event_for", None)
      is_active = self.request.query_params.get("is_active", None)

      qs = Event.objects.order_by('-id')

      if search: qs = qs.filter(Q(title__icontains=search) | Q(subject__icontains=search))
      if event_for: qs = qs.filter(event_for=event_for)
      if is_active: qs = qs.filter(is_active=is_active)

      return qs

class EventCRUDViewSet(viewsets.ModelViewSet):    
   serializer_class = EventCRUDSerializer
   queryset = Event.objects.all()
   permission_classes = [permissions.IsAuthenticated, permissions.DjangoModelPermissions]

class EventDateViewSet(viewsets.ModelViewSet):    
   serializer_class = EventDateSerializer
   queryset = EventDate.objects.all()
   permission_classes = [permissions.IsAuthenticated, permissions.DjangoModelPermissions]

   def get_queryset(self):
      event = self.request.query_params.get("event", None)
      dates = self.request.query_params.get("dates", None)
      time_start = self.request.query_params.get("time_start", None)
      is_active = self.request.query_params.get("is_active", None)
      now = datetime.datetime.now()
      
      qs = EventDate.objects.order_by('date', 'time_start')
      if event: qs = qs.filter(event__id=event)
      if is_active: qs = qs.filter(is_active=json.loads(is_active))
      if dates: qs = qs.filter((Q(date__gte=now.strftime('%Y-%m-%d')) & Q(time_start__gte=now.strftime('%H:%M:%S'))) | Q(date__gt=now.strftime('%Y-%m-%d')))
      return qs
      
 
class EventDateCalendarViewSet(viewsets.ReadOnlyModelViewSet):    
   serializer_class = EventDateSerializer
   queryset = EventDate.objects.filter(is_active=True, event__is_active=True)
   permission_classes = [permissions.IsAuthenticated, permissions.DjangoModelPermissions]
   paginator = None

class EventDateCRUDViewSet(viewsets.ModelViewSet):    
   serializer_class = EventDateCRUDSerializer
   queryset = EventDate.objects.all()
   permission_classes = [permissions.IsAuthenticated, permissions.DjangoModelPermissions]

class EventDatePartialViewSet(viewsets.ModelViewSet):    
   serializer_class = EventDatePartialSerializer
   queryset = EventDate.objects.all()
   permission_classes = [permissions.IsAuthenticated, permissions.DjangoModelPermissions]
   http_method_names = ['get', 'patch', 'head']

class EventTicketViewSet(viewsets.ModelViewSet):    
   serializer_class = EventTicketSerializer
   queryset = EventTicket.objects.all()
   permission_classes = [permissions.IsAuthenticated, permissions.DjangoModelPermissions]

   def get_queryset(self):
      schedule = self.request.query_params.get("schedule", None)
      ticket = self.request.query_params.get("ticket", None)

      qs = EventTicket.objects.all()
      if schedule: qs = qs.filter(scheduled_event__id=schedule)
      if ticket: qs = qs.filter(ticket__id=ticket)
      return qs

class AttedanceViewSet(viewsets.ModelViewSet):    
   serializer_class = AttendanceSerializer
   queryset = EventTicket.objects.all()
   http_method_names = ['get', 'put', 'patch']
   permission_classes = [permissions.IsAuthenticated, permissions.DjangoModelPermissions]



