from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
   department = models.ManyToManyField('config.Department', through='UserDepartment')

   def __str__(self):
      return '%s %s' % (self.first_name, self.last_name)
   
   class Meta:
      permissions = (
         ('change_user_password', 'Can change user password'),
      )

class UserDepartment(models.Model):
   user = models.ForeignKey(User, on_delete=models.CASCADE)
   department = models.ForeignKey('config.Department', on_delete=models.CASCADE)

   def __str__(self):
      return '%s (%s)' % (self.user, self.department)