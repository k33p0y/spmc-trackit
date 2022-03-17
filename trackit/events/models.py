from django.db import models
from core.models import User
from requests.models import Ticket, RequestForm

# Create your models here.
class Event(models.Model):
    title = models.CharField(max_length=155)
    subject = models.CharField(max_length=255, blank=True)
    event_for = models.ForeignKey(RequestForm, related_name='events', on_delete=models.CASCADE)
    created_by = models.ForeignKey(User, related_name="event_creator", on_delete=models.CASCADE)
    modified_by = models.ForeignKey(User, related_name="event_modifier", on_delete=models.CASCADE)
    date_created = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.title

    def get_dates(self):
        scheduled_dates = EventDate.objects.select_related('event').filter(event=self).order_by('date').values('date')
        return scheduled_dates

    def get_num_participants(self):
        participants = EventTicket.objects.select_related('event', 'ticket').filter(event=self)
        return participants.count()

class EventDate(models.Model):
    event = models.ForeignKey(Event, related_name='dates', on_delete=models.CASCADE)
    date = models.DateField(null=False, blank=False)
    time_start = models.TimeField(null=False, blank=False)
    time_end = models.TimeField(null=False, blank=False)

class EventTicket(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE)
    event = models.ForeignKey(Event, related_name='participants', on_delete=models.CASCADE)
    attended = models.BooleanField(default=False)
    remarks = models.CharField(max_length=100, null=True, blank=True)
