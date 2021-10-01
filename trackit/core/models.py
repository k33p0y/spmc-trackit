from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
   department = models.ForeignKey('config.Department', null=True, on_delete=models.CASCADE)
   middle_name = models.CharField(max_length=50, blank=True)
   suffix = models.CharField(max_length=5, blank=True)
   contact_no = models.CharField(max_length=12, blank=True)
   license_no = models.CharField(max_length=25, blank=True)

   def __str__(self):
      return '%s %s' % (self.first_name, self.last_name)
   
   class Meta:
      permissions = (
         ('change_user_password', 'Can change user password'),
      )