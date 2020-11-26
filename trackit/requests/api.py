from rest_framework import generics, viewsets, permissions
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.core.paginator import Paginator

from .serializers import RequestFormSerializer, RequestFormStatusSerializer, TicketSerializer, CRUDEventSerializer
from .models import RequestForm, Ticket, RequestFormStatus
from easyaudit.models import CRUDEvent

import json

class RequestFormViewSet(viewsets.ModelViewSet):    
   queryset = RequestForm.objects.all()
   serializer_class = RequestFormSerializer
   permission_classes = [permissions.IsAuthenticated]
         
class TicketViewSet(viewsets.ModelViewSet):    
   queryset = Ticket.objects.all()
   serializer_class = TicketSerializer
   permission_classes = [permissions.IsAuthenticated]

class RequestFormStatusViewSet(viewsets.ReadOnlyModelViewSet):    
   queryset = RequestFormStatus.objects.all()
   serializer_class = RequestFormStatusSerializer
   permission_classes = [permissions.IsAuthenticated]

class CRUDEventList(generics.ListAPIView):
   serializer_class = CRUDEventSerializer
   permission_classes = [permissions.IsAuthenticated]

   def get_queryset(self):
      ticket_num = self.request.GET.get('tracking_num', None)

      if not ticket_num or len(ticket_num) < 10: # if ticket number is less than 10 characters, return none
         return CRUDEvent.objects.none()
      else:
         return CRUDEvent.objects.filter(object_id__icontains=ticket_num)