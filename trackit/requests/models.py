import uuid
from django.db import models
from django_mysql.models import JSONField

from config.models import Department, Category, Status
from core.models import User

# Create your models here.
class RequestForm(models.Model):
    name =  models.CharField(max_length=255)
    color = models.CharField(max_length=10, blank=True)
    status = models.ManyToManyField(Status, related_name='forms', blank=True)
    fields = JSONField()
    is_active = models.BooleanField(default=True)
    is_archive = models.BooleanField(default=False)

    def __str__(self):
        return self.name

# Main Service Request Model
class Ticket(models.Model):
    ticket_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ticket_no = models.CharField(max_length=25, blank=True)
    request_form = models.ForeignKey(RequestForm, related_name='form_type', on_delete=models.PROTECT)
    form_data = JSONField()
    category = models.ForeignKey(Category, related_name='category', on_delete=models.CASCADE, null=True)
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    requested_by = models.ForeignKey(User, related_name='requestor', on_delete=models.PROTECT)
    status = models.ForeignKey(Status, on_delete=models.SET_NULL, null=True, blank=True)
    date_created = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    is_archive = models.BooleanField(default=False)
