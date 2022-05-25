from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth.decorators import login_required, permission_required
from django.shortcuts import render, get_object_or_404
from .models import Event, EventDate, EventTicket
from requests.models import RequestForm

from core.decorators import user_is_verified, user_is_staff_member

# Create your views here.
@login_required
@user_is_verified
@user_is_staff_member
@permission_required('events.view_event', raise_exception=True)
def event(request):
   return render(request, 'pages/events/manage.html', {})

@login_required
@user_is_verified
@user_is_staff_member
@permission_required('events.view_event', raise_exception=True)
def event_calendar(request):
   return render(request, 'pages/events/calendar.html', {})

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