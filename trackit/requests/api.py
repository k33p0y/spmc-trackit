from rest_framework import generics, viewsets, permissions, serializers, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import Group
from django.contrib.contenttypes.models import ContentType
from django.core.paginator import Paginator
from django.db.models import Q

from .serializers import RequestFormSerializer, RequestFormStatusSerializer, TicketCRUDSerializer, TicketListSerializer, TicketReferenceSerializer, TicketStatusSerializer, TicketActionSerializer, CRUDEventSerializer, NotificationSerializer, AttachmentSerializer, CommentSerializer
from .models import RequestForm, Ticket, RequestFormStatus, Notification, Attachment, Comment
from .views import create_notification, create_remark, generate_reference
from .permissions import CanGenerateReference
from easyaudit.models import CRUDEvent
from config.models import Remark
from core.models import User

import json, uuid, datetime

class RequestFormViewSet(viewsets.ModelViewSet):    
   serializer_class = RequestFormSerializer
   permission_classes = [permissions.IsAuthenticated, permissions.DjangoModelPermissions]

   def get_queryset(self):
      # Search & Filter Parameters
      search = self.request.query_params.get('search', None)
      is_active = self.request.query_params.get('is_active', None)

      if not self.request.user.has_perm('requests.view_requestform') and not self.request.user.has_perm('requests.add_ticket'):
         return RequestForm.objects.none()
      else:
         # Queryset
         qs = RequestForm.objects.all().order_by('-id')

         # Parameters
         if search: qs = qs.filter(name__icontains=search)
         if is_active: qs = qs.filter(is_active=True) if is_active == '0' else qs.filter(is_active=False)

         return qs

class TicketViewSet(viewsets.ReadOnlyModelViewSet):
   serializer_class = TicketListSerializer
   permission_classes = [permissions.IsAuthenticated, permissions.DjangoModelPermissions]

   def get_queryset(self):
      # Search & Filter Parameters
      search = self.request.query_params.get('search', None)
      request_form = self.request.query_params.get('request_form', None)
      category_type = self.request.query_params.get('category_type', None)
      category = self.request.query_params.get('category', None)
      department = self.request.query_params.get('department', None)
      status = self.request.query_params.get('status', None)
      date_from = self.request.query_params.get('date_from', None)
      date_to = self.request.query_params.get('date_to', None)
      is_active = self.request.query_params.get('is_active', None)

      if not self.request.user.has_perm('requests.view_ticket'):
         return Ticket.objects.none()
      else:        
         # Queryset
         if self.request.user.is_superuser:
            qs = Ticket.objects.select_related('request_form', 'department', 'requested_by', 'status')
         elif self.request.user.is_staff:
            user_groups = list(self.request.user.groups.all())
            qs = Ticket.objects.select_related('request_form', 'department', 'requested_by', 'status').filter(Q(request_form__group__in=user_groups) | Q(requested_by = self.request.user)).distinct()
            qs = qs.filter(Q(category__groups__in=user_groups) | Q(requested_by=self.request.user)) if qs.filter(category__groups__in=user_groups).exists() else qs
         else: 
            qs = Ticket.objects.select_related('request_form', 'department', 'requested_by', 'status').filter(Q(requested_by = self.request.user) | Q(department__department_head = self.request.user), is_active=True).distinct()
         
         # Parameters
         if search: qs = qs.filter(Q(ticket_no__icontains=search) | Q(reference_no__icontains=search) | Q(description__icontains=search))
         if request_form: qs = qs.filter(request_form_id__exact=request_form)
         if category_type: qs = qs.filter(category__category_type_id__exact=category_type).distinct()
         if category: qs = qs.filter(category__exact=category)
         if department: qs = qs.filter(department_id__exact=department)
         if status: qs = qs.filter(status_id__exact=status)
         if date_from: qs = qs.filter(date_created__gte=date_from)
         if date_to: qs = qs.filter(date_created__lte=datetime.datetime.strptime(date_to + "23:59:59", '%Y-%m-%d%H:%M:%S'))
         if status: qs = qs.filter(status_id__exact=status)
         if is_active: qs = qs.filter(is_active=True) if is_active == '0' else qs.filter(is_active=False)

         return qs

class TicketCRUDViewSet(viewsets.ModelViewSet):    
   serializer_class = TicketCRUDSerializer
   queryset = Ticket.objects.all()
   permission_classes = [permissions.IsAuthenticated, permissions.DjangoModelPermissions]

class TicketGenerateReferenceViewSet(viewsets.ModelViewSet):
   serializer_class = TicketReferenceSerializer
   permission_classes = [permissions.IsAuthenticated, CanGenerateReference]
   queryset = Ticket.objects.all()

   def partial_update(self, request, pk):
      ticket = Ticket.objects.get(pk=pk)

      if not ticket.reference_no:
         ticket.reference_no = generate_reference(ticket.request_form.id)
         ticket.save()
         
      serializer = TicketReferenceSerializer(ticket, data=request.data, partial=True)
      serializer.is_valid(raise_exception=True)
      serializer.save()

      create_notification(str(ticket.ticket_id), ticket, 'ticket') # create notification instance
      return Response(serializer.data)

class TicketStatusViewSet(viewsets.ModelViewSet):
   serializer_class = TicketStatusSerializer
   permission_classes = [permissions.IsAuthenticated]
   queryset = Ticket.objects.all()

   def partial_update(self, request, pk):
      ticket = Ticket.objects.get(pk=pk)         
      serializer = TicketStatusSerializer(ticket, data=request.data, partial=True)
      serializer.is_valid(raise_exception=True)
      serializer.save()

      create_notification(str(ticket.ticket_id), ticket, 'ticket') # create notification instance
      return Response(serializer.data)

class TicketActionViewSet(viewsets.ModelViewSet):
   serializer_class = TicketActionSerializer
   permission_classes = [permissions.IsAuthenticated, permissions.DjangoModelPermissions]
   queryset = Remark.objects.all()

class RequestFormStatusViewSet(viewsets.ReadOnlyModelViewSet):    
   serializer_class = RequestFormStatusSerializer
   permission_classes = [permissions.IsAuthenticated, permissions.DjangoModelPermissions]

   def get_queryset(self):
      if not self.request.user.has_perm('requests.view_ticket'):
         return RequestFormStatus.objects.none()
      else:
         return RequestFormStatus.objects.all().order_by('id')

class AttachmentViewSet(viewsets.ModelViewSet):
   serializer_class = AttachmentSerializer
   permission_classes = [permissions.IsAuthenticated]

   def get_queryset(self):
      # Parameters
      ticket_id = self.request.query_params.get('ticket_id', None)

      if not self.request.user.has_perm('requests.view_attachment'):
         return Attachment.objects.none()
      else:
         qs = Attachment.objects.select_related('ticket').order_by('-uploaded_at')
         if ticket_id: qs=qs.filter(ticket_id=ticket_id)
         return qs

   def create(self, request):
      file = request.FILES['file']
      data = json.loads(request.FILES['data'].read())

      attachment = Attachment.objects.create(
         ticket_id=data['ticket'],
         description=data['description'],
         file=file, 
         file_name=file.name, 
         file_type=file.content_type, 
         uploaded_by=self.request.user
      )

      serializer = AttachmentSerializer(attachment)
      return Response(serializer.data)

   def partial_update(self, request, pk):
      attachment = Attachment.objects.get(pk=pk)
      serializer = AttachmentSerializer(attachment, data=request.data, partial=True)
      serializer.is_valid(raise_exception=True)
      serializer.save()
      return Response(serializer.data)

class CRUDEventList(generics.ListAPIView):
   serializer_class = CRUDEventSerializer
   permission_classes = [permissions.IsAuthenticated]

   def get_queryset(self):
      ticket_num = self.request.GET.get('tracking_num', None)
      user_pk = self.request.GET.get('user', None)
      
      if ticket_num:
         try:
            ticket = Ticket.objects.get(ticket_no__iexact=ticket_num)
            event_types = list([CRUDEvent.CREATE, CRUDEvent.UPDATE, CRUDEvent.DELETE])
            # attachments = ticket.attachments_ticket.all().values_list('id', flat=True)
            # return CRUDEvent.objects.filter(Q(object_id__endswith=str(ticket.ticket_id)[-12:]) | Q(object_id__in=attachments))
            return CRUDEvent.objects.filter(object_id__endswith=str(ticket.ticket_id)[-12:], event_type__in=event_types)
         except Ticket.DoesNotExist:
            pass
      if user_pk:
         try:
            ctype = ContentType.objects.get(model='user')
            event_types = list([CRUDEvent.CREATE, CRUDEvent.UPDATE, CRUDEvent.DELETE])
            return CRUDEvent.objects.filter(object_id__iexact=str(user_pk), event_type__in=event_types, content_type=ctype)
         except User.DoesNotExist:
            pass

      return CRUDEvent.objects.none()
         
class NotificationViewSet(viewsets.ModelViewSet):
   serializer_class = NotificationSerializer

   def get_queryset(self):
      return Notification.objects.select_related('user').filter(user__id=self.request.user.pk).order_by('-unread', '-log__datetime')

   # disable pagination, show all rows
   def paginate_queryset(self, queryset):
        if self.paginator and self.request.query_params.get(self.paginator.page_query_param, None) is None:
            return None
        return super().paginate_queryset(queryset)

class CommentListCreateAPIView(generics.ListCreateAPIView):
   serializer_class = CommentSerializer

   def get_queryset(self):
      ticket_id = self.request.GET.get('ticket_id', None)
      if ticket_id:
         return Comment.objects.select_related('ticket', 'user').filter(ticket__ticket_id=ticket_id).order_by('-date_created')
      return Comment.objects.none()

   def create(self, request):
      ticket_id = request.data['ticket']

      groups = list(self.request.user.groups.all()) # get groups by user
      ticket = Ticket.objects.filter(
         Q(ticket_id=ticket_id) & (Q(requested_by=self.request.user) | Q(department__department_head=self.request.user) | Q(request_form__group__in=groups))
      )
      # check if ticket is associated to the user
      if not ticket and not self.request.user.is_superuser:
         raise serializers.ValidationError('You do not have permission to post a comment.')
      content = request.data['content']
      comment = Comment.objects.create(ticket_id=ticket_id, content=content, user=self.request.user)
      create_notification(comment.id, comment.ticket, 'comment') # create notification instance
      serializer = CommentSerializer(comment)
      return Response(serializer.data)