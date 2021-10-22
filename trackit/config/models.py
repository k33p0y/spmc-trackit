from django.db import models
from core.models import User
from django.contrib.auth.models import Group
from easyaudit.models import CRUDEvent

# Create your models here.
class Department(models.Model):
    name = models.CharField(max_length=255)
    department_head = models.ForeignKey(User, related_name='dept_head', on_delete=models.CASCADE, null=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class CategoryType(models.Model):
    name = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name
    
class Category(models.Model):
    name = models.CharField(max_length=255)
    category_type = models.ForeignKey(CategoryType, related_name='category_types', on_delete=models.CASCADE)
    groups = models.ManyToManyField(Group, related_name='category_groups', blank=True)
    is_active = models.BooleanField(default=True)
        
    def __str__(self):
        return self.name
    
class Status(models.Model):
    name = models.CharField(max_length=255)
    date_created = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class Remark(models.Model):
    remark = models.CharField(max_length=100, blank=True)
    date_created = models.DateTimeField(auto_now_add=True)
    ticket = models.ForeignKey('requests.Ticket', related_name='remarks', on_delete=models.CASCADE)
    action_officer = models.ForeignKey(User, related_name='all_remarks', on_delete=models.CASCADE)
    log = models.OneToOneField(CRUDEvent, on_delete=models.CASCADE)
    status = models.ForeignKey(Status, related_name='statuses', on_delete=models.CASCADE)
    is_approve = models.BooleanField(null=True)
    is_pass = models.BooleanField(null=True)

    def __str__(self):
        return self.remark