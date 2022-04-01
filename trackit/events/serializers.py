from rest_framework import serializers
from .models import Event, EventDate, EventTicket
from core.serializers import UserInfoSerializer
from requests.serializers import RequestFormReadOnlySerializer
from .models import Event, EventDate, EventTicket

class EventListSerializer(serializers.ModelSerializer):
    created_by = UserInfoSerializer(read_only=True)
    modified_by = UserInfoSerializer(read_only=True)
    event_for = RequestFormReadOnlySerializer(read_only=True)
    scheduled_dates = serializers.SerializerMethodField('get_dates')
    participants = serializers.SerializerMethodField('get_participants')

    def get_dates(self, obj):
        scheduled_dates = EventDate.objects.select_related('event').filter(event=obj.pk).order_by('date').values('date')
        return scheduled_dates

    def get_participants(self, obj):
        participants = EventTicket.objects.select_related('event', 'ticket').filter(scheduled_event__event=obj.pk)
        return participants.count() 

    class Meta:
        model = Event
        fields = '__all__'

class EventCRUDSerializer(serializers.ModelSerializer):

    class Meta:
        model = Event
        fields = '__all__'

class EventReadOnlySerializer(serializers.ModelSerializer):

    class Meta:
        model = Event
        fields = ['id', 'title', 'subject', 'highlight']

class EventDateSerializer(serializers.ModelSerializer):
    event = EventReadOnlySerializer(read_only=True)

    class Meta:
        model = EventDate
        fields = '__all__'