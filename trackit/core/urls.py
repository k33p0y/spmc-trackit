from django.urls import path
from rest_framework import routers
from .api import UserViewSet, GroupViewSet, UserUpdateAPIView, UserProfileViewSet, ChangePasswordAPIView
from . import views


router = routers.DefaultRouter()
router.register('api/core/user', UserViewSet)
router.register('api/core/group', GroupViewSet)
router.register('api/core/user-profile', UserProfileViewSet)

urlpatterns = [
   path('', views.home, name='home'),
   path('core/group', views.group_list, name='group_list'),
   path('core/user', views.user_list, name='user_list'),
   path('core/user/<int:pk>/profile', views.user_profile, name='user_profile'),

   path('api/core/user/<int:pk>/change-password/', ChangePasswordAPIView.as_view(), name='change-password'),
   path('core/user/<int:pk>/update', UserUpdateAPIView.as_view(), name='user-update'),
]

urlpatterns += router.urls