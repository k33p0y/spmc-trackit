from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
   pass

   def __str__(self):
      return '%s %s' % (self.first_name, self.last_name)

# Create your models here.
