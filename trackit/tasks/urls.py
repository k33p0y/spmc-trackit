from django.urls import path
from rest_framework import routers
from .api import OpenTaskViewSet, TaskViewSet
from . import views

router = routers.DefaultRouter()
router.register('api/tasks/all', TaskViewSet)
router.register('api/tasks/open', OpenTaskViewSet)

urlpatterns = [
   path('tasks/mytasks', views.mytasks, name='mytasks'),
]

urlpatterns += router.urls