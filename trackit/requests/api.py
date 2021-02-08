from rest_framework import generics, viewsets, permissions, serializers
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.core.paginator import Paginator
from django.db.models import Q

from .serializers import RequestFormSerializer, RequestFormStatusSerializer, TicketSerializer, CRUDEventSerializer, NotificationSerializer, AttachmentSerializer, CommentSerializer
from .models import RequestForm, Ticket, RequestFormStatus, Notification, Attachment, Comment
from easyaudit.models import CRUDEvent

import json

class RequestFormViewSet(viewsets.ModelViewSet):    
   serializer_class = RequestFormSerializer
   permission_classes = [permissions.IsAuthenticated, permissions.DjangoModelPermissions]

   def get_queryset(self):
      search_input = self.request.GET.get('search_input', None)
      is_active = self.request.GET.get('is_active', None)

      if (self.request.user.is_superuser or self.request.user.is_staff or self.request.user.has_perm('requests.view_requestform') or self.request.user.has_perm('requests.add_ticket')):
         qs = RequestForm.objects.all()
         qs = qs.filter(is_archive=False)

         if search_input:
               qs = qs.filter(name__icontains=search_input)
         if is_active:
            if is_active == "1":
               qs = qs.filter(is_active=True)
            else:
               qs = qs.filter(is_active=False)
         return qs
      else:
         return RequestForm.objects.none()


      # if not self.request.user.has_perm('requests.view_requestform'):
      #    return RequestForm.objects.none()
      # else:
      #    # return RequestForm.objects.all().order_by('id')
      #    qs = RequestForm.objects.all()
      #    qs = qs.filter(is_archive=False)

      #    if search_input:
      #          qs = qs.filter(name__icontains=search_input)
      #    if is_active:
      #       if is_active == "1":
      #          qs = qs.filter(is_active=True)
      #       else:
      #          qs = qs.filter(is_active=False)

      #    return qs

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
         is_client_step = stat['is_client']
         has_pass_fail = stat['has_pass_fail']
         has_approving = stat['has_approving']
         RequestFormStatus(form=request_form, status_id=status_id, order=order, has_approving=has_approving, is_client_step=is_client_step, has_pass_fail=has_pass_fail).save()

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
         is_client_step = stat['is_client']
         has_pass_fail = stat['has_pass_fail']
         has_approving = stat['has_approving']
         RequestFormStatus(form=request_form, status_id=status_id, order=order, has_approving=has_approving, is_client_step=is_client_step, has_pass_fail=has_pass_fail).save()

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

      search_input = self.request.GET.get('search_input', None)
      category_id = self.request.GET.get('category_id', None)
      department_id = self.request.GET.get('department_id', None)
      status_id = self.request.GET.get('status_id', None)
      is_active = self.request.GET.get('is_active', None)

      if not self.request.user.has_perm('requests.view_ticket'):
         return Ticket.objects.none()
      else:
         if(self.request.user.is_superuser or self.request.user.is_staff):
            qs = Ticket.objects.filter(is_archive=False)
         else:
            # qs = Ticket.objects.select_related('requested_by').filter(requested_by=self.request.user)
            qs = Ticket.objects.filter(Q(requested_by = self.request.user) | Q(department__department_head = self.request.user))

         if form:
            return qs.filter(status=status, request_form=form, is_active=True, is_archive=False)
         else:
            qs = qs.filter(is_archive=False)
            if search_input:
               qs = qs.filter(ticket_no__icontains=search_input)
            if category_id:
               qs = qs.filter(category_id__exact=category_id)
            if department_id:
               qs = qs.filter(department_id__exact=department_id)
            if status_id:
               qs = qs.filter(status_id__exact=status_id)
            if is_active:
               if is_active == "1":
                  qs = qs.filter(is_active=True)
               else:
                  qs = qs.filter(is_active=False)

         return qs

   # disable pagination, show all rows
   def paginate_queryset(self, queryset):
      if self.paginator and self.request.query_params.get(self.paginator.page_query_param, None) is None:
         return None
      return super().paginate_queryset(queryset)

   def create(self, request):
      files = request.FILES.getlist('file', None)
      data = json.loads(request.FILES['data'].read())

      request_form = data['request_form']
      form_data = data['form_data']
      category = data['category']
      department = data['department']

      ticket = Ticket.objects.create(request_form_id=request_form, form_data=form_data, category_id=category, department_id=department, requested_by=self.request.user)
      ticket.save()
      
      if files: 
         for file in files:
            Attachment(ticket=ticket, file=file, file_name=file.name, file_type=file.content_type, uploaded_by=self.request.user).save()
      
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
            Attachment(ticket_id=pk, file=file, file_name=file.name, file_type=file.content_type, uploaded_by=self.request.user).save()
      
      serializer = TicketSerializer(ticket)
      return Response(serializer.data)

   def partial_update(self, request, pk):
      ticket = Ticket.objects.get(pk=pk)
      serializer = TicketSerializer(ticket, data=request.data, partial=True)
      serializer.is_valid(raise_exception=True)
      serializer.save()
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
      ticket_id = self.request.GET.get('ticket_id', None)

      if not self.request.user.has_perm('requests.view_attachment'):
         return Attachment.objects.none()
      else:
         if ticket_id:
            return Attachment.objects.select_related('ticket').filter(ticket_id=ticket_id).order_by('-uploaded_at')
         else: 
            return Attachment.objects.select_related('ticket').order_by('-uploaded_at')

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
      comment.save()
      serializer = CommentSerializer(comment)
      return Response(serializer.data)