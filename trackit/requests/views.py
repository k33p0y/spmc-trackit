from django.contrib.auth.decorators import login_required
from django.shortcuts import render

from config.models import Category, CategoryType
from .models import Ticket, RequestForm

# Create your views here.
@login_required
def ticket(request):
   tickets = Ticket.objects.all()
   forms= RequestForm.objects.all()
   types =  CategoryType.objects.all()

   context = {'forms': forms, 'types': types}
   return render(request, 'pages/requests/ticket_lists.html', context)