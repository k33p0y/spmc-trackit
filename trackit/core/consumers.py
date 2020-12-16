import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.joined_groups = await self.get_groups()
        self.user = self.scope["user"]
        self.user_room_name = "notif_room_for_user_"+str(self.user.id) # notification for a single user

        # join room group
        for group in self.joined_groups:
            print(group.name)
            await self.channel_layer.group_add(
                'notif_room_for_group_' + group.name,
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
                'notif_room_for_group_' + group.name,
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
        message = text_data_json['message']

        await self.channel_layer.group_send(
            ('notif_room_for_user_%s' % message),
            {
                'type': 'notification_message',
                'message': message
            }
        )

    # Receive message from room group
    async def notification_message(self, event):
        message = event['message']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message
        }))
        # self.send(text_data=message)
    
    @database_sync_to_async
    def get_groups(self):
        return list(self.scope['user'].groups.all())