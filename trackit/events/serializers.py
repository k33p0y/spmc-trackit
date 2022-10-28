import sched
from rest_framework import serializers
from django.db import transaction
from django.shortcuts import get_object_or_404

from .models import Event, EventDate, EventTicket
from config.models import Remark
from requests.models import Ticket, RequestFormStatus
from easyaudit.models import CRUDEvent

from .views import is_string_an_url

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
        datatables_always_serialize = ('id', 'subject',)

class EventCRUDSerializer(serializers.ModelSerializer):
    created_by = UserInfoSerializer(read_only=True)
    modified_by = UserInfoSerializer(read_only=True)
    dates = serializers.StringRelatedField(many=True, read_only=True)

    @transaction.atomic
    def create(self, validated_data):
        event = Event(
            title = validated_data['title'],
            subject = validated_data['subject'],
            highlight = validated_data['highlight'],
            event_for = validated_data['event_for'],
            created_by = self.context['request'].user,
            modified_by =  self.context['request'].user,
        )
        event.save()
        
        for schedule in self.context['request'].data['schedule']:
            EventDate.objects.create(
                date=schedule['date'],
                time_start=f"{schedule['time_start']}:00",
                time_end=f"{schedule['time_end']}:00",
                venue=schedule['venue'],
                address=schedule['link'],
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

        for schedule in self.context['request'].data['schedule']:
            if schedule['id']: 
                eventdate = get_object_or_404(EventDate, pk=schedule['id'])
                eventdate.date = schedule['date']
                eventdate.time_start = schedule['time_start']
                eventdate.time_end = schedule['time_end']
                eventdate.venue = schedule['venue']
                eventdate.address = schedule['link']
                eventdate.is_active = schedule['is_active']
                eventdate.save()
            else:
                EventDate.objects.create(
                    date=schedule['date'],
                    time_start=schedule['time_start'],
                    time_end=schedule['time_end'],
                    venue=schedule['venue'],
                    address=schedule['link'],
                    event=instance
                )
        return instance
    
    def validate(self, data):
        errors = []       
        for schedule in self.initial_data['schedule']:
            schedule_err = dict()   
            if not schedule['date']: schedule_err['date'] = '*This field may not be blank.'
            if not schedule['time_start']: schedule_err['time_start'] = '*This field may not be blank.'
            if not schedule['time_end']: schedule_err['time_end'] = '*This field may not be blank.'
            if not schedule['venue']: schedule_err['venue'] = '*This field may not be blank.'
            if not is_string_an_url(schedule['link']): schedule_err['link'] = '*Not a valid url.'                
            if schedule_err: 
                errors.append(schedule_err)
        if errors:
           raise serializers.ValidationError({'dates': errors}) 
        return data

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
    highlight = serializers.SerializerMethodField()

    def get_attendance(self, obj):
        return obj.participants.all().count()
    
    def get_highlight(self, obj):
        return obj.event.highlight

    class Meta:
        model = EventDate
        fields = '__all__'
        datatables_always_serialize = ('id', 'highlight', 'address')

class EventDateCRUDSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        eventdate = EventDate(
            date = validated_data['date'],
            time_start = validated_data['time_start'],
            time_end = validated_data['time_end'],
            venue = validated_data['venue'],
            address = validated_data['address'],
            event = validated_data['event'],
            is_active = validated_data['is_active']
        )
        eventdate.save()
        return eventdate

    def update(self, instance, validated_data):
        instance.date = validated_data.get('date', instance.date)
        instance.time_start = validated_data.get('time_start', instance.time_start)
        instance.time_end = validated_data.get('time_end', instance.time_end)
        instance.venue = validated_data.get('venue', instance.venue)
        instance.address = validated_data.get('address', instance.address)
        instance.is_active = validated_data.get('is_active', instance.is_active)
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
        # perform save if instance is not equal to request
        if not instance.attended == validated_data.get('attended'):
            ticket = get_object_or_404(Ticket, pk=uuid.UUID(str(instance.ticket.ticket_id))) # get ticket queryset
            steps = RequestFormStatus.objects.select_related('form', 'status').filter(form=instance.scheduled_event.event.event_for).order_by('order')  # get status queryset
            last_step = steps.latest('order') # get last step
            first_step = steps.first() # get first step
            curr_step = steps.get(status_id=ticket.status)
            next_step = steps.get(order=curr_step.order+1) if not curr_step.status == last_step.status else curr_step # next current step
            prev_step = steps.get(order=curr_step.order-1) if not curr_step.status == first_step.status else curr_step # prev current step

            if not validated_data.get('attended'): # if attended is False/Absent
                ticket.status = prev_step.status
                ticket.save()

                # get log from easyaudit
                log = CRUDEvent.objects.filter(object_id=ticket).latest('datetime') 

                # post action Remark
                action = Remark(
                    remark = 'Absent',
                    ticket_id = ticket.pk,
                    status = ticket.status,
                    action_officer = self.context['request'].user,
                    is_pass = False,
                    log = log
                )
                action.save()
            else: # if attended is True
                ticket.status = next_step.status
                ticket.save()

                # get log from easyaudit
                log = CRUDEvent.objects.filter(object_id=ticket).latest('datetime') 

                # post action Remark
                action = Remark(
                    remark = 'Present',
                    ticket_id = ticket.pk,
                    status = ticket.status,
                    action_officer = self.context['request'].user,
                    is_pass = True,
                    log = log
                )
                action.save()
            
            instance.attended = validated_data.get('attended', instance.attended)
            instance.remarks = validated_data.get('remarks', instance.remarks)
            instance.save()

        return instance

    class Meta:
        model = EventTicket
        fields = '__all__'
        read_only_fields = ['ticket', 'scheduled_event']