from django.shortcuts import render

# Create your views here.
def department(request):
   return render(request, 'pages/config/department.html')

def category(request):
   return render(request, 'pages/config/category.html')