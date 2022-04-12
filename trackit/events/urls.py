from django.urls import path
from rest_framework import routers
from .api import EventListViewSet, EventCRUDViewSet, EventDateViewSet
from . import views

router = routers.DefaultRouter()
router.register('api/events/all', EventListViewSet)
router.register('api/events/event', EventCRUDViewSet)
router.register('api/events/eventdate', EventDateViewSet)

urlpatterns = [
    path('events/lists', views.event, name='event'),
    path('events/event/new', views.create_event, name='create_event'),
    path('events/event/<int:pk>/view', views.view_event, name='view_event'),
    path('events/event/new', views.create_event, name='create_event'),
    path('events/calendar', views.event_calendar, name='event_calendar'),
]
urlpatterns += router.urls  