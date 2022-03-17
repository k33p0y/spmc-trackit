from rest_framework import serializers
from .models import Event, EventDate, EventTicket
from core.serializers import UserInfoSerializer
from requests.serializers import RequestFormReadOnlySerializer

class EventListSerializer(serializers.ModelSerializer):
    created_by = UserInfoSerializer(read_only=True)
    modified_by = UserInfoSerializer(read_only=True)
    event_for = RequestFormReadOnlySerializer(read_only=True)

    class Meta:
        model = Event
        fields = '__all__'

class EventCRUDSerializer(serializers.ModelSerializer):

    class Meta:
        model = Event
        fields = '__all__'