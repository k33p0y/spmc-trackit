from django.shortcuts import render

# Create your views here.
def department(request):
   return render(request, 'pages/core/login.html')

def category(request):
   return render(request, 'pages/core/login.html')

def categorytype(request):
   return render(request, 'pages/core/login.html')