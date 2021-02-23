from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404
from django.db.models import Q

from config.models import Category, CategoryType, Department, Status
from .models import Ticket, RequestForm, Attachment, RequestFormStatus

import json

# Create your views here.
@login_required
def ticket(request):
   tickets = Ticket.objects.all()
   departments =  Department.objects.filter(is_active=True, is_archive=False)
   types = CategoryType.objects.filter(is_active=True, is_archive=False)
   statuses = Status.objects.filter(is_active=True, is_archive=False)

   context = {'tickets': tickets, 'departments':departments, 'types':types, 'statuses': statuses}
   return render(request, 'pages/requests/ticket_lists.html', context)

@login_required
def create_ticket(request):
   forms= RequestForm.objects.filter(is_active=True, is_archive=False)
   types =  CategoryType.objects.filter(is_active=True, is_archive=False)
   departments =  Department.objects.filter(is_active=True, is_archive=False)

   context = {'forms': forms, 'types': types, 'departments':departments}
   return render(request, 'pages/requests/ticket_new.html', context)   # if request.user has_perm('requests_change_')   # if request.user has_perm('requests_change_')

@login_required
def detail_ticket(request, ticket_id):
   ticket = get_object_or_404(Ticket, ticket_id=ticket_id)
   
   forms= RequestForm.objects.filter(is_active=True, is_archive=False)
   types =  CategoryType.objects.filter(is_active=True, is_archive=False)
   departments =  Department.objects.filter(is_active=True, is_archive=False)
   categories = Category.objects.filter(category_type=ticket.category.category_type, is_active=True, is_archive=False)

   steps = RequestFormStatus.objects.select_related('form', 'status').filter(form_id=ticket.request_form).order_by('order')   
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
      'departments':departments, 
      'categories':categories, 
      'attachments':attachments, 
      'steps':steps, 
      'curr_step':curr_step, 
      'last_step':steps.latest('order'),
      'remark' : remark
   }
   return render(request, 'pages/requests/ticket_detail.html', context)


@login_required
def view_ticket(request, ticket_id):
   ticket = get_object_or_404(Ticket, ticket_id=ticket_id)
   steps = RequestFormStatus.objects.select_related('form', 'status').filter(form_id=ticket.request_form).order_by('order')   
   attachments = Attachment.objects.filter(ticket_id=ticket_id).order_by('-uploaded_at')

   remark = None

   for step in steps:
      # Get current step in ticket
      if step.status == ticket.status: 
         curr_step = steps.get(status_id=ticket.status) 

      # Get remark if has approving and is client step 
      remarks = ticket.remarks.filter(ticket_id=ticket_id, status_id=step.status_id, is_approve=True) 
      if step.is_head_step and step.has_approving: 
         remark = remarks.earliest('id') if remarks else None

   context = {
      'ticket': ticket, 
      'attachments':attachments, 
      'steps':steps, 
      'curr_step':curr_step, 
      'last_step':steps.latest('order'), 
      'remark': remark
   }
   return render(request, 'pages/requests/ticket_view.html', context)
      
def ticket_log_list(request):
   return render(request, 'pages/requests/track.html', {})