from django.contrib.auth.decorators import login_required
from django.shortcuts import render

from .models import Ticket

# Create your views here.
@login_required
def ticket(request):
   tickets = Ticket.objects.all()
   return render(request, 'pages/requests/ticket_lists.html')