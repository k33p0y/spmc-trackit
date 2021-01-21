import uuid
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django_mysql.models import JSONField
from django.contrib.auth.models import Group
from easyaudit.models import CRUDEvent
from config.models import Department, Category, Status
from core.models import User

# Create your models here.
class RequestForm(models.Model):
    name =  models.CharField(max_length=255)
    color = models.CharField(max_length=10, blank=True)
    status = models.ManyToManyField(Status, related_name='forms', blank=True, through='RequestFormStatus')
    fields = JSONField()
    group = models.ForeignKey(Group, on_delete=models.SET_NULL, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_archive = models.BooleanField(default=False)
    date_created = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

# Main Service Request Model
class Ticket(models.Model):
    ticket_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ticket_no = models.CharField(max_length=25, blank=True)
    form_data = JSONField()
    
    request_form = models.ForeignKey(RequestForm, related_name='formtype_tickets', on_delete=models.PROTECT)
    category = models.ForeignKey(Category, related_name='category_tickets', on_delete=models.CASCADE, null=True)
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    requested_by = models.ForeignKey(User, related_name='user_tickets', on_delete=models.PROTECT)
    status = models.ForeignKey(Status, related_name='status_tickets', on_delete=models.SET_NULL, null=True, blank=True)

    date_created = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    is_archive = models.BooleanField(default=False)

class RequestFormStatus(models.Model):
    form = models.ForeignKey(RequestForm, on_delete=models.CASCADE)
    status = models.ForeignKey(Status, on_delete=models.CASCADE)
    order = models.PositiveSmallIntegerField(null=True, blank=True)
    date_created = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.status

class Attachment(models.Model):
    name = models.CharField(max_length=255, blank=True)
    path = models.FileField(upload_to="attachments/")
    ticket = models.ForeignKey(Ticket, related_name='attachments_ticket', on_delete=models.CASCADE)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.ForeignKey('core.User', related_name='attachments_user', on_delete=models.CASCADE)

    def __str__(self):
        return self.name

class Notification(models.Model):
    log = models.ForeignKey(CRUDEvent, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    unread = models.BooleanField(default=True)

@receiver(post_save, sender=Ticket)
def save_ticket_no(sender, instance, **kwargs):
    instance_id = instance.ticket_id
    ticket_num = str(instance_id)[-10:].upper()
    status = instance.request_form.status.get(requestformstatus__order=1)

    if not instance.status:
        Ticket.objects.filter(pk=instance.pk).update(ticket_no=ticket_num, status=status)
    else:
        Ticket.objects.filter(pk=instance.pk).update(ticket_no=ticket_num)