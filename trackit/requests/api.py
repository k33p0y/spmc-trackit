from rest_framework import generics, viewsets, permissions
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.core.paginator import Paginator

from .serializers import RequestFormSerializer,  TicketSerializer
from .models import RequestForm, Ticket

import json

class RequestFormViewSet(viewsets.ModelViewSet):    
   queryset = RequestForm.objects.all()
   serializer_class = RequestFormSerializer
   permission_classes = [permissions.IsAuthenticated]

   def perform_create(self, serializer):
      fields_data = serializer.validated_data['fields']
      serializer.save(fields=json.loads(fields_data))

   def perform_update(self, serializer):
      fields_data = serializer.validated_data['fields']
      instance = serializer.save(fields=json.loads(fields_data))
         
class TicketViewSet(viewsets.ModelViewSet):    
   queryset = Ticket.objects.all()
   serializer_class = TicketSerializer
   permission_classes = [permissions.IsAuthenticated]

   def perform_create(self, serializer):
      data = serializer.validated_data['form_data']
      serializer.save(form_data=json.loads(data))

   def perform_update(self, serializer):
      data = serializer.validated_data['form_data']
      instance = serializer.save(form_data=json.loads(data))