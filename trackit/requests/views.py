from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404

from config.models import Category, CategoryType, Department, Status
from .models import Ticket, RequestForm, Attachment

import json

# Create your views here.
@login_required
def ticket(request):
   tickets = Ticket.objects.all()
   departments =  Department.objects.filter(is_active=True, is_archive=False)
   categories = Category.objects.filter(is_active=True, is_archive=False)
   statuses = Status.objects.filter(is_active=True, is_archive=False)
   return render(request, 'pages/requests/ticket_lists.html', {'tickets': tickets, 'departments':departments, 'categories':categories, 'statuses': statuses})

@login_required
def create_ticket(request):
   forms= RequestForm.objects.filter(is_active=True, is_archive=False)
   types =  CategoryType.objects.filter(is_active=True, is_archive=False)
   departments =  Department.objects.filter(is_active=True, is_archive=False)
   context = {'forms': forms, 'types': types, 'departments':departments}
   return render(request, 'pages/requests/ticket_new.html', context)

@login_required
def detail_ticket(request, ticket_id):
   tickets = get_object_or_404(Ticket, ticket_id=ticket_id)
   
   forms= RequestForm.objects.filter(is_active=True, is_archive=False)
   types =  CategoryType.objects.filter(is_active=True, is_archive=False)
   departments =  Department.objects.filter(is_active=True, is_archive=False)
   categories = Category.objects.filter(category_type=tickets.category.category_type, is_active=True, is_archive=False)

   attachments = Attachment.objects.filter(ticket_id=ticket_id).order_by('-uploaded_at')
   
   context = {'tickets': tickets, 'forms': forms, 'types': types, 'departments':departments, 'categories':categories, 'attachments':attachments}
   return render(request, 'pages/requests/ticket_detail.html', context)

# View Ticket Start
@login_required
def view_ticket(request, ticket_id):
   tickets = get_object_or_404(Ticket, ticket_id=ticket_id)
   
   forms= RequestForm.objects.filter(is_active=True, is_archive=False)
   types =  CategoryType.objects.filter(is_active=True, is_archive=False)
   departments =  Department.objects.filter(is_active=True, is_archive=False)
   categories = Category.objects.filter(category_type=tickets.category.category_type, is_active=True, is_archive=False)
   
   attachments = Attachment.objects.filter(ticket_id=ticket_id).order_by('-uploaded_at')
   
   context = {'tickets': tickets, 'forms': forms, 'types': types, 'departments':departments, 'categories':categories, 'attachments':attachments}
   return render(request, 'pages/requests/ticket_view.html', context)
# View Ticker End

@login_required
def boards(request):
   forms= RequestForm.objects.filter(is_active=True, is_archive=False)
   
   context = {'forms':forms}
   return render(request, 'pages/requests/boards.html', context)

@login_required
def get_category(request):
   # decode byte string
   body_unicode = request.body.decode('utf-8')
   data = json.loads(body_unicode)
   
   type_id = data['type_id']

   categories = Category.objects.filter(category_type = type_id, is_active=True, is_archive=False).values('id', 'name')
   category_lists = list(categories)

   return JsonResponse(category_lists, safe=False)

def ticket_log_list(request):
   return render(request, 'pages/requests/track.html', {})