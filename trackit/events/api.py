from rest_framework import viewsets, permissions
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from django.db.models import Q
from .serializers import (
   EventCRUDSerializer, 
   EventDateSerializer, 
   EventDateAttendanceSerializer,
   EventDateCRUDSerializer, 
   EventDatePartialSerializer, 
   EventListSerializer,
   EventTicketSerializer,
   RescheduleSerializer
)
from .models import Event, EventDate, EventTicket

import datetime, json

# viewsets
class EventListViewSet(viewsets.ModelViewSet):    
   serializer_class = EventListSerializer
   queryset = Event.objects.all()
   permission_classes = [permissions.IsAuthenticated, permissions.DjangoModelPermissions]
   http_method_names = ['get', 'head',]
   datatables_additional_order_by = '-id'

   def get_queryset(self):
      search = self.request.query_params.get("search", None)
      event_for = self.request.query_params.get("event_for", None)
      is_active = self.request.query_params.get("is_active", None)
      qs = Event.objects.order_by('-id')
      if search: qs = qs.filter(Q(title__icontains=search) | Q(subject__icontains=search))
      if event_for: qs = qs.filter(event_for=event_for)
      if is_active: qs = qs.filter(is_active=is_active)
      return qs
   
class EventListCalendarViewSet(viewsets.ModelViewSet):    
   serializer_class = EventListSerializer
   queryset = Event.objects.all()
   permission_classes = [permissions.IsAuthenticated, permissions.DjangoModelPermissions]
   paginator = PageNumberPagination()
   paginator.page_size = 10
   http_method_names = ['get', 'head',]

   def get_queryset(self):
      search = self.request.query_params.get("search", None)
      qs = Event.objects.order_by('-id')
      if search: qs = qs.filter(Q(title__icontains=search) | Q(subject__icontains=search))
      return qs

class EventCRUDViewSet(viewsets.ModelViewSet):    
   serializer_class = EventCRUDSerializer
   queryset = Event.objects.all()
   permission_classes = [permissions.IsAuthenticated, permissions.DjangoModelPermissions]

class EventDateViewSet(viewsets.ModelViewSet):    
   serializer_class = EventDateSerializer
   queryset = EventDate.objects.all()
   permission_classes = [permissions.IsAuthenticated, permissions.DjangoModelPermissions]
   http_method_names = ['get', 'head',]

   def get_queryset(self):
      search = self.request.query_params.get("search", None)
      event = self.request.query_params.get("event", None)
      status = self.request.query_params.get("status", None)
      dates = self.request.query_params.get("dates", None)
      date_from = self.request.query_params.get('date_from', None)
      date_to = self.request.query_params.get('date_to', None)
      time_start = self.request.query_params.get("time_start", None)
      time_end = self.request.query_params.get("time_end", None)
      is_active = self.request.query_params.get("is_active", None)
      
      now = datetime.datetime.now()
      date_now = now.strftime("%Y-%m-%d")
      time_now = now.strftime("%H:%M:%S")
      
      qs = EventDate.objects.order_by('date', 'time_start')
      if search: qs = qs.filter(venue__icontains=search)
      if event: qs = qs.filter(event__id=event)
      if status:
         if status == '1': qs = qs.filter((Q(date__gte=date_now) & Q(time_start__gt=time_now)) | Q(date__gt=date_now)) # upcoming
         if status == '2': qs = qs.filter(Q(date=date_now, time_start__lte=time_now) & Q(date=date_now, time_end__gte=time_now)) # ongoing
         if status == '3': qs = qs.filter((Q(date__lte=date_now) & Q(time_start__lt=time_now)) & (Q(date__lte=date_now) & Q(time_end__lt=time_now))| Q(date__lt=date_now)) # complete
      if is_active: qs = qs.filter(is_active=json.loads(is_active))
      if dates: qs = qs.filter((Q(date__gte=date_now) & Q(time_start__gte=time_now)) | Q(date__gt=date_now))
      if date_from: qs = qs.filter(date__gte=date_from)
      if date_to: qs = qs.filter(date__lte=datetime.datetime.strptime(date_to + "23:59:59", '%Y-%m-%d%H:%M:%S'))
      if time_start: qs = qs.filter(time_start__gte=time_start)
      if time_end: qs = qs.filter(time_end__lte=time_end)

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

class EventDateAttendanceViewSet(viewsets.ModelViewSet):    
   serializer_class = EventDateAttendanceSerializer
   queryset = EventDate.objects.all()
   permission_classes = [permissions.IsAuthenticated, permissions.DjangoModelPermissions]
   http_method_names = ['get', 'put', 'head']
   
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

class RescheduleViewSet(viewsets.ModelViewSet):    
   serializer_class = RescheduleSerializer
   queryset = EventTicket.objects.all()
   http_method_names = ['get', 'put', 'patch']
   permission_classes = [permissions.IsAuthenticated]



