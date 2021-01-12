from django.urls import path
from rest_framework import routers
from .api import UserViewSet, GroupViewSet
from . import views


router = routers.DefaultRouter()
router.register('api/core/user', UserViewSet)
router.register('api/core/group', GroupViewSet)

urlpatterns = [
   path('', views.home, name='home'),
   path('core/group', views.group_list, name='group_list'),
]

urlpatterns += router.urls