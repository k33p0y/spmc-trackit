from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from django.contrib.auth.models import Group

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
   statuses = Status.objects.filter(is_active=True, is_archive=False)
   groups = Group.objects.all()
   context = {'statuses': statuses, 'groups': groups}
   return render(request, 'pages/config/forms.html', context)

@login_required
def status_list(request):
   return render(request, 'pages/config/status.html')

@login_required
def archive(request):
   return render(request, 'pages/config/archives.html')