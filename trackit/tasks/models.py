from django.db import models
from requests.models import Ticket, RequestFormStatus
from config.models import Status
from core.models import User

# Create your models here.
class Task(models.Model):
    ticket = models.ForeignKey(Ticket, related_name='tasks', on_delete=models.CASCADE)
    task_type = models.ForeignKey(RequestFormStatus, on_delete=models.CASCADE)
    opentask_str = models.CharField(max_length=255, blank=True)
    officers = models.ManyToManyField(User, related_name='task_teams', blank=True, through='Team', through_fields=('task', 'member'))
    date_completed = models.DateTimeField(null=True)
    date_created = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    # In reference to 'members' ManyToManyField
    # https://docs.djangoproject.com/en/3.2/ref/models/fields/#django.db.models.ManyToManyField.through

    # through_fields accepts a 2-tuple ('field1', 'field2'), 
    # where field1 is the name of the foreign key to the model the ManyToManyField is defined on (task in this case), 
    # and field2 the name of the foreign key to the target model (member in this case).

class Team(models.Model):
    task = models.ForeignKey(Task, related_name="members", on_delete=models.CASCADE)
    member = models.ForeignKey(User, related_name="team_members", on_delete=models.CASCADE)
    assignee = models.ForeignKey(User, related_name='task_assignees', null=True, on_delete=models.CASCADE)
    date_assigned = models.DateTimeField(auto_now_add=True)
    remark = models.CharField(max_length=100, blank=True)

class OpenTask(models.Model):
    ticket = models.ForeignKey(Ticket, related_name='open_tasks', on_delete=models.CASCADE)
    task_type = models.ForeignKey(RequestFormStatus, on_delete=models.CASCADE)
