from django.shortcuts import render

def login(request):
   return render(request, 'pages/core/login.html')

# Create your views here.
