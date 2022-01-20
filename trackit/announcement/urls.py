from django.urls import path
from rest_framework import routers
from .api import ArticleListViewSet
from . import views

router = routers.DefaultRouter()
router.register('api/announcement/all/article', ArticleListViewSet)

urlpatterns = [
   path('announcement/lists', views.announcement, name='announcement'),
]

urlpatterns += router.urls