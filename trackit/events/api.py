from rest_framework import viewsets, permissions
from rest_framework.response import Response
from .serializers import EventListSerializer, EventCRUDSerializer
from .models import Event, EventDate, EventTicket

class EventListViewSet(viewsets.ModelViewSet):    
   serializer_class = EventListSerializer
   queryset = Event.objects.all()
   http_method_names = ['get', 'head']

class EventCRUDViewSet(viewsets.ModelViewSet):    
   serializer_class = EventCRUDSerializer
   queryset = Event.objects.all()

