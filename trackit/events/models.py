from django.db import models
from core.models import User
from requests.models import Ticket, RequestForm

# Create your models here.
class Event(models.Model):
    title = models.CharField(max_length=155)
    subject = models.CharField(max_length=255, blank=True)
    event_for = models.ForeignKey(RequestForm, related_name='events', on_delete=models.CASCADE)
    highlight = models.CharField(max_length=50, blank=True)
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
    venue = models.CharField(max_length=255, null=False, blank=False)
    address = models.URLField(max_length=200, blank=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return '%s, %s-%s' % (self.date, self.time_start, self.time_end)

    def date_start(self):
        return '%s %s' % (self.date, self.time_start)

    def date_end(self):
        return '%s %s' % (self.date, self.time_end)
    
    class Meta:
        unique_together = [['event', 'date', 'time_start', 'time_end']]

class EventTicket(models.Model):
    ticket = models.ForeignKey(Ticket, related_name="events", on_delete=models.CASCADE)
    scheduled_event = models.ForeignKey(EventDate, related_name='participants', on_delete=models.CASCADE)
    attended = models.BooleanField(null=True)
    remarks = models.CharField(max_length=100, null=True, blank=True)
    is_reschedule = models.BooleanField(default=False)