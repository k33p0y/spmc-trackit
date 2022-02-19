from rest_framework import viewsets, permissions
from rest_framework.response import Response
from .serializers import ArticleListSerializer, ArticlePublishSerializer
from .models import Article, Resources

class ArticleListViewSet(viewsets.ModelViewSet):    
   serializer_class = ArticleListSerializer
   queryset = Article.objects.all()
   permission_classes = [permissions.IsAuthenticated]

class ArticlePublishViewSet(viewsets.ModelViewSet):    
   serializer_class = ArticlePublishSerializer
   queryset = Article.objects.all()
   http_method_names = ['put', 'head']
   permission_classes = [permissions.IsAuthenticated]