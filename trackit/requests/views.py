from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import render

from config.models import Category, CategoryType, Department
from .models import Ticket, RequestForm

# Create your views here.
@login_required
def ticket(request):
   tickets = Ticket.objects.all()
   forms= RequestForm.objects.all()
   types =  CategoryType.objects.all()
   departments =  Department.objects.all()

   context = {'forms': forms, 'types': types, 'departments':departments}
   return render(request, 'pages/requests/ticket_lists.html', context)

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