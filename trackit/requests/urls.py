from django.urls import path
from rest_framework import routers
from .api import (
   AttachmentViewSet, 
   CommentListCreateAPIView,
   CRUDEventList, 
   FormStatusOfficerViewSet,
   NotificationDeleteViewSet,
   NotificationViewSet, 
   RequestFormCRUDViewSet, 
   RequestFormStatusViewSet, 
   RequestFormViewSet, 
   TicketActionViewSet, 
   TicketCRUDViewSet, 
   TicketDashboardViewSet,
   TicketGenerateReferenceViewSet,
   TicketProfileViewSet, 
   TicketStatusViewSet, 
   TicketViewSet, 
)
from . import views

router = routers.DefaultRouter()
router.register('api/requests/forms/crud', RequestFormCRUDViewSet, basename='RequestForm')
router.register('api/requests/forms/all', RequestFormViewSet, basename='RequestFormList')
router.register('api/requests/ticket/crud', TicketCRUDViewSet, basename='Ticket')
router.register('api/requests/ticket/all', TicketViewSet, basename='TicketList')
router.register('api/requests/ticket/myrequests', TicketProfileViewSet, basename='TicketProfile')
router.register('api/requests/ticket/latest', TicketDashboardViewSet, basename='TicketDashboard')
router.register('api/requests/ticket/generate_reference', TicketGenerateReferenceViewSet, basename='TicketGenerateReference')
router.register('api/requests/ticket/status', TicketStatusViewSet, basename='TicketStatus')
router.register('api/requests/ticket/actions', TicketActionViewSet, basename='TicketAction')
router.register('api/requests/form/status', RequestFormStatusViewSet, basename='RequestFormStatus')
router.register('api/requests/formstatus/officer', FormStatusOfficerViewSet, basename='FormStatusOfficer')
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
   path('api/user/notifications/delete/', NotificationDeleteViewSet.as_view({'delete' : 'destroy'})), # easyaudit_crudevent api
]

urlpatterns += router.urls