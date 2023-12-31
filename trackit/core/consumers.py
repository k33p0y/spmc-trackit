import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType
from django.db.models import Q
from easyaudit.models import CRUDEvent
from requests.models import Ticket, Notification, Comment, RequestFormStatus
from tasks.models import Task, Team
from core.models import User

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.joined_groups = await self.get_groups()
        self.joined_staff = await self.get_users_with_core_perms()
        self.joined_status = await self.get_requestform_status()
        self.joined_tasks = await self.get_tasks()
        self.user = self.scope["user"]
        self.user_room_name = "notif_room_for_user_"+str(self.user.id) # notification for a single user

        # join room group
        for group in self.joined_groups:
            await self.channel_layer.group_add(
                'notif_room_for_group_' + str(group.pk),
                self.channel_name
            )

        # join room user
        await self.channel_layer.group_add(            
            self.user_room_name,
            self.channel_name
        )

        # join room staff group
        if self.user.id in self.joined_staff:
            await self.channel_layer.group_add(
                'notif_room_for_staff',
                self.channel_name
            )
        
        # join room status
        for status in self.joined_status:
            await self.channel_layer.group_add(
                'notif_room_for_status_' + str(status.pk),
                self.channel_name
            )
            
        # join room task
        for task in self.joined_tasks:
            await self.channel_layer.group_add(
                'notif_room_for_task_' + str(task.pk),
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
            # if text_data_json['notification_type'] == 'ticket': # notification for ticket CRUD
            object_id = text_data_json['data']['object_id']
            self.obj = await self.send_notification(object_id, text_data_json['data']['notification_type'])

            # send notification to a department head
            if self.obj['date_modified'] == self.obj['date_created']:
                await self.channel_layer.group_send(
                    'notif_room_for_user_' + str(self.obj['dept_head_id']),
                    {
                        'type': 'notification_message',
                        'notification': self.obj,
                        'sender_channel_name': self.channel_name
                    }
                )
            # send notification to requestor
            await self.channel_layer.group_send(
                'notif_room_for_user_' + str(self.obj['requestor_pk']),
                {
                    'type': 'notification_message',
                    'notification': self.obj,
                    'sender_channel_name': self.channel_name
                }
            )
            # send notification to officer assigned
            await self.channel_layer.group_send(
                'notif_room_for_status_' + str(self.obj['fomstatus']),
                {
                    'type': 'notification_message',
                    'notification': self.obj,
                    'sender_channel_name': self.channel_name
                }
            )
            for group_id in self.obj['group_ids']:
                # send notification to group
                await self.channel_layer.group_send(
                    'notif_room_for_group_' + str(group_id['id']),
                    {
                        'type': 'notification_message',
                        'notification': self.obj,
                        'sender_channel_name': self.channel_name
                    }
                )
        if text_data_json['type'] == 'user_notification': 
            object_id = text_data_json['data']['object_id']
            self.obj = await self.send_notification(object_id, text_data_json['data']['notification_type'])
            
            # notification to client
            if text_data_json['data']['notification_type'] == 'user': # notification for user update
                # send notification to requestor
                await self.channel_layer.group_send(
                    'notif_room_for_user_' + str(self.obj['user_pk']),
                    {
                        'type': 'notification_message',
                        'notification': self.obj,
                        'sender_channel_name': self.channel_name
                    }
                )

            # send notification for staff
            await self.channel_layer.group_send(
                'notif_room_for_staff',
                {
                    'type': 'notification_message',
                    'notification': self.obj,
                    'sender_channel_name': self.channel_name
                }
            )
        if text_data_json['type'] == 'action_notification': 
            object_id = text_data_json['data']['object_id']
            self.obj = await self.send_notification(object_id, text_data_json['data']['notification_type'])
            
            if text_data_json['data']['notification_type'] == 'action': # notification for ticket action
                # send notification to group
                await self.channel_layer.group_send(
                    'notif_room_for_status_' + str(self.obj['status']),
                    {
                        'type': 'notification_message',
                        'notification': self.obj,
                        'sender_channel_name': self.channel_name
                    }
                )
        if text_data_json['type'] == 'task_notification': 
            object_id = text_data_json['data']['object_id']
            self.obj = await self.send_notification(object_id, text_data_json['data']['notification_type'])
            notification_type = text_data_json['data']['notification_type']
            
            if notification_type == 'action': # notification for opentask
                # send notification to status officer
                await self.channel_layer.group_send(
                    'notif_room_for_status_' + str(self.obj['status']),
                    {
                        'type': 'notification_message',
                        'notification': self.obj,
                        'sender_channel_name': self.channel_name
                    }
                )
            if notification_type == 'task_remove' or notification_type == 'task_share': # notification for task person
                # send notification to removed person
                await self.channel_layer.group_send(
                    'notif_room_for_user_' + str(self.obj['officer']),
                    {
                        'type': 'notification_message',
                        'notification': self.obj,
                        'sender_channel_name': self.channel_name
                    }
                )
                
                # send notification to task team
                await self.channel_layer.group_send(
                    'notif_room_for_task_' + str(self.obj['task']),
                    {
                        'type': 'notification_message',
                        'notification': self.obj,
                        'sender_channel_name': self.channel_name
                    }
                )
            
            if notification_type == 'task':
                # send notification to task team
                await self.channel_layer.group_send(
                    'notif_room_for_task_' + str(self.obj['task']),
                    {
                        'type': 'notification_message',
                        'notification': self.obj,
                        'sender_channel_name': self.channel_name
                    }
                )
            
                
    # send notification
    async def notification_message(self, event):
        notification = event['notification']

        # send to everyone else but the sender
        if self.channel_name != event['sender_channel_name']:
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
    def send_notification(self, object_id, notification_type):
        obj = dict()
        if notification_type == 'ticket':
            ticket = Ticket.objects.get(ticket_id=object_id)
            date_created = ticket.date_created.replace(microsecond=0)
            date_modified = ticket.date_modified.replace(microsecond=0)
            log = CRUDEvent.objects.filter(object_id=object_id).latest('datetime')  
            task = ticket.tasks.filter(task_type__form=ticket.request_form.pk, task_type__status=ticket.status).last()   
            choices = dict(CRUDEvent.TYPES) # get choices from CRUD Event model   

            obj['ticket_id'] = str(ticket.pk)
            obj['ticket_no'] = ticket.ticket_no
            obj['group_ids'] = list(ticket.request_form.group.values('id'))
            obj['dept_head_id'] = ticket.department.department_head.pk
            obj['actor'] = log.user.get_full_name()
            obj['requestor_pk'] = ticket.requested_by.pk
            obj['date_created'] = str(date_created)
            obj['date_modified'] = str(date_modified)
            obj['event_type'] = choices[log.event_type]
            if log.changed_fields:
                changed_fields = json.loads(log.changed_fields)
                if 'status' in changed_fields:
                    obj['status'] = changed_fields['status'][0]
            else:
                obj['status'] = ticket.status.name
            obj['fomstatus'] = str(task.task_type.pk)
        if notification_type == 'comment':
            comment = Comment.objects.get(pk=object_id)
            date_created = comment.ticket.date_created.replace(microsecond=0)
            date_modified = comment.ticket.date_modified.replace(microsecond=0)
            log = CRUDEvent.objects.filter(object_id=object_id).latest('datetime')       
            task = comment.ticket.tasks.filter(task_type__form=comment.ticket.request_form.pk, task_type__status=comment.ticket.status).last() 
            
            obj['ticket_id'] = str(comment.ticket.pk)
            obj['ticket_no'] = comment.ticket.ticket_no
            obj['group_ids'] = list(comment.ticket.request_form.group.values('id'))
            obj['dept_head_id'] = comment.ticket.department.department_head.pk
            obj['actor'] = log.user.get_full_name()
            obj['requestor'] = comment.ticket.requested_by.get_full_name()
            obj['requestor_pk'] = comment.ticket.requested_by.pk
            obj['date_created'] = str(date_created)
            obj['date_modified'] = str(date_modified)            
            obj['fomstatus'] = str(task.task_type.pk)
        if notification_type == 'register':
            user = User.objects.get(pk=object_id)
            date_created = user.date_joined.replace(microsecond=0)
            date_modified = user.modified_at.replace(microsecond=0)
            ctype = ContentType.objects.get(model='user')
            log = CRUDEvent.objects.filter(object_id=object_id, content_type=ctype, event_type=CRUDEvent.CREATE).latest('datetime')

            obj['user_pk'] = user.pk
        if notification_type == 'user':
            user = User.objects.get(pk=object_id)
            date_created = user.date_joined.replace(microsecond=0)
            date_modified = user.modified_at.replace(microsecond=0)
            ctype = ContentType.objects.get(model='user')
            log = CRUDEvent.objects.filter(object_id=object_id, content_type=ctype).latest('datetime')
            
            obj['user_pk'] = user.pk
        if notification_type == 'action':
            formstatus = RequestFormStatus.objects.get(pk=object_id)
            obj['status'] = str(formstatus.pk)
        if notification_type == 'task':
            task = Task.objects.get(pk=object_id)
            obj['task'] = str(task.pk)  
        if notification_type == 'task_share':
            for person in object_id:
                team = Team.objects.filter(member=person).latest('id')
                obj['task'] = str(team.task.pk)
                obj['officer'] = str(team.member.pk)
        if notification_type == 'task_remove':
            ctype = ContentType.objects.get(model='team')
            log = CRUDEvent.objects.filter(object_id=object_id, content_type=ctype, event_type=CRUDEvent.DELETE).latest('datetime')
            object_json_repr = json.loads(log.object_json_repr)
            obj['task'] = str(object_json_repr[0]['fields']['task'])
            obj['officer'] = str(object_json_repr[0]['fields']['member'])
        return obj

    @database_sync_to_async
    def get_groups(self):
        return list(self.scope['user'].groups.all())

    @database_sync_to_async
    def get_users_with_core_perms(self):
        ctype = ContentType.objects.get(model='user')
        perms = Permission.objects.filter(content_type=ctype).values_list('id')
        users_with_perms = User.objects.filter(Q(groups__permissions__in=perms) | Q(user_permissions__in=perms)).distinct().values_list('id', flat=True)
        return list(users_with_perms)

    @database_sync_to_async
    def get_requestform_status(self):
        status = RequestFormStatus.objects.filter(officer=self.scope['user'])
        return list(status)
    
    @database_sync_to_async
    def get_tasks(self):
        tasks = Task.objects.filter(officers=self.scope['user'])
        return list(tasks)
    
class CommentConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        self.associated_tickets = await self.get_tickets_related_to_user()

        # join comment group
        for ticket in self.associated_tickets:
            await self.channel_layer.group_add(
                'comment_for_ticket_' + str(ticket['ticket_no']),
                self.channel_name
            )

        await self.accept()

    async def disconnect(self, close_code):
        await self.close()
    
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)

        comment_obj = await self.get_comment(text_data_json['comment_id'])
        if self.user.is_superuser and (self.user.pk == comment_obj['user_id']): # if superuser made the comment
            # join superuser to comment websocket group
            await self.channel_layer.group_add(
                'comment_for_ticket_' + str(comment_obj['ticket_no']),
                self.channel_name
            )
            
        await self.channel_layer.group_send(
            'comment_for_ticket_' + str(comment_obj['ticket_no']),
            {
                'type': 'comment_message',
                'comment': comment_obj,
            }
        )

    async def comment_message(self, event):
        comment = event['comment']
        # send comment to websocket
        await self.send(text_data=json.dumps({
            'comment': comment
        }))

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
            'user_id': comment.user.id,
            'content': comment.content,
            'ticket_no': comment.ticket.ticket_no,
            'ticket_id': str(comment.ticket.ticket_id),
            'id': comment.pk,
            'date_created': str(comment.date_created),
        }
        return comment_obj