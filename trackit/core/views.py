from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required, permission_required
from django.contrib.auth.models import Permission, Group
from django.db.models import Q
from django.http import Http404
from django.template.response import SimpleTemplateResponse
from core.models import User
from config.models import Department
from requests.models import Ticket, RequestForm

import datetime

def register(request):
   departments = Department.objects.filter(is_active=True).order_by('name')
   return render(request, 'registration/register.html', {'departments': departments})

@login_required
def verification(request):
   user = User.objects.get(pk=request.user.pk)
   return render(request, 'registration/verify.html', {'user' : user})

@login_required
def home(request):
   now = datetime.datetime.now()
   users = User.objects.filter(date_joined__lte=now, is_active=True, is_superuser=False).order_by('-date_joined')[:8]
   tickets = Ticket.objects.filter(date_created__lte=now, is_active=True).order_by('-date_created')[:6]

   context =  {"users": users, "tickets":tickets}
   return render(request, 'pages/index.html', context)

@login_required
@permission_required('core.view_group', raise_exception=True)
def group_list(request):
   permissions = Permission.objects.all()
   return render(request, 'pages/core/group_list.html', {'permissions': permissions})

@login_required
@permission_required('core.view_user', raise_exception=True)
def user_list(request):
   users = User.objects.select_related('department', 'verified_by').prefetch_related('documents').all()
   

   permissions = Permission.objects.all()
   groups = Group.objects.all().order_by('name')
   departments = Department.objects.all().order_by('name')

   active_users = users.filter(is_active=True) # get active users
   inactive_users = users.filter(is_active=False) # get inactive users
   members = users.filter(is_active=True, is_staff=False, is_superuser=False) # get non staff users
   staff = users.filter(is_active=True, is_staff=True, is_superuser=False)  # get staff users
   superuser = users.filter(is_active=True, is_superuser=True)  # get superusers
   not_verified = users.filter(documents__isnull=True, verified_at__isnull=True) # get unverified
   pending_documents = users.filter(documents__isnull=False, verified_at__isnull=True) # get pending users
   verified = users.filter(Q(verified_at__isnull=False) | Q(is_superuser=True)) # get verified users

   select_departments = departments.filter(is_active=True)

   context = {
      'permissions': permissions,
      'groups': groups,
      'departments' : departments,
      'select_departments' : select_departments,
      'users' : users,
      'active_users' : active_users,
      'inactive_users' : inactive_users,
      'members' : members,
      'staff' : staff,
      'superuser' : superuser,
      'not_verified' : not_verified,
      'verified' : verified,
      'pending_documents' : pending_documents
   }
   return render(request, 'pages/core/user_list.html', context)

@login_required
def user_profile(request, pk):
   if request.user.id == pk:
      user = User.objects.get(id=pk)
      tickets = Ticket.objects.filter(requested_by=user.id, is_active=True)[:5]
      departments = Department.objects.filter(is_active=True).order_by('name')

      context = {'user': user, 'tickets': tickets, 'departments': departments}
      return render(request, 'pages/core/user_profile.html', context)
   else:
      raise Http404()

# Error Template 403, 404 & 500
def forbidden(request, exception=None):
   return SimpleTemplateResponse('pages/403.html', status=403)

def page_not_found(request, exception=None):
   return SimpleTemplateResponse('pages/404.html', status=404)

def unexpected_error(request, exception=None):
  return SimpleTemplateResponse('pages/500.html', status=500)