from django.db import models

# Create your models here.
class Department(models.Model):
    name = models.CharField(max_length=255)
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
    is_active = models.BooleanField(default=True)
        
    def __str__(self):
        return self.name
    



