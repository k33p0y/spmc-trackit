from django.urls import path
from rest_framework import routers
from .api import (
   MyTaskListViewSet,
   OpenTaskViewSet,
   RemoveTaskViewSet,
   RemoveTeamPersonViewSet,
   ShareTaskViewSet,
   ShareTaskOfficersViewSet,
   TaskListCompleteViewSet, 
   TaskListViewSet,
   TransferTaskViewSet)
from . import views

router = routers.DefaultRouter()
router.register('api/tasks/list/tasks', TaskListViewSet)
router.register('api/tasks/list/mytasks', MyTaskListViewSet)
router.register('api/tasks/list/completed', TaskListCompleteViewSet)
router.register('api/tasks/remove', RemoveTaskViewSet)
router.register('api/tasks/people', RemoveTeamPersonViewSet)
router.register('api/tasks/share', ShareTaskViewSet)
router.register('api/tasks/transfer', TransferTaskViewSet)
router.register('api/tasks/officers/share', ShareTaskOfficersViewSet)
router.register('api/tasks/open', OpenTaskViewSet)

urlpatterns = [
   path('tasks/mytasks', views.mytasks, name='mytasks'),
   path('tasks/create_task', views.create_task_for_all_requests, name='create_task_for_all_requests'),
]

urlpatterns += router.urls