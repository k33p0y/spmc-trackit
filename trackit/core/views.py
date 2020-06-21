from django.shortcuts import render

def login(request):
   return render(request, 'pages/core/login.html')

def home(request):
   return render(request, 'pages/index.html')

# Create your views here.
