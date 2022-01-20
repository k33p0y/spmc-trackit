from django.urls import path
from rest_framework import routers
from . import views

router = routers.DefaultRouter()

urlpatterns = [
   path('announcement/lists', views.announcement, name='announcement'),
]

urlpatterns += router.urls