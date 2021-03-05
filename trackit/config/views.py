from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from django.contrib.auth.models import Group

from .models import CategoryType, Status
from core.models import User
from requests.models import RequestForm

# Create your views here.
@login_required
def department(request):
   users = User.objects.filter(is_active=True)
   context = {'users': users}
   return render(request, 'pages/config/department.html', context)

@login_required
def category(request):
   types = CategoryType.objects.filter(is_active=True)
   context = {'types': types}
   return render(request, 'pages/config/category.html', context)

@login_required
def types(request):
   return render(request, 'pages/config/types.html')

@login_required
def forms(request):
   statuses = Status.objects.filter(is_active=True)
   types = CategoryType.objects.filter(is_active=True)
   groups = Group.objects.all()
   context = {'statuses': statuses, 'types':types, 'groups': groups}
   return render(request, 'pages/config/forms.html', context)

@login_required
def status_list(request):
   return render(request, 'pages/config/status.html')