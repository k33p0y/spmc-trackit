from django.contrib.auth.decorators import login_required
from django.shortcuts import render

from .models import CategoryType, Status
from core.models import User
from requests.models import RequestForm

# Create your views here.
@login_required
def department(request):
   users = User.objects.all()
   context = {'users': users}
   return render(request, 'pages/config/department.html', context)

@login_required
def category(request):
   types = CategoryType.objects.all()
   context = {'types': types}
   return render(request, 'pages/config/category.html', context)

@login_required
def types(request):
   return render(request, 'pages/config/types.html')

@login_required
def forms(request):
   status_qs = Status.objects.filter(is_active=True, is_archive=False)
   context = {'status_qs': status_qs}
   return render(request, 'pages/config/forms.html', context)
