from django.urls import path
from rest_framework import routers
from .api import RequestFormViewSet, TicketViewSet, RequestFormStatusViewSet, CRUDEventList, NotificationViewSet, AttachmentViewSet, CommentListCreateAPIView
from . import views

router = routers.DefaultRouter()
router.register('api/requests/forms', RequestFormViewSet, basename='RequestForm')
router.register('api/requests/lists', TicketViewSet, basename='Ticket')
router.register('api/requests/form-status', RequestFormStatusViewSet, basename='RequestFormStatus')
router.register('api/requests/attachments', AttachmentViewSet, basename='Attachment')
router.register('api/user/notifications', NotificationViewSet, basename='Notification')

urlpatterns = [
   path('requests/lists', views.ticket, name='ticket'),
   path('requests/new', views.create_ticket, name='create_ticket'),
   path('requests/<uuid:ticket_id>/detail', views.detail_ticket, name='detail_ticket'),
   path('requests/<uuid:ticket_id>/view', views.view_ticket, name='view_ticket'),
   path('requests/track', views.ticket_log_list, name='ticket_log_list'),
   path('api/ticket/logs/', CRUDEventList.as_view()), # easyaudit_crudevent api
   path('api/requests/comments/', CommentListCreateAPIView.as_view(), name='list-create-comment'), # list/create comment api
]

urlpatterns += router.urls