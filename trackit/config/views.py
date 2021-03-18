from django.contrib.auth.decorators import login_required, permission_required
from django.shortcuts import render
from django.contrib.auth.models import Group

from .models import CategoryType, Status
from core.models import User
from requests.models import RequestForm

# Create your views here.
@login_required
@permission_required('config.view_department', raise_exception=True)
def department(request):
   users = User.objects.filter(is_active=True)
   context = {'users': users}
   return render(request, 'pages/config/department.html', context)

@login_required
@permission_required('config.view_category', raise_exception=True)
def category(request):
   types = CategoryType.objects.filter(is_active=True)
   context = {'types': types}
   return render(request, 'pages/config/category.html', context)

@login_required
@permission_required('config.view_categorytype', raise_exception=True)
def types(request):
   return render(request, 'pages/config/types.html')

@login_required
@permission_required('requests.view_requestform', raise_exception=True)
def forms(request):
   statuses = Status.objects.filter(is_active=True)
   types = CategoryType.objects.filter(is_active=True)
   groups = Group.objects.all()
   context = {'statuses': statuses, 'types':types, 'groups': groups}
   return render(request, 'pages/config/forms.html', context)

@login_required
@permission_required('config.view_status', raise_exception=True)
def status_list(request):
   return render(request, 'pages/config/status.html')