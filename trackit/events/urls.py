from django.urls import path
from rest_framework import routers
from .api import EventListViewSet, EventCRUDViewSet

router = routers.DefaultRouter()
router.register('api/events/all', EventListViewSet)
router.register('api/events/event', EventCRUDViewSet)

urlpatterns = []
urlpatterns += router.urls