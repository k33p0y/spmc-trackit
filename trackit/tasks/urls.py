from django.urls import path
from rest_framework import routers
from . import views

router = routers.DefaultRouter()

urlpatterns = [
   path('tasks/mytasks', views.mytasks, name='mytasks'),
]

urlpatterns += router.urls