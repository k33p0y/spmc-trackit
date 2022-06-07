from rest_framework import serializers
from django.db import transaction
from django.shortcuts import get_object_or_404
from .models import Event, EventDate, EventTicket
from config.models import Remark
from requests.models import Ticket, RequestFormStatus
from easyaudit.models import CRUDEvent

from core.serializers import UserInfoSerializer
from requests.serializers import RequestFormReadOnlySerializer, StatusReadOnlySerializer

import datetime, uuid

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
        datatables_always_serialize = ('id', 'subject')

class EventCRUDSerializer(serializers.ModelSerializer):
    created_by = UserInfoSerializer(read_only=True)
    modified_by = UserInfoSerializer(read_only=True)

    @transaction.atomic
    def create(self, validated_data):
        schedules = self.context['request'].data['schedule']
        event = Event(
            title = validated_data['title'],
            subject = validated_data['subject'],
            highlight = validated_data['highlight'],
            event_for = validated_data['event_for'],
            created_by = self.context['request'].user,
            modified_by =  self.context['request'].user
        )
        event.save()
        for schedule in schedules:
            EventDate.objects.create(
                date=schedule['date'],
                time_start=schedule['time_start'],
                time_end=schedule['time_end'],
                event=event
            )
        return event
    
    @transaction.atomic
    def update(self, instance, validated_data):
        instance.title = validated_data.get('title', instance.title)
        instance.subject = validated_data.get('subject', instance.title)
        instance.highlight = validated_data.get('highlight', instance.highlight)
        instance.event_for = validated_data.get('event_for', instance.event_for)
        instance.is_active = validated_data.get('is_active', instance.is_active)
        instance.modified_by = self.context['request'].user
        instance.save()

        schedules = self.context['request'].data['schedule']
        for schedule in schedules:
            if schedule['id']: 
                eventdate = get_object_or_404(EventDate, pk=schedule['id'])
                eventdate.date = schedule['date']
                eventdate.time_start = schedule['time_start']
                eventdate.time_end = schedule['time_end']
                eventdate.is_active = schedule['is_active']
                eventdate.save()
            else:
                EventDate.objects.create(
                    date=schedule['date'],
                    time_start=schedule['time_start'],
                    time_end=schedule['time_end'],
                    event=instance
                )
        return instance

    class Meta:
        model = Event
        fields = '__all__'

class EventReadOnlySerializer(serializers.ModelSerializer):

    class Meta:
        model = Event
        fields = ['id', 'title', 'subject', 'highlight']

class EventDateSerializer(serializers.ModelSerializer):
    event = EventReadOnlySerializer(read_only=True)
    attendance = serializers.SerializerMethodField('get_attendance')

    def get_attendance(self, obj):
        return obj.participants.all().count()

    class Meta:
        model = EventDate
        fields = '__all__'
        datatables_always_serialize = ('id',)

class EventDateCRUDSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        eventdate = EventDate(
            date = validated_data['date'],
            time_start = validated_data['time_start'],
            time_end = validated_data['time_end'],
            event = validated_data['event']
        )
        eventdate.save()
        return eventdate

    def update(self, instance, validated_data):
        instance.date = validated_data.get('date', instance.date)
        instance.time_start = validated_data.get('time_start', instance.time_start)
        instance.time_end = validated_data.get('time_end', instance.time_end)
        instance.event = validated_data.get('event', instance.event)
        instance.save()
        return instance

    class Meta:
        model = EventDate
        fields = '__all__'

class EventDatePartialSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = EventDate
        fields = ['id', 'is_active']
        read_only_fields = ['id']

class TicketReadOnlySerializer(serializers.ModelSerializer):
    status = StatusReadOnlySerializer(read_only=True)
    requested_by = UserInfoSerializer(read_only=True)

    class Meta:
        model = Ticket
        fields = ('ticket_no', 'requested_by', 'status')

class EventTicketSerializer(serializers.ModelSerializer):
    ticket = TicketReadOnlySerializer(read_only=True)

    class Meta:
        model = EventTicket
        fields = '__all__'

class AttendanceSerializer(serializers.ModelSerializer):

    def update(self, instance, validated_data):
        # if attended is False/Absent
        if not validated_data.get('attended'):
            # get status event form 
            status = RequestFormStatus.objects.get(form=instance.scheduled_event.event.event_for, has_event=True)
    
            # update ticket status first
            ticket = get_object_or_404(Ticket, pk=uuid.UUID(str(instance.ticket.ticket_id)))
            ticket.status = status.status
            ticket.save()

            # get log from easyaudit
            log = CRUDEvent.objects.filter(object_id=ticket).latest('datetime') 

            # post action Remark
            action = Remark(
                ticket_id = ticket.pk,
                status = status.status,
                action_officer = self.context['request'].user,
                log = log
            )
            action.save()

        # if attended is True
        instance.attended = validated_data.get('attended', instance.attended)
        instance.remarks = validated_data.get('remarks', instance.remarks)
        instance.save()

        return instance

    class Meta:
        model = EventTicket
        fields = '__all__'
        read_only_fields = ['ticket', 'scheduled_event']