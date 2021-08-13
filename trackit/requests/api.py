from rest_framework import generics, viewsets, permissions, serializers, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import Group
from django.core.paginator import Paginator
from django.db.models import Q

from .serializers import RequestFormSerializer, RequestFormStatusSerializer, TicketCRUDSerializer, TicketListSerializer, TicketReferenceSerializer, TicketStatusSerializer, TicketActionSerializer, CRUDEventSerializer, NotificationSerializer, AttachmentSerializer, CommentSerializer
from .models import RequestForm, Ticket, RequestFormStatus, Notification, Attachment, Comment
from .views import create_notification, create_remark, generate_reference
from .permissions import CanGenerateReference
from easyaudit.models import CRUDEvent
from config.models import Remark

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

   def create(self, request):
      name = request.data['name']
      color = request.data['color']
      prefix = request.data['prefix']
      is_active = request.data['is_active']
      fields = request.data['fields']

      request_form = RequestForm.objects.create(name=name, prefix=prefix, color=color, is_active=is_active, fields=fields)
      request_form.group.add(*request.data['groups'])
      request_form.category_types.add(*request.data['category_types'])
      
      for stat in request.data['status']:
         RequestFormStatus.objects.create(
            status_id = stat['status'], 
            order = stat['order'], 
            is_client_step = stat['is_client'],
            is_head_step = stat['is_head'],
            has_approving = stat['has_approving'],
            has_pass_fail = stat['has_pass_fail'],
            form = request_form
         )

      serializer = RequestFormSerializer(request_form)
      return Response(serializer.data)

   def update(self, request, pk):
      # Instance
      request_form = RequestForm.objects.get(pk=pk)
      request_form.name = request.data['name']
      request_form.prefix = request.data['prefix']
      request_form.color = request.data['color']
      request_form.fields = request.data['fields']
      request_form.is_active = request.data['is_active']
      request_form.save()

      request_form.group.clear()
      request_form.group.add(*request.data['groups'])

      request_form.category_types.clear()
      request_form.category_types.add(*request.data['category_types'])

      RequestFormStatus.objects.filter(form=pk).delete()
      
      for stat in request.data['status']:
         RequestFormStatus.objects.create(
            status_id = stat['status'], 
            order = stat['order'], 
            is_client_step = stat['is_client'],
            is_head_step = stat['is_head'],
            has_approving = stat['has_approving'],
            has_pass_fail = stat['has_pass_fail'],
            form = request_form
         )

      serializer = RequestFormSerializer(request_form)
      return Response(serializer.data)

   def partial_update(self, request, pk):
      request_form = RequestForm.objects.get(pk=pk)
      serializer = RequestFormSerializer(request_form, data=request.data, partial=True)
      serializer.is_valid(raise_exception=True)
      serializer.save()
      return Response(serializer.data)

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
            groups = list(self.request.user.groups.all())
            qs = Ticket.objects.select_related('request_form', 'department', 'requested_by', 'status').filter(Q(request_form__group__in=groups) | Q(requested_by = self.request.user)).distinct()
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
   
   # def update(self, request, pk):
   #    ticket = Ticket.objects.get(ticket_id=pk)
   #    ticket.form_data = request.data['form_data']
   #    ticket.description = request.data['description']
   #    ticket.category_id = request.data['category']
   #    ticket.is_active = request.data['is_active']
   #    ticket.save()

   #    ticket.category.clear()
   #    ticket.category.add(*request.data['category'])
         
   #    create_notification(str(ticket.ticket_id), ticket, 'ticket') # create notification instance
      
   #    serializer = TicketSerializer(ticket)
   #    return Response(serializer.data)

   # def partial_update(self, request, pk):
   #    ticket = Ticket.objects.get(pk=pk)
   #    serializer = TicketSerializer(ticket, data=request.data, partial=True)
   #    serializer.is_valid(raise_exception=True)
   #    serializer.save()

   #    create_notification(str(ticket.ticket_id), ticket, 'ticket') # create notification instance
   #    return Response(serializer.data)

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

class TicketActionViewSet(viewsets.ModelViewSet):
   serializer_class = TicketActionSerializer
   permission_classes = [permissions.IsAuthenticated, permissions.DjangoModelPermissions]
   queryset = Remark.objects.all()

   def create(self, request):
      ticket = request.data['ticket']
      remark = request.data['remark']
      status = request.data['status']
      is_approve = request.data['is_approve']
      is_pass = request.data['is_pass']
      
      log = CRUDEvent.objects.filter(object_id=ticket).latest('datetime')
      obj = Remark.objects.create(remark=remark, ticket_id=ticket, action_officer=self.request.user, log=log, status_id=status, is_approve=is_approve, is_pass=is_pass)
      
      serializer = TicketActionSerializer(obj)
      return Response(serializer.data)
      
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
      if ticket_num:
         try:
            ticket = Ticket.objects.get(ticket_no__iexact=ticket_num)
         
            # CREATE = 1
            # UPDATE = 2
            # DELETE = 3
            # M2M_CHANGE = 4
            # M2M_CHANGE_REV = 5
            # M2M_ADD = 6
            # M2M_ADD_REV = 7
            # M2M_REMOVE = 8
            # M2M_REMOVE_REV = 9
            event_types = list([1, 2, 3])

            # attachments = ticket.attachments_ticket.all().values_list('id', flat=True)
            # return CRUDEvent.objects.filter(Q(object_id__endswith=str(ticket.ticket_id)[-12:]) | Q(object_id__in=attachments))
            return CRUDEvent.objects.filter(object_id__endswith=str(ticket.ticket_id)[-12:], event_type__in=event_types)
         except Ticket.DoesNotExist:
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