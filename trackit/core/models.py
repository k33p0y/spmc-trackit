from django.db import models
from django.contrib.auth.models import AbstractUser

def upload_document_url(instance, filename):
   user = str(instance.user.username)
   return "verification/{0}/{1}/".format(user, filename) 

class User(AbstractUser):
   department = models.ForeignKey('config.Department', null=True, on_delete=models.CASCADE)
   middle_name = models.CharField(max_length=50, blank=True)
   suffix = models.CharField(max_length=5, blank=True)
   contact_no = models.CharField(max_length=12, blank=True)
   license_no = models.CharField(max_length=25, blank=True)

   verified_by = models.ForeignKey('self', null=True, related_name="verifier", on_delete=models.CASCADE)
   verified_at = models.DateTimeField(null=True)
   is_verified = models.BooleanField(null=True)

   created_by = models.ForeignKey('self', null=True, related_name="creator", on_delete=models.CASCADE)
   modified_by = models.ForeignKey('self', null=True, related_name="modifier", on_delete=models.CASCADE)
   modified_at = models.DateTimeField(auto_now=True)

   def __str__(self):
      return '%s %s' % (self.first_name, self.last_name)
   
   class Meta:
      permissions = (
         ('change_user_password', 'Can change user password'),
         ('verify_user', 'Can verify user'),
      )

class UserVerification(models.Model):
   file = models.FileField(upload_to=upload_document_url)
   file_name = models.CharField(max_length=255, blank=True)
   file_type = models.CharField(max_length=255)
   uploaded_at = models.DateTimeField(auto_now_add=True)
   user = models.ForeignKey(User, related_name='documents', on_delete=models.CASCADE)
