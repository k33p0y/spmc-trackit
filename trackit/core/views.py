from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import Permission, Group
from core.models import User
from requests.models import Ticket, RequestForm

import datetime

@login_required
def home(request):
   now = datetime.datetime.now()
   users = User.objects.filter(date_joined__lte=now, is_active=True, is_superuser=False).order_by('-date_joined')[:8]
   tickets = Ticket.objects.filter(date_created__lte=now, is_active=True, is_archive=False).order_by('-date_created')[:6]

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

   context = {
      'permissions': permissions,
      'groups': groups
   }
   return render(request, 'pages/core/user_list.html', context)

@login_required
def user_profile(request, pk):
   user = User.objects.get(id=pk)
   context = {
      'user': user
   }
   return render(request, 'pages/core/user_profile.html', context)