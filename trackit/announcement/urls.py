from django.urls import path
from rest_framework import routers
from .api import ArticleListViewSet, ArticleCRUDViewSet, ResourcesViewSet
from . import views

router = routers.DefaultRouter()
router.register('api/announcement/all/article', ArticleListViewSet)
router.register('api/announcement/article', ArticleCRUDViewSet)
router.register('api/news/resources', ResourcesViewSet)

urlpatterns = [
   path('announcement/lists', views.announcement, name='announcement'),
   path('announcement/article/new', views.create_article, name='create_article'),
   path('announcement/article/<int:pk>/view', views.view_article, name='view_article'),
   path('announcement/article/<int:pk>/change', views.change_article, name='change_article'),
]

urlpatterns += router.urls