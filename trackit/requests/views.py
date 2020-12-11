from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404

from config.models import Category, CategoryType, Department
from .models import Ticket, RequestForm

import json

# Create your views here.
@login_required
def ticket(request):
   tickets = Ticket.objects.all()
   return render(request, 'pages/requests/ticket_lists.html', {tickets: tickets})

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
   
   return render(request, 'pages/requests/ticket_detail.html', {'ticket': tickets})

@login_required
def boards(request):
   forms= RequestForm.objects.all()
   
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