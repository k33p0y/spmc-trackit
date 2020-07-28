from django.shortcuts import render
from core.models import User

# Create your views here.
def department(request):
   users = User.objects.all()
   context = {'users': users}
   return render(request, 'pages/config/department.html', context)

def category(request):
   return render(request, 'pages/config/category.html')