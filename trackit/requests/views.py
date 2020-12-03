from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import render

from config.models import Category, CategoryType, Department
from .models import Ticket, RequestForm

# Create your views here.
@login_required
def ticket(request):
   return render(request, 'pages/requests/ticket_lists.html')

@login_required
def create_ticket(request):
   forms= RequestForm.objects.filter(is_active=True, is_archive=False)
   types =  CategoryType.objects.filter(is_active=True, is_archive=False)
   departments =  Department.objects.filter(is_active=True, is_archive=False)
   
   context = {'forms': forms, 'types': types, 'departments':departments}
   return render(request, 'pages/requests/ticket_new.html', context)

@login_required
def boards(request):
   forms= RequestForm.objects.all()
   
   context = {'forms':forms}
   return render(request, 'pages/requests/boards.html', context)

@login_required
def get_category(request):
   cat_type = request.POST.get('type_id', None)

   categories = Category.objects.filter(category_type = cat_type, is_active=True, is_archive=False).values('id', 'name')
   data = list(categories)

   return JsonResponse(data, safe=False)

def ticket_log_list(request):
   return render(request, 'pages/requests/track.html', {})