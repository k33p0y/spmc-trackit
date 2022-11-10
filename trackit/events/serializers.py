import sched
from rest_framework import serializers
from django.db import transaction
from django.shortcuts import get_object_or_404
from datetime import datetime, date

from .models import Event, EventDate, EventTicket
from config.models import Remark
from requests.models import Ticket, RequestFormStatus
from easyaudit.models import CRUDEvent

from .views import is_string_an_url, update_ticket_status

from core.serializers import UserInfoSerializer
from requests.serializers import RequestFormReadOnlySerializer, StatusReadOnlySerializer

import uuid

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
        method = self.context['request'].method
        for schedule in self.initial_data['schedule']:
            schedule_err = dict()   
            if not schedule['date']: schedule_err['date'] = '*This field may not be null.' 
            if not schedule['time_start']: schedule_err['time_start'] = '*This field may not be null.'
            if not schedule['time_end']: schedule_err['time_end'] = '*This field may not be null.'
            if not schedule['venue']: schedule_err['venue'] = '*This field may not be blank.'
            if not is_string_an_url(schedule['link']): schedule_err['link'] = '*Enter a valid URL.'   
            if schedule['date'] and method == 'POST':
                if datetime.strptime(schedule['date'], "%Y-%m-%d").date() < date.today(): schedule_err['date'] = '*Date must not be in the past.'
            if schedule['time_end'] <= schedule['time_start']: schedule_err['time_end'] = '*End time must be later than the start time.'            
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
    state = serializers.SerializerMethodField()

    def get_attendance(self, obj):
        return obj.participants.all().count()
    
    def get_highlight(self, obj):
        return obj.event.highlight
    
    def get_state(self, obj):
        now = datetime.now().strftime("%Y-%m-%d %H:%M")
        date_today = datetime.strptime(now, "%Y-%m-%d %H:%M")
        date_start = datetime.combine(obj.date, obj.time_start)
        date_end = datetime.combine(obj.date, obj.time_end)
    
        if date_start > date_today: 
            return {'id' : 1, 'text' :'Upcoming'}
        elif date_today >= date_start and date_today <= date_end: 
            return {'id' : 2, 'text' :'On Going'}
        elif date_today > date_start and date_today > date_end: 
            return {'id' : 3, 'text' :'Ended'}        
        return None

    class Meta:
        model = EventDate
        fields = '__all__'
        datatables_always_serialize = ('id', 'highlight', 'address', 'state')

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
    
    def validate_date(self, date):
        if self.context['request'].method == 'POST':
            if date < date.today():
                raise serializers.ValidationError('Date must not be in the past.')
        return date

    def validate_time_end(self, time_end):
        if self.initial_data.get('time_start'):
            time_start = datetime.strptime(self.initial_data.get('time_start'), '%H:%M').time()
            if time_end <= time_start:
                raise serializers.ValidationError('End time must be later than the start time.')  
        return time_end

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
        
class EventTicketAttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventTicket
        fields = ('id', 'attended', 'remarks')

class EventDateAttendanceSerializer(serializers.ModelSerializer):
    event = serializers.StringRelatedField()
    schedule = serializers.SerializerMethodField()
    participants = EventTicketAttendanceSerializer(many=True, read_only=True)
    
    def update(self, instance, validated_data):
        attendance = self.context['request'].data['attendance']
        user = self.context['request'].user
        for obj in attendance:
            event_ticket = EventTicket.objects.get(pk=obj['id'])
            if event_ticket.attended is None and obj['attended']: update_ticket_status(event_ticket, obj, user) # update ticket if instance is null and obj is true
            elif event_ticket.attended and not obj['attended']: update_ticket_status(event_ticket, obj, user) # update ticket if instance is true and obj is false
            elif event_ticket.attended is False and obj['attended']: update_ticket_status(event_ticket, obj, user) # update ticket if instance is false and obj is true
            event_ticket.attended = True if obj['attended'] else None
            event_ticket.save()
        return instance
    
    def get_schedule(self, obj):
        return '%s, %s-%s' % (obj.date, obj.time_start, obj.time_end)
    
    class Meta:
        model = EventDate
        fields = ('id', 'event', 'schedule', 'participants')
        read_only_fields = ['venue', 'address',]
               
class RescheduleSerializer(serializers.ModelSerializer):
    def update(self, instance, validated_data):
        ticket = Ticket.objects.get(pk=instance.ticket.ticket_id   )  # get ticket queryset
        steps =  RequestFormStatus.objects.select_related('form', 'status').filter(form=ticket.request_form).order_by('order')  # get status queryset
        first_step = steps.first() # get first step
        curr_step = steps.get(status_id=ticket.status)
        prev_step = steps.get(order=curr_step.order-1) if not curr_step.status == first_step.status else curr_step # prev current step
        
        # update ticket status
        ticket.status = prev_step.status  # if obj is True, proceed to next step else prev step
        ticket.save()

        # get log from easyaudit
        log = CRUDEvent.objects.filter(object_id=ticket).latest('datetime') 
        Remark.objects.create(ticket_id=ticket.pk, status=ticket.status, action_officer=self.context['request'].user, log=log) # create a remark

        # save instance
        instance.attended = False
        instance.remarks = validated_data.get('remarks', instance.remarks)
        instance.is_reschedule = True
        instance.save()
        return instance

    class Meta:
        model = EventTicket
        fields = '__all__'
        read_only_fields = ['ticket', 'scheduled_event']