from django.urls import path
from rest_framework import routers
from .api import RequestFormViewSet, TicketViewSet, RequestFormStatusViewSet
from . import views

router = routers.DefaultRouter()
router.register('api/requests/forms', RequestFormViewSet, basename='RequestForm')
router.register('api/requests/lists', TicketViewSet, basename='Ticket')
router.register('api/requests/form-status', RequestFormStatusViewSet, basename='RequestFormStatus')

urlpatterns = [
   path('requests/lists', views.ticket, name='ticket'),
   path('requests/boards', views.boards, name='boards'),
   path('requests/categories/json', views.get_category, name='get_category'),
]

urlpatterns += router.urls