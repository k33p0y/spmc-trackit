import uuid
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django_mysql.models import JSONField
from django.contrib.auth.models import Group
from easyaudit.models import CRUDEvent
from config.models import Department, Category, Status
from core.models import User


def upload_file_url(instance, filename):
    ticket_no = str(instance.ticket.ticket_id)[-10:].upper()
    return "attachments/{0}/{1}/".format(ticket_no, filename) 

# Create your models here.
class RequestForm(models.Model):
    name =  models.CharField(max_length=255)
    color = models.CharField(max_length=10, blank=True)
    status = models.ManyToManyField(Status, related_name='forms', blank=True, through='RequestFormStatus')
    fields = JSONField()
    group = models.ManyToManyField(Group, related_name='groups', blank=True)
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

    def __str__(self):
        return str(self.ticket_id)

class RequestFormStatus(models.Model):
    form = models.ForeignKey(RequestForm, on_delete=models.CASCADE)
    status = models.ForeignKey(Status, on_delete=models.CASCADE)
    order = models.PositiveSmallIntegerField(null=True, blank=True)
    is_client_step =  models.BooleanField(default=False)
    is_head_step =  models.BooleanField(default=False)
    has_pass_fail = models.BooleanField(default=False)
    has_approving = models.BooleanField(default=False)
    date_created = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)

    # def __str__(self):
    #     return self.status

class Attachment(models.Model):
    file = models.FileField(upload_to=upload_file_url)
    file_name = models.CharField(max_length=255, blank=True)
    file_type = models.CharField(max_length=255)
    ticket = models.ForeignKey(Ticket, related_name='attachments_ticket', on_delete=models.CASCADE)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.ForeignKey('core.User', related_name='attachments_user', on_delete=models.CASCADE)
    
    def __str__(self):
        return self.name

class Notification(models.Model):
    log = models.ForeignKey(CRUDEvent, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    unread = models.BooleanField(default=True)

class Comment(models.Model):
    content = models.CharField(max_length=160)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='all_comments')
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='comments')
    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return '%s - %s' % (self.ticket, self.user.get_full_name())