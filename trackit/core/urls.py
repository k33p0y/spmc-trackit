from django.urls import path
from rest_framework import routers
from .api import UserViewSet, GroupViewSet, UserUpdateAPIView
from . import views


router = routers.DefaultRouter()
router.register('api/core/user', UserViewSet)
router.register('api/core/group', GroupViewSet)

urlpatterns = [
   path('', views.home, name='home'),
   path('core/group', views.group_list, name='group_list'),
   path('core/user', views.user_list, name='user_list'),
   path('core/user/<int:pk>/profile', views.user_profile, name='user_profile'),
   path('core/user/<int:pk>/update', UserUpdateAPIView.as_view(), name='user-update'),
]

urlpatterns += router.urls