from rest_framework import viewsets, permissions
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from django.db.models import Q
from .serializers import EventListSerializer, EventCRUDSerializer
from .models import Event, EventDate, EventTicket

# pagination
class EventCalendarSetPagination(PageNumberPagination):
   page_size = 6
   page_size_query_param = 'page_size'

# viewsets
class EventListViewSet(viewsets.ModelViewSet):    
   serializer_class = EventListSerializer
   queryset = Event.objects.all()
   http_method_names = ['get', 'head']
   pagination_class = EventCalendarSetPagination

   def get_queryset(self):
      search = self.request.query_params.get("search", None)
      print(search)
      qs = Event.objects.filter(is_active=True).order_by('-id')
      if search: qs = qs.filter(Q(title__icontains=search) | Q(subject__icontains=search))
      return qs

class EventCRUDViewSet(viewsets.ModelViewSet):    
   serializer_class = EventCRUDSerializer
   queryset = Event.objects.all()

