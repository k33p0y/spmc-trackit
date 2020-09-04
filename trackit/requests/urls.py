from django.urls import path
from rest_framework import routers
from .api import RequestFormViewSet
from . import views

router = routers.DefaultRouter()
router.register('api/requests/forms', RequestFormViewSet)

urlpatterns = [
]

urlpatterns += router.urls