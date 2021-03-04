from rest_framework import generics, viewsets, permissions, serializers, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import Group
from django.core.paginator import Paginator
from django.db.models import Q

from .serializers import RequestFormSerializer, RequestFormStatusSerializer, TicketSerializer, CRUDEventSerializer, NotificationSerializer, AttachmentSerializer, CommentSerializer
from .models import RequestForm, Ticket, RequestFormStatus, Notification, Attachment, Comment, Status
from easyaudit.models import CRUDEvent
from config.models import Remark

import json, uuid, datetime

# Create notification method
def create_notification(object_id, ticket, sender):
   log = CRUDEvent.objects.filter(object_id=object_id).latest('datetime')
   groups = ticket.request_form.group.all()
   requestor = ticket.requested_by
   date_created = ticket.date_created.replace(microsecond=0)
   date_modified = ticket.date_modified.replace(microsecond=0)

   for group in groups:
      users = group.user_set.all()
      # create notifications for users in selected group
      for user in users:
         if not log.user == user:
            Notification(log=log, user=user).save()
   # create notification for department head
   if date_modified == date_created and sender == 'ticket':
      if ticket.department.department_head:
         if not log.user == ticket.department.department_head:
            Notification(log=log, user=ticket.department.department_head).save()
   if not log.user == requestor:
      Notification(log=log, user=requestor).save()

# Remark Method
def create_remark(object_id, ticket):
   log = CRUDEvent.objects.filter(object_id=object_id).latest('datetime')
   remark = Remark(
      ticket=ticket,
      status=ticket.status,
      action_officer=ticket.requested_by,
      log=log
   )
   remark.save()

# Generate reference no
def generate_reference(form):
   year = datetime.datetime.now().year
   ticket = Ticket.objects.filter(request_form=form, date_created__year=year).exclude(reference_no__exact='').order_by('-reference_no').first()
   
   if ticket:
      ref_no = ticket.reference_no.split('-')
      num_series = int(ref_no[2])+1
      reference_no = (str(ticket.request_form.prefix)+"-"+str(year)+"-"+str(num_series).zfill(4))
   else:
      form = RequestForm.objects.get(id=form)
      num_series = "0001"
      reference_no = (str(form.prefix)+"-"+str(year)+"-"+num_series.zfill(4))

   return reference_no

class RequestFormViewSet(viewsets.ModelViewSet):    
   serializer_class = RequestFormSerializer
   permission_classes = [permissions.IsAuthenticated, permissions.DjangoModelPermissions]

   def get_queryset(self):
      # Search & Filter Parameters
      search = self.request.query_params.get('search', None)
      is_active = self.request.query_params.get('is_active', None)
      is_archive = self.request.query_params.get('is_archive', None)

      if not self.request.user.has_perm('requests.view_requestform') and not self.request.user.has_perm('requests.add_ticket'):
         return RequestForm.objects.none()
      else:
         # Queryset
         qs = RequestForm.objects.all().order_by('-id')

         # Parameters
         if search: qs = qs.filter(name__icontains=search)
         if is_active: qs = qs.filter(is_active=True) if is_active == '0' else qs.filter(is_active=False)
         if is_archive: qs = qs.filter(is_archive=json.loads(is_archive))

         return qs

   def create(self, request):
      name = request.data['name']
      color = request.data['color']
      prefix = request.data['prefix']
      is_active = request.data['is_active']
      fields = request.data['fields']

      request_form = RequestForm.objects.create(name=name, prefix=prefix, color=color, is_active=is_active, fields=fields)
      request_form.group.add(*request.data['groups'])
      
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

class TicketViewSet(viewsets.ModelViewSet):    
   serializer_class = TicketSerializer
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
      is_archive = self.request.query_params.get('is_archive', None)

      if not self.request.user.has_perm('requests.view_ticket'):
         return Ticket.objects.none()
      else:        
         # Queryset
         if self.request.user.is_superuser:
            qs = Ticket.objects.select_related('request_form', 'department', 'category', 'requested_by', 'status')
         elif self.request.user.is_staff:
            groups = list(self.request.user.groups.all())
            qs = Ticket.objects.select_related('request_form', 'department', 'category', 'requested_by', 'status').filter(request_form__group__in=groups)
         else:
            qs = Ticket.objects.select_related('request_form', 'department', 'category', 'requested_by', 'status').filter(Q(requested_by = self.request.user) | Q(department__department_head = self.request.user))
         
         # Parameters
         if search: qs = qs.filter(Q(ticket_no__icontains=search) | Q(reference_no__icontains=search))
         if request_form: qs = qs.filter(request_form_id__exact=request_form)
         if category_type: qs = qs.filter(category__category_type_id__exact=category_type)
         if category: qs = qs.filter(category_id__exact=category)
         if department: qs = qs.filter(department_id__exact=department)
         if status: qs = qs.filter(status_id__exact=status)
         if date_from: qs = qs.filter(date_created__gte=date_from)
         if date_to: qs = qs.filter(date_created__lte=datetime.datetime.strptime(date_to + "23:59:59", '%Y-%m-%d%H:%M:%S'))
         if status: qs = qs.filter(status_id__exact=status)
         if is_active: qs = qs.filter(is_active=True) if is_active == '0' else qs.filter(is_active=False)
         if is_archive: qs = qs.filter(is_archive=json.loads(is_archive))

         return qs

   def create(self, request):
      files = request.FILES.getlist('file', None)
      data = json.loads(request.FILES['data'].read())

      request_form = data['request_form']
      form_data = data['form_data']
      category = data['category']
      department = data['department']

      rf = RequestForm.objects.get(pk=request_form)
      status = rf.status.get(requestformstatus__order=1)
      ticket_no = uuid.uuid4().hex[-10:].upper()                     

      # Create Ticket
      ticket = Ticket.objects.create(
         request_form_id=request_form, 
         form_data=form_data, 
         category_id=category, 
         department_id=department,
         requested_by=self.request.user,
         status=status, 
         ticket_no=ticket_no
      )

      create_notification(str(ticket.ticket_id), ticket, 'ticket')  # Create notification instance
      create_remark(str(ticket.ticket_id), ticket) # Create initial remark

      if files:
         for file in files:
            Attachment.objects.create(
               ticket=ticket, 
               file=file, 
               file_name=file.name,
               file_type=file.content_type,
               uploaded_by=self.request.user
            )
      
      serializer = TicketSerializer(ticket)
      return Response(serializer.data)

   def update(self, request, pk):
      files = request.FILES.getlist('file', None)
      data = json.loads(request.FILES['data'].read())

      # Instance
      ticket = Ticket.objects.get(ticket_id=pk)
      ticket.form_data = data['form_data']
      ticket.category_id = data['category']
      ticket.department_id = data['department']
      ticket.is_active = data['is_active']
      ticket.save()

      if files: 
         for file in files:
            Attachment.objects.create(
               ticket_id=pk, 
               file=file, 
               file_name=file.name, 
               file_type=file.content_type, 
               uploaded_by=self.request.user
            )

      create_notification(str(ticket.ticket_id), ticket, 'ticket') # create notification instance
      
      serializer = TicketSerializer(ticket)
      return Response(serializer.data)

   def partial_update(self, request, pk):
      ticket = Ticket.objects.get(pk=pk)

      if request.data['request_form']:
         if not ticket.reference_no:
            ticket.reference_no = generate_reference(request.data['request_form'])
            ticket.save()
         else:
            return Response('Error: Reference number already created', status=status.HTTP_400_BAD_REQUEST)

         serializer = TicketSerializer(ticket, partial=True)   
      else:
         serializer = TicketSerializer(ticket, data=request_data, partial=True)
         serializer.is_valid(raise_exception=True)
         serializer.save()

      create_notification(str(ticket.ticket_id), ticket, 'ticket') # create notification instance
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
      ticket = json.loads(request.FILES['ticket'].read())

      attachment = Attachment.objects.create(ticket_id=ticket, file=file, file_name=file.name, file_type=file.content_type, uploaded_by=self.request.user)
      attachment.save()

      serializer = AttachmentSerializer(attachment)
      return Response(serializer.data)

class CRUDEventList(generics.ListAPIView):
   serializer_class = CRUDEventSerializer
   permission_classes = [permissions.IsAuthenticated]

   def get_queryset(self):
      ticket_num = self.request.GET.get('tracking_num', None)
      if ticket_num:
         try:
            ticket = Ticket.objects.get(ticket_no__iexact=ticket_num)
            return CRUDEvent.objects.filter(object_id__endswith=str(ticket.ticket_id)[-12:])
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
      if not ticket:
         raise serializers.ValidationError('You do not have permission to post a comment.')
      content = request.data['content']
      comment = Comment.objects.create(ticket_id=ticket_id, content=content, user=self.request.user)
      create_notification(comment.id, comment.ticket, 'comment') # create notification instance
      serializer = CommentSerializer(comment)
      return Response(serializer.data)