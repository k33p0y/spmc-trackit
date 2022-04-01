from rest_framework import viewsets, permissions
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from django.db.models import Q
from .serializers import EventListSerializer, EventCRUDSerializer, EventDateSerializer
from .models import Event, EventDate, EventTicket

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

