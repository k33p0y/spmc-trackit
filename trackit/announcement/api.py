from rest_framework import viewsets, permissions
from rest_framework.response import Response
from .serializers import ArticleListSerializer, ArticlePublishSerializer, ResourcesSerializer
from .models import Article, Resources

import json

class ArticleListViewSet(viewsets.ModelViewSet):    
   serializer_class = ArticleListSerializer
   queryset = Article.objects.all()
   permission_classes = [permissions.IsAuthenticated]

class ArticlePublishViewSet(viewsets.ModelViewSet):    
   serializer_class = ArticlePublishSerializer
   queryset = Article.objects.all()
   http_method_names = ['put', 'head']
   permission_classes = [permissions.IsAuthenticated]

class ResourcesViewSet(viewsets.ModelViewSet):    
   serializer_class = ResourcesSerializer
   queryset = Resources.objects.all()
   permission_classes = [permissions.IsAuthenticated]

   def create(self, request):
      file = request.FILES['file']
      data = json.loads(request.FILES['data'].read())    

      try:
         resource = Resources.objects.create(
            article_id=data['article'],
            file=file, 
            file_name=file.name, 
            file_type=file.content_type, 
            uploaded_by=self.request.user
         )
         serializer = ResourcesSerializer(resource)
      except Exception as error:
         article = Article.objects.get(id=data['article'])
         article.delete()
         raise error
      return Response(serializer.data)
