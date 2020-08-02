from django.shortcuts import render
from .models import CategoryType
from core.models import User

# Create your views here.
def department(request):
   users = User.objects.all()
   context = {'users': users}
   return render(request, 'pages/config/department.html', context)

def category(request):
   types = CategoryType.objects.all()
   context = {'types': types}
   return render(request, 'pages/config/category.html', context)

def types(request):
   return render(request, 'pages/config/types.html')