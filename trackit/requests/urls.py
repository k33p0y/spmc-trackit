from django.urls import path
from rest_framework import routers
from .api import RequestFormViewSet, TicketViewSet
from . import views

router = routers.DefaultRouter()
router.register('api/requests/forms', RequestFormViewSet)
router.register('api/requests/lists', TicketViewSet)

urlpatterns = [
   path('requests/lists', views.ticket, name='ticket'),
   path('requests/categories/json', views.get_category, name='get_category'),
]

urlpatterns += router.urls