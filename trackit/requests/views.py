from django.contrib.auth.decorators import login_required, permission_required
from django.http import Http404
from django.shortcuts import render, get_object_or_404
from django.db.models import Q

from config.models import Category, CategoryType, Department, Status, Remark
from easyaudit.models import CRUDEvent
from .models import Ticket, RequestForm, Attachment, RequestFormStatus, Notification, Comment
from core.decorators import user_is_verified

import json, uuid, datetime

# Create your views here.
@login_required
@user_is_verified
@permission_required('requests.view_ticket', raise_exception=True)
def ticket(request):
   tickets = Ticket.objects.all()
   departments =  Department.objects.all().order_by('name')
   types = CategoryType.objects.all().order_by('name')
   statuses = Status.objects.all().order_by('name')
   forms = RequestForm.objects.all().order_by('name')

   context = {'tickets': tickets, 'departments':departments, 'types':types, 'statuses': statuses, 'forms': forms}
   return render(request, 'pages/requests/ticket_lists.html', context)
   
@login_required
@user_is_verified
@permission_required('requests.add_ticket', raise_exception=True)
def create_ticket(request):
   forms= RequestForm.objects.filter(is_active=True).order_by('name')
   types =  CategoryType.objects.filter(is_active=True).order_by('name')

   context = {'forms': forms, 'types': types}
   return render(request, 'pages/requests/ticket_new.html', context)

@login_required
@user_is_verified
@permission_required('requests.change_ticket', raise_exception=True)
def detail_ticket(request, ticket_id):
   ticket = get_object_or_404(Ticket, ticket_id=ticket_id)
   ticket_categories = ticket.category.all()
   steps = RequestFormStatus.objects.select_related('form', 'status').filter(form_id=ticket.request_form).order_by('order') 
   
   if steps.latest('order').status.id != ticket.status.id or request.user.is_superuser:
      forms= RequestForm.objects.prefetch_related('status', 'group', 'category_types').filter(is_active=True).order_by('name')
      categories = Category.objects.filter(category_type=ticket_categories[0].category_type, is_active=True).order_by('name')
      types = ticket.request_form.category_types.filter(is_active=True).order_by('name')
      attachments = Attachment.objects.filter(ticket_id=ticket_id).order_by('-uploaded_at')

      remark = None

      for step in steps:
         if(step.status == ticket.status):
            curr_step = steps.get(status_id=ticket.status)

         remarks = ticket.remarks.filter(ticket_id=ticket_id, status_id=step.status_id, is_approve=True) 
         if step.is_head_step and step.has_approving: 
            remark = remarks.earliest('id') if remarks else None
      context = {
         'ticket': ticket, 
         'forms': forms, 
         'types': types, 
         'categories':categories, 
         'ticket_categories': ticket_categories, 
         'attachments':attachments, 
         'steps':steps, 
         'curr_step':curr_step, 
         'last_step':steps.latest('order'),
         'remark' : remark
      }
      return render(request, 'pages/requests/ticket_detail.html', context)
   else:
      raise Http404()  

@login_required
@user_is_verified
@permission_required('requests.view_ticket', raise_exception=True)
def view_ticket(request, ticket_id):
   ticket = get_object_or_404(Ticket, ticket_id=ticket_id)
   categories = ticket.category.all()
   steps = RequestFormStatus.objects.select_related('form', 'status').filter(form_id=ticket.request_form).order_by('order')   
   attachments = Attachment.objects.filter(ticket_id=ticket_id).order_by('-uploaded_at')

   remark = None

   for step in steps:
      # Get current step in ticket
      if step.status == ticket.status: 
         curr_step = steps.get(status_id=ticket.status) 

      # Get remark if has approving and is head step 
      remarks = ticket.remarks.filter(ticket_id=ticket_id, status_id=step.status_id, is_approve=True) 
      if step.is_head_step and step.has_approving:
         remark = remarks.earliest('id') if remarks else None

   context = {
      'ticket': ticket, 
      'categories' : categories,
      'attachments':attachments, 
      'steps':steps, 
      'curr_step':curr_step, 
      'last_step':steps.latest('order'), 
      'remark': remark
   }
   return render(request, 'pages/requests/ticket_view.html', context)
      
def ticket_log_list(request):
   return render(request, 'pages/requests/track.html', {})

# Create notification method
def create_notification(object_id, ticket, sender):
   log = CRUDEvent.objects.filter(object_id=object_id, event_type__in=list([1, 2, 3])).latest('datetime')
   form_groups = ticket.request_form.group.all()
   requestor = ticket.requested_by
   date_created = ticket.date_created.replace(microsecond=0)
   date_modified = ticket.date_modified.replace(microsecond=0)

   for group in form_groups:
      categories = Category.objects.filter(groups=group)
      if categories:
         for category in categories:
            if ticket.category.filter(id=category.id):
               # create notifications for users in selected group
               users = group.user_set.all()
               for user in users:
                  if not log.user == user and not user == requestor:
                     Notification(log=log, user=user).save()
            else:
               continue
      else:
         # create notifications for users in selected group
         users = group.user_set.all()
         for user in users:
            if not log.user == user and not user == requestor:
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
   remark, created = Remark.objects.get_or_create(ticket=ticket, status=ticket.status, action_officer=ticket.requested_by, log=log)

# Generate reference no
def generate_reference(form):
   year = datetime.datetime.now().year
   ticket = Ticket.objects.filter(request_form=form, date_created__year=year).exclude(reference_no__exact='').order_by('-reference_no').first()
   
   if ticket:
      ref_no = ticket.reference_no.split('-')
      num_series = int(ref_no[2])+1
      reference_no = (str(ticket.request_form.prefix)+"-"+str(year)+"-"+str(num_series).zfill(5))
   else:
      form = RequestForm.objects.get(id=form)
      num_series = "00001"
      reference_no = (str(form.prefix)+"-"+str(year)+"-"+num_series.zfill(5))

   return reference_no