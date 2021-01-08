from rest_framework import generics, viewsets, permissions
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.core.paginator import Paginator

from .serializers import RequestFormSerializer, RequestFormStatusSerializer, TicketSerializer, CRUDEventSerializer, NotificationSerializer
from .models import RequestForm, Ticket, RequestFormStatus, Notification
from easyaudit.models import CRUDEvent

import json

class RequestFormViewSet(viewsets.ModelViewSet):    
   serializer_class = RequestFormSerializer
   permission_classes = [permissions.IsAuthenticated, permissions.DjangoModelPermissions]

   def get_queryset(self):
      if not self.request.user.has_perm('requests.view_ticket'):
         return RequestForm.objects.none()
      else:
         return RequestForm.objects.all().order_by('id')

   def create(self, request):
      name = request.data['name']
      color = request.data['color']
      fields = request.data['fields']
      status_dict = request.data['status']
      is_active = request.data['is_active']
      is_archive = request.data['is_archive']

      request_form = RequestForm.objects.create(name=name, color=color, fields=fields, is_active=is_active, is_archive=is_archive)
      request_form.save()

      for stat in status_dict:
         status_id = stat['status']
         order = stat['order']
         RequestFormStatus(form=request_form, status_id=status_id, order=order).save()

      serializer = RequestFormSerializer(request_form)
      return Response(serializer.data)

   def update(self, request, pk):
      # Instance
      request_form = RequestForm.objects.get(pk=pk)
      request_form.name = request.data['name']
      request_form.color = request.data['color']
      request_form.fields = request.data['fields']
      request_form.is_active = request.data['is_active']
      request_form.is_archive = request.data['is_archive']
      request_form.save()

      RequestFormStatus.objects.filter(form=pk).delete()
      status_dict = request.data['status']
      
      for stat in status_dict:
         status_id = stat['status']
         order = stat['order']
         RequestFormStatus(form=request_form, status_id=status_id, order=order).save()

      serializer = RequestFormSerializer(request_form)
      return Response(serializer.data)

   def partial_update(self, request, pk):
      request_form = RequestForm.objects.get(pk=pk)
      request_form.is_archive = request.data['is_archive']
      request_form.save()

      serializer = RequestFormSerializer(request_form, partial=True)
      return Response(serializer.data)

class TicketViewSet(viewsets.ModelViewSet):    
   serializer_class = TicketSerializer
   permission_classes = [permissions.IsAuthenticated, permissions.DjangoModelPermissions]

   def get_queryset(self):
      status = self.request.GET.get('status', None)
      form = self.request.GET.get('form', None)

      if not self.request.user.has_perm('requests.view_ticket'):
         return Ticket.objects.none()
      else:
         if form:
            return Ticket.objects.filter(status=status, request_form=form, is_active=True, is_archive=False)
         else:
            return Ticket.objects.all()

   # disable pagination, show all rows
   def paginate_queryset(self, queryset):
      if self.paginator and self.request.query_params.get(self.paginator.page_query_param, None) is None:
         return None
      return super().paginate_queryset(queryset)

   def perform_create(self, serializer):
      serializer.save(requested_by=self.request.user)

class RequestFormStatusViewSet(viewsets.ReadOnlyModelViewSet):    
   serializer_class = RequestFormStatusSerializer
   permission_classes = [permissions.IsAuthenticated, permissions.DjangoModelPermissions]

   def get_queryset(self):
      if not self.request.user.has_perm('requests.view_ticket'):
         return RequestFormStatus.objects.none()
      else:
         return RequestFormStatus.objects.all().order_by('id')

class CRUDEventList(generics.ListAPIView):
   serializer_class = CRUDEventSerializer
   permission_classes = [permissions.IsAuthenticated]

   def get_queryset(self):
      ticket_num = self.request.GET.get('tracking_num', None)

      if not ticket_num or len(ticket_num) < 10: # if ticket number is less than 10 characters, return none
         return CRUDEvent.objects.none()
      else:
         return CRUDEvent.objects.filter(object_id__icontains=ticket_num)

class NotificationViewSet(viewsets.ModelViewSet):
   serializer_class = NotificationSerializer

   def get_queryset(self):
      if not self.request.user.has_perm('requests.view_notification'):
         return Notification.objects.none()
      else:
         return Notification.objects.select_related('user').filter(user__id=self.request.user.pk).order_by('-unread', '-log__datetime')

   # disable pagination, show all rows
   def paginate_queryset(self, queryset):
        if self.paginator and self.request.query_params.get(self.paginator.page_query_param, None) is None:
            return None
        return super().paginate_queryset(queryset)