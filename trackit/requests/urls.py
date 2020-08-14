from django.urls import path
from rest_framework import routers
from .api import FormTypeViewSet
from . import views

router = routers.DefaultRouter()
router.register('api/requests/formtype', FormTypeViewSet)

urlpatterns = [
]

urlpatterns += router.urls