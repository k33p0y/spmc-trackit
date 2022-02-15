from django.urls import path
from rest_framework import routers
from .api import ArticleListViewSet
from . import views

router = routers.DefaultRouter()
router.register('api/announcement/all/article', ArticleListViewSet)

urlpatterns = [
   path('announcement/lists', views.announcement, name='announcement'),
   path('announcement/article/new', views.create_article, name='create_article'),
]

urlpatterns += router.urls