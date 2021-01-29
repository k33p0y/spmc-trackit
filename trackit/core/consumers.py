import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.db.models import Q
from easyaudit.models import CRUDEvent
from requests.models import Ticket, Notification, Comment
from core.models import User

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.joined_groups = await self.get_groups()
        self.user = self.scope["user"]
        self.user_room_name = "notif_room_for_user_"+str(self.user.id) # notification for a single user
        self.tickets = await self.get_tickets_related_to_user()

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

        # join comment group
        for ticket in self.tickets:
            await self.channel_layer.group_add(
                'comment_group_for_ticket_' + str(ticket['ticket_no']),
                self.channel_name
            )

        await self.accept()

    async def disconnect(self, close_code):
        # leave room group
        # for group in self.joined_groups:
        #     await self.channel_layer.group_discard(
        #         'notif_room_for_group_' + str(group.pk),
        #         self.channel_name
        #     )
        # # leave user group
        # await self.channel_layer.group_discard(            
        #     self.user_room_name,
        #     self.channel_name
        # )
        await self.close()

    # receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data) # convert string to JSON

        # NOTIFICATION
        if text_data_json['type'] == 'notification':
            ticket_id = text_data_json['data']['ticket_id']
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
        
        # COMMENT
        if text_data_json['type'] == 'comment':
            comment_obj = await self.get_comment(text_data_json['data']['comment_id'])
            await self.channel_layer.group_send(
                'comment_group_for_ticket_' + str(comment_obj['ticket_no']),
                {
                    'type': 'comment_message',
                    'comment': comment_obj,
                }
            )

    # send notification
    async def notification_message(self, event):
        notification = event['notification']

        # Send notification to WebSocket
        await self.send(text_data=json.dumps({
            'notification': notification
        }))

    # send comment
    async def comment_message(self, event):
        comment = event['comment']
        # Send comment_message to WebSocket
        await self.send(text_data=json.dumps({
            'comment': comment
        }))
    
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
    
    @database_sync_to_async
    def get_tickets_related_to_user(self):
        groups = list(self.scope['user'].groups.all())
        tickets = Ticket.objects.select_related('requested_by', 'department', 'request_form__group').filter(
            Q(requested_by=self.scope['user']) | Q(department__department_head=self.scope['user']) | Q(request_form__group__in=groups)
        ).values('ticket_no')
        return list(tickets)
    
    @database_sync_to_async
    def get_comment(self, comment_id):
        comment = Comment.objects.get(id=comment_id)
        comment_obj = {
            'user': comment.user.get_full_name(),
            'content': comment.content,
            'ticket_no': comment.ticket.ticket_no,
            'ticket_id': comment.ticket.ticket_id,
            'id': comment.pk,
        }
        return comment_obj