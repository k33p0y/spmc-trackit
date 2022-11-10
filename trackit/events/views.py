from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth.decorators import login_required, permission_required
from django.core.validators import URLValidator
from django.core.exceptions import ValidationError
from django.shortcuts import render, get_object_or_404
from .models import Event, EventDate, EventTicket
from easyaudit.models import CRUDEvent
from config.models import Remark
from requests.models import Ticket, RequestForm, RequestFormStatus

from core.decorators import user_is_verified, user_is_staff_member

# Create your views here.
@login_required
@user_is_verified
@user_is_staff_member
@permission_required('events.view_event', raise_exception=True)
def event(request):
   forms = RequestForm.objects.filter(is_active=True)
   return render(request, 'pages/events/manage.html', {'forms': forms})

@login_required
@user_is_verified
@user_is_staff_member
@permission_required('events.view_event', raise_exception=True)
def event_calendar(request):
   forms = RequestForm.objects.filter(is_active=True)
   return render(request, 'pages/events/calendar.html', {'forms' : forms})

@login_required
@user_is_verified
@user_is_staff_member
@permission_required('events.add_event', raise_exception=True)
def create_event(request):
   forms = RequestForm.objects.filter(is_active=True)
   return render(request, 'pages/events/event_new.html', {'forms' : forms})

@login_required
@user_is_verified
@user_is_staff_member
@permission_required('events.view_event', raise_exception=True)
def view_event(request, pk):
   event = get_object_or_404(Event.objects.prefetch_related('dates'), pk=pk)
   return render(request, 'pages/events/event_view.html', {'event' : event})

@login_required
@user_is_verified
@user_is_staff_member
@permission_required('events.change_event', raise_exception=True)
def change_event(request, pk):
   event = get_object_or_404(Event.objects.prefetch_related('dates'), pk=pk)
   forms = RequestForm.objects.all()
   return render(request, 'pages/events/event_change.html', {'event' : event, 'forms' : forms})

def is_string_an_url(url_string: str) -> bool:
   validate_url = URLValidator(message=None)
   try:
      if (url_string): 
         validate_url(url_string)
   except ValidationError:
      return False
   return True

def update_ticket_status(event_ticket, event_ticket_obj, user):
   ticket = Ticket.objects.get(pk=event_ticket.ticket.ticket_id   )  # get ticket queryset
   steps =  RequestFormStatus.objects.select_related('form', 'status').filter(form=ticket.request_form).order_by('order')  # get status queryset
   last_step = steps.latest('order') # get last step
   first_step = steps.first() # get first step
   curr_step = steps.get(status_id=ticket.status)
   next_step = steps.get(order=curr_step.order+1) if not curr_step.status == last_step.status else curr_step # next current step
   prev_step = steps.get(order=curr_step.order-1) if not curr_step.status == first_step.status else curr_step # prev current step
   
   # update ticket status
   ticket.status = next_step.status if event_ticket_obj['attended'] else prev_step.status  # if obj is True, proceed to next step else prev step
   ticket.save()

   # get log from easyaudit
   log = CRUDEvent.objects.filter(object_id=ticket).latest('datetime') 
   Remark.objects.create(ticket_id=ticket.pk, status=ticket.status, action_officer=user, log=log) # create a remark


                    