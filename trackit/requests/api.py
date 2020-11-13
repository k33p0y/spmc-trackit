from rest_framework import generics, viewsets, permissions
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.core.paginator import Paginator

from .serializers import RequestFormSerializer, RequestFormStatusSerializer, TicketSerializer
from .models import RequestForm, Ticket, RequestFormStatus

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