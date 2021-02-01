from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import Permission, Group
from core.models import User
from requests.models import Ticket, RequestForm

@login_required
def home(request):
   userCount = User.objects.all().count()
   userActiveCount = User.objects.filter(is_active=True).count()
   userInactiveCount = User.objects.filter(is_active= False).count()
   ticketCount = Ticket.objects.all().count()
   ticketActiveCount = Ticket.objects.filter(is_active=True).count()
   ticketInactiveCount = Ticket.objects.filter(is_active=False).count()
   requestFormCount = RequestForm.objects.all().count()
   return render(request, 'pages/index.html', {
      'userCount': userCount,
      'userActiveCount': userActiveCount,
      'userInactiveCount': userInactiveCount,
      'ticketCount': ticketCount,
      'ticketActiveCount': ticketActiveCount,
      'ticketInactiveCount': ticketInactiveCount,
      'requestFormCount': requestFormCount
   })

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
