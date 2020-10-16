from django.db import models
from core.models import User

# Create your models here.
class Department(models.Model):
    name = models.CharField(max_length=255)
    department_head = models.ForeignKey(User, related_name='dept_head', on_delete=models.CASCADE, null=True)
    is_active = models.BooleanField(default=True)
    is_archive = models.BooleanField(default=False)

    def __str__(self):
        return self.name

class CategoryType(models.Model):
    name = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    is_archive = models.BooleanField(default=False)

    def __str__(self):
        return self.name
    
class Category(models.Model):
    name = models.CharField(max_length=255)
    category_type = models.ForeignKey(CategoryType, related_name='category_types', on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)
    is_archive = models.BooleanField(default=False)
        
    def __str__(self):
        return self.name
    
class Status(models.Model):
    name = models.CharField(max_length=255)
    date_created = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    is_archive = models.BooleanField(default=False)

    def __str__(self):
        return self.name