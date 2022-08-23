from django.urls import path
from rest_framework import routers
from .api import OpenTaskViewSet, TaskListViewSet, RemoveTaskViewSet, ShareTaskViewSet
from . import views

router = routers.DefaultRouter()
router.register('api/tasks/list/mytasks', TaskListViewSet)
router.register('api/tasks/remove', RemoveTaskViewSet)
router.register('api/tasks/share', ShareTaskViewSet)
router.register('api/tasks/open', OpenTaskViewSet)

urlpatterns = [
   path('tasks/mytasks', views.mytasks, name='mytasks'),
]

urlpatterns += router.urls