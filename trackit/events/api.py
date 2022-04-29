from rest_framework import viewsets, permissions
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from django.db.models import Q
from .serializers import EventListSerializer, EventCRUDSerializer, EventDateSerializer
from .models import Event, EventDate, EventTicket

import datetime

# viewsets
class EventListViewSet(viewsets.ModelViewSet):    
   serializer_class = EventListSerializer
   queryset = Event.objects.all()
   http_method_names = ['get', 'head']

   def get_queryset(self):
      search = self.request.query_params.get("search", None)
      qs = Event.objects.filter(is_active=True).order_by('-id')
      if search: qs = qs.filter(Q(title__icontains=search) | Q(subject__icontains=search))
      return qs

class EventCRUDViewSet(viewsets.ModelViewSet):    
   serializer_class = EventCRUDSerializer
   queryset = Event.objects.all()

class EventDateViewSet(viewsets.ModelViewSet):    
   serializer_class = EventDateSerializer
   queryset = EventDate.objects.all()

   def get_queryset(self):
      event = self.request.query_params.get("event", None)
      date = self.request.query_params.get("date", None)
      time_start = self.request.query_params.get("time_start", None)

      qs = EventDate.objects.all()
      if event: qs = qs.filter(event__id=event)
      if date: qs = qs.filter(date__gte=date)
      if time_start: qs = qs.filter(time_start__gte=time_start)
      return qs

