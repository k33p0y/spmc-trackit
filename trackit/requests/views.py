from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404

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
   return render(request, 'pages/requests/ticket_lists.html', {'tickets': tickets, 'departments':departments, 'types':types, 'statuses': statuses})

@login_required
def create_ticket(request):
   forms= RequestForm.objects.filter(is_active=True, is_archive=False)
   types =  CategoryType.objects.filter(is_active=True, is_archive=False)
   departments =  Department.objects.filter(is_active=True, is_archive=False)
   context = {'forms': forms, 'types': types, 'departments':departments}
   return render(request, 'pages/requests/ticket_new.html', context)

@login_required
def detail_ticket(request, ticket_id):
   ticket = get_object_or_404(Ticket, ticket_id=ticket_id)
   
   forms= RequestForm.objects.filter(is_active=True, is_archive=False)
   types =  CategoryType.objects.filter(is_active=True, is_archive=False)
   departments =  Department.objects.filter(is_active=True, is_archive=False)
   categories = Category.objects.filter(category_type=ticket.category.category_type, is_active=True, is_archive=False)

   formstatuses = RequestFormStatus.objects.select_related('form', 'status').filter(form_id=ticket.request_form).order_by('order')   
   attachments = Attachment.objects.filter(ticket_id=ticket_id).order_by('-uploaded_at')

   for formstatus in formstatuses:
      if(formstatus.status == ticket.status):
         step = formstatuses.get(status_id=ticket.status)
         
   last_step = formstatuses.latest('order')

   context = {'ticket': ticket, 'forms': forms, 'types': types, 'departments':departments, 'categories':categories, 'attachments':attachments, 'steps':formstatuses, 'step':step, 'last_step':last_step}
   return render(request, 'pages/requests/ticket_detail.html', context)

# View Ticket Start
@login_required
def view_ticket(request, ticket_id):
   ticket = get_object_or_404(Ticket, ticket_id=ticket_id)

   formstatuses = RequestFormStatus.objects.select_related('form', 'status').filter(form_id=ticket.request_form).order_by('order')   
   attachments = Attachment.objects.filter(ticket_id=ticket_id).order_by('-uploaded_at')

   for formstatus in formstatuses:
      if(formstatus.status == ticket.status):
         step = formstatuses.get(status_id=ticket.status)
   
   last_step = formstatuses.latest('order')

   context = {'ticket': ticket, 'attachments':attachments, 'steps':formstatuses, 'step':step, 'last_step':last_step}
   return render(request, 'pages/requests/ticket_view.html', context)
# View Ticker End

@login_required
def boards(request):
   forms= RequestForm.objects.filter(is_active=True, is_archive=False)
   
   context = {'forms':forms}
   return render(request, 'pages/requests/boards.html', context)

def ticket_log_list(request):
   return render(request, 'pages/requests/track.html', {})