from django.urls import path
from rest_framework import routers
from .api import TaskViewSet
from . import views

router = routers.DefaultRouter()
router.register('api/tasks/all', TaskViewSet)

urlpatterns = [
   path('tasks/mytasks', views.mytasks, name='mytasks'),
]

urlpatterns += router.urls