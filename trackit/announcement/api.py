from rest_framework import viewsets, permissions
from .serializers import ArticleListSerializer
from .models import Article, Resources

class ArticleListViewSet(viewsets.ModelViewSet):    
   serializer_class = ArticleListSerializer
   queryset = Article.objects.all()
   permission_classes = [permissions.IsAuthenticated]
