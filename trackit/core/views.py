from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import Permission, Group

@login_required
def home(request):
   return render(request, 'pages/index.html')

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
