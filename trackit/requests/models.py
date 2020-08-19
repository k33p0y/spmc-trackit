import uuid
from django.db import models
from django_mysql.models import JSONField

from config.models import Department
from core.models import User

# Create your models here.
class FormType(models.Model):
    name =  models.CharField(max_length=255)
    color = models.CharField(max_length=10, blank=True)
    form_fields = JSONField()
    is_active = models.BooleanField(default=True)
    is_archive = models.BooleanField(default=False)

    def __str__(self):
        return self.name

# Main Service Request Model
class Ticket(models.Model):
    ticket_id = models.UUIDField(primary_key=True, editable=False)
    formtype_id = models.ForeignKey(FormType, related_name='form_type', on_delete=models.PROTECT)
    form_data = JSONField()
    reference_no = models.PositiveIntegerField()
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    requested_by = models.ForeignKey(User, related_name='requestor', on_delete=models.PROTECT)
    date_created = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    is_archive = models.BooleanField(default=False)
