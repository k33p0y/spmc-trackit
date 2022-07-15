from django.db import models
from requests.models import Ticket
from config.models import Status
from core.models import User

# Create your models here.
class Task(models.Model):
    ticket = models.ForeignKey(Ticket, related_name='tasks', on_delete=models.CASCADE)
    task_type = models.ForeignKey(Status, on_delete=models.CASCADE)
    member = models.ManyToManyField("self", symmetrical=False, blank=True, through='Member')
    date_completed = models.DateTimeField(auto_now=True)
    is_pending = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)

class Member(models.Model):
    member = models.ForeignKey(User, related_name='task_members', on_delete=models.CASCADE)
    task = models.ForeignKey(Task, related_name='members', on_delete=models.CASCADE)
    assign_by = models.ForeignKey(User, related_name='task_assignees', on_delete=models.CASCADE)
    date_assigned = models.DateTimeField(auto_now_add=True)

