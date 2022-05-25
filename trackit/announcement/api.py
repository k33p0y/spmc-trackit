from rest_framework import viewsets, permissions
from rest_framework.response import Response
from django.db.models import Q
from .serializers import ArticleListSerializer, ArticleCRUDSerializer, ResourcesSerializer
from .models import Article, Resources

import json, datetime

class ArticleListViewSet(viewsets.ModelViewSet):    
   serializer_class = ArticleListSerializer
   queryset = Article.objects.all()
   permission_classes = [permissions.IsAuthenticated, permissions.DjangoModelPermissions]
   http_method_names = ['get', 'head']

class ArticleCRUDViewSet(viewsets.ModelViewSet):    
   serializer_class = ArticleCRUDSerializer
   queryset = Article.objects.all()
   permission_classes = [permissions.IsAuthenticated, permissions.DjangoModelPermissions]

   def get_queryset(self):
      # Search & Filter Parameters
      search = self.request.query_params.get('search', None)
      is_active = self.request.query_params.get('is_active', None)
      date_from = self.request.query_params.get('date_from', None)
      date_to = self.request.query_params.get('date_to', None)

      if not self.request.user.has_perm('announcement.view_article'):
         return Article.objects.none()
      else:        
         # Queryset
         qs = Article.objects.select_related('author').order_by('-id')
         
         # Parameters
         if search: qs = qs.filter(Q(title__icontains=search) | Q(preface__icontains=search))
         if is_active: qs = qs.filter(is_active=True) if is_active == '0' else qs.filter(is_active=False)
         if date_from: qs = qs.filter(date_publish__gte=date_from)
         if date_to: qs = qs.filter(date_publish__lte=datetime.datetime.strptime(date_to + "23:59:59", '%Y-%m-%d%H:%M:%S'))

         return qs

class ResourcesViewSet(viewsets.ModelViewSet):    
   serializer_class = ResourcesSerializer
   queryset = Resources.objects.all()
   permission_classes = [permissions.IsAuthenticated, permissions.DjangoModelPermissions]

   def create(self, request):
      file = request.FILES['file']
      data = json.loads(request.FILES['data'].read())    
      resource = Resources.objects.create(
         article_id=data['article'],
         file=file, 
         file_name=file.name, 
         file_type=file.content_type, 
         uploaded_by=self.request.user
      )
      serializer = ResourcesSerializer(resource)
      return Response(serializer.data)
