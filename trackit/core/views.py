from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import Permission, Group
from core.models import User
from requests.models import Ticket, RequestForm

from datetime import datetime

@login_required
def home(request):
   today = datetime.now().date()
   users = User.objects.filter(date_joined__lte=today, is_active=True, is_superuser=False).order_by('-date_joined')[:8]
   return render(request, 'pages/index.html', {"users": users})

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
