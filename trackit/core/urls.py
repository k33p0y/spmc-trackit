from django.urls import path
from rest_framework import routers
from .api import UserViewSet
from . import views


router = routers.DefaultRouter()
router.register('api/core/user', UserViewSet)

urlpatterns = [
   path('', views.home, name='home'),
]

urlpatterns += router.urls