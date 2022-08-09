from django.contrib.auth.decorators import login_required, permission_required
from django.shortcuts import render
from django.contrib.auth.models import Group

from .models import CategoryType, Status
from core.models import User
from requests.models import RequestForm

from core.decorators import user_is_verified, user_is_staff_member

# Create your views here.
@login_required
@user_is_verified
@user_is_staff_member
@permission_required('config.view_department', raise_exception=True)
def department(request):
   users = User.objects.filter(is_active=True).order_by('first_name')
   context = {'users': users}
   return render(request, 'pages/config/department.html', context)

@login_required
@user_is_verified
@user_is_staff_member
@permission_required('config.view_category', raise_exception=True)
def category(request):
   types = CategoryType.objects.all().order_by('name')
   select_types = types.filter(is_active=True)
   groups = Group.objects.all().order_by('name')
   context = {'types': types, 'select_types': select_types, 'groups':groups}
   return render(request, 'pages/config/category.html', context)

@login_required
@user_is_verified
@user_is_staff_member
@permission_required('config.view_categorytype', raise_exception=True)
def types(request):
   return render(request, 'pages/config/types.html')

@login_required
@user_is_verified
@user_is_staff_member
@permission_required('requests.view_requestform', raise_exception=True)
def forms(request):
   statuses = Status.objects.filter(is_active=True).order_by('name')
   types = CategoryType.objects.filter(is_active=True).order_by('name')
   groups = Group.objects.all().order_by('name')
   users = User.objects.filter(is_active=True, is_staff=True).order_by('first_name')
   context = {'statuses': statuses, 'types':types, 'groups': groups, 'users' : users}
   return render(request, 'pages/config/forms.html', context)

@login_required
@user_is_verified
@user_is_staff_member
@permission_required('config.view_status', raise_exception=True)
def status_list(request):
   return render(request, 'pages/config/status.html')