import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from easyaudit.models import CRUDEvent
from requests.models import Ticket, Notification

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.joined_groups = await self.get_groups()
        self.user = self.scope["user"]
        self.user_room_name = "notif_room_for_user_"+str(self.user.id) # notification for a single user

        # join room group
        for group in self.joined_groups:
            await self.channel_layer.group_add(
                'notif_room_for_group_' + str(group.pk),
                self.channel_name
            )

        # join user group
        await self.channel_layer.group_add(            
            self.user_room_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # leave room group
        for group in self.joined_groups:
            await self.channel_layer.group_discard(
                'notif_room_for_group_' + str(group.pk),
                self.channel_name
            )
        # leave user group
        await self.channel_layer.group_discard(            
            self.user_room_name,
            self.channel_name
        )

    # receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data) # convert string to JSON
        ticket_id = text_data_json['ticket_id']
        self.obj = await self.send_notification(ticket_id)

        # send notification to a user
        await self.channel_layer.group_send(
            ('notif_room_for_user_%s' % self.obj['dept_head_id']),
            {
                'type': 'notification_message',
                'notification': self.obj
            }
        )

        # send notification to group
        await self.channel_layer.group_send(
            ('notif_room_for_group_%s' % self.obj['group_id']),
            {
                'type': 'notification_message',
                'notification': self.obj
            }
        )

    # Receive message from room group
    async def notification_message(self, event):
        notification = event['notification']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'notification': notification
        }))
        # self.send(text_data=message)
    
    @database_sync_to_async
    def send_notification(self, ticket_id):
        ticket = Ticket.objects.get(ticket_id=ticket_id)
        log = CRUDEvent.objects.filter(object_id=ticket_id).order_by('-datetime').first()
        users = ticket.request_form.group.user_set.all()
        # create notifications for users in selected group
        for user in users: 
            Notification(log=log, user=user).save()
        # create notification for department head
        Notification(log=log, user=ticket.department.department_head).save()

        obj = dict()
        obj['ticket_id'] = str(ticket.pk)
        obj['ticket_no'] = ticket.ticket_no
        obj['group_id'] = ticket.request_form.group.pk
        obj['dept_head_id'] = ticket.department.department_head.pk
        obj['actor'] = log.user.get_full_name()

        choices = dict(CRUDEvent.TYPES) # get choices from CRUD Event model
        obj['event_type'] = choices[log.event_type]
        if log.changed_fields:
            obj['status'] = log.changed_fields['status'][1]
        else:
            obj['status'] = ticket.status.name
        return obj

    @database_sync_to_async
    def get_groups(self):
        return list(self.scope['user'].groups.all())