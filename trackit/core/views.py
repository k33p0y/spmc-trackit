from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import Permission, Group
from core.models import User
from config.models import Department
from requests.models import Ticket, RequestForm

import datetime

@login_required
def home(request):
   now = datetime.datetime.now()
   users = User.objects.filter(date_joined__lte=now, is_active=True, is_superuser=False).order_by('-date_joined')[:8]
   tickets = Ticket.objects.filter(date_created__lte=now, is_active=True).order_by('-date_created')[:6]

   context =  {"users": users, "tickets":tickets}
   return render(request, 'pages/index.html', context)

@login_required
def group_list(request):
   permissions = Permission.objects.all()
   return render(request, 'pages/core/group_list.html', {'permissions': permissions})

@login_required
def user_list(request):
   permissions = Permission.objects.all()
   groups = Group.objects.all()
   departments = Department.objects.filter(is_active=True)

   context = {
      'permissions': permissions,
      'groups': groups,
      'departments' : departments
   }
   return render(request, 'pages/core/user_list.html', context)

@login_required
def user_profile(request, pk):
   if request.user.id == pk:
      user = User.objects.get(id=pk)
      tickets = Ticket.objects.filter(requested_by=user.id, is_active=True)[:5]
      departments = Department.objects.filter(is_active=True)

      context = {'user': user, 'tickets': tickets, 'departments': departments}
      return render(request, 'pages/core/user_profile.html', context)
   else:
      return redirect('page_not_found')

# Error Template 403, 404 & 500
def forbidden(request):
   return render(request, 'pages/403.html')

def page_not_found(request):
   return render(request, 'pages/404.html')

def unexpected_error(request):
   return render(request, 'pages/500.html')
