from django.db import models
from core.models import User

def upload_resources_url(instance, filename):
   article = str(instance.article.pk)
   return "announcement/article_{0}/resources/{1}/".format(article, filename) 

# Create your models here.
class Article(models.Model):
    title = models.CharField(max_length=255)
    preface = models.CharField(max_length=255)
    content = models.TextField(blank=True)
    author = models.ForeignKey(User, related_name="articles",  on_delete=models.CASCADE)
    date_publish = models.DateTimeField(auto_now_add=True)
    is_publish = models.BooleanField(default=False)
    
    modified_by = models.ForeignKey(User, null=True, related_name="modified_articles", on_delete=models.CASCADE)
    modified_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

class Resources(models.Model):
    file = models.FileField(upload_to=upload_resources_url)
    file_name = models.CharField(max_length=255, blank=True)
    file_type = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.ForeignKey(User, related_name='uploader', on_delete=models.CASCADE)
    article = models.ForeignKey(Article, related_name='resources', on_delete=models.CASCADE)
