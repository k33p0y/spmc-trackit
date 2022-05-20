from rest_framework import serializers
from django.db import transaction
from django.shortcuts import get_object_or_404

from .views import create_notification, create_remark
from .models import RequestForm, Ticket, RequestFormStatus, Notification, Attachment, Comment
from config.models import Department, Status, Remark
from core.models import User
from events.models import EventTicket
from easyaudit.models import CRUDEvent

from core.serializers import GroupReadOnlySerializer
from config.serializers import DepartmentSerializer, UserSerializer, CategorySerializer, StatusSerializer, CategoryReadOnlySerializer, CategoryTypeReadOnlySerializer

import json, uuid

# Serializers
class RequestFormStatusSerializer(serializers.ModelSerializer):
   id = serializers.ReadOnlyField(source='status.id')
   name = serializers.ReadOnlyField(source='status.name')

   class Meta: 
      model = RequestFormStatus
      fields = ('id', 'name', 'order', 'is_client_step', 'is_head_step', 'has_approving', 'has_pass_fail', 'has_event')

class RequestFormListSerializer(serializers.ModelSerializer):
   status = RequestFormStatusSerializer(source="requestformstatus_set", many=True, read_only=True)
   group = GroupReadOnlySerializer(many=True, read_only=True)

   class Meta:
      model = RequestForm
      fields = ['id', 'name', 'prefix', 'color', 'date_created', 'date_modified', 'fields', 'is_active', 'status', 'group', 'category_types']
      depth = 1

class RequestFormCRUDSerializer(serializers.ModelSerializer):
   color = serializers.CharField(required=True)

   @transaction.atomic
   def create(self, validated_data):
      request_form = RequestForm.objects.create(
         name = validated_data['name'],
         prefix = validated_data['prefix'],
         color = validated_data['color'],
         fields = validated_data['fields'],
         is_active = validated_data['is_active']
      )
      request_form.save()
      request_form.group.add(*validated_data['group'])
      request_form.category_types.add(*validated_data['category_types'])

      # create status
      for status in self.context['request'].data['status']:
         RequestFormStatus.objects.create(
            status_id = status['status'], 
            order = status['order'], 
            is_client_step = status['is_client'],
            is_head_step = status['is_head'],
            has_approving = status['has_approving'],
            has_pass_fail = status['has_pass_fail'],
            has_event = status['has_event'],
            form = request_form
         )

      return request_form

   @transaction.atomic
   def update(self, instance, validated_data):
      instance.name = validated_data.get('name', instance.name)
      instance.prefix = validated_data.get('prefix', instance.prefix)
      instance.color = validated_data.get('color', instance.color)
      instance.fields = validated_data.get('fields', instance.fields)
      instance.is_active = validated_data.get('is_active', instance.is_active)

      instance.group.clear() # clear form groups
      instance.category_types.clear() # clear form category types
      if validated_data.get('group', instance.group): # if there is submitted groups from form
         instance.group.add(*validated_data.get('group', instance.group)) # add selected groups to  request form
      if validated_data.get('category_types', instance.category_types): # if there is submitted category types from form
         instance.category_types.add(*validated_data.get('category_types', instance.category_types)) # add selected category types to request form
      instance.save()

      # update status
      RequestFormStatus.objects.filter(form=instance).delete()
      for status in self.context['request'].data['status']:
         RequestFormStatus.objects.create(
            status_id = status['status'], 
            order = status['order'], 
            is_client_step = status['is_client'],
            is_head_step = status['is_head'],
            has_approving = status['has_approving'],
            has_pass_fail = status['has_pass_fail'],
            has_event = status['has_event'],
            form = instance
         )
   
      return instance

   def validate_name(self, name):
      if not name:
         raise serializers.ValidationError('This field may not be blank.')
      return name

   def validate_prefix(self, prefix):
      if not prefix:
         raise serializers.ValidationError('This field may not be blank.')
      return prefix

   class Meta:
      model = RequestForm
      fields = '__all__'

class RequestFormReadOnlySerializer(serializers.ModelSerializer):
   class Meta:
      model = RequestForm
      fields = ['id', 'name', 'color', 'prefix']

class StatusReadOnlySerializer(serializers.ModelSerializer):
   class Meta:
      model = Status
      fields = ['id', 'name']

class TicketListSerializer(serializers.ModelSerializer):
   requested_by = UserSerializer(read_only=True)
   status = StatusReadOnlySerializer(read_only=True)
   request_form = RequestFormReadOnlySerializer(read_only=True)
   department = DepartmentSerializer(read_only=True)
   category = CategoryReadOnlySerializer(many=True, read_only=True)
   progress = serializers.SerializerMethodField()

   def get_progress(self, instance):
      steps = RequestFormStatus.objects.select_related('form', 'status').filter(form_id=instance.request_form).order_by('order')
      for step in steps: curr_step = steps.get(status_id=instance.status)
      progress = round((curr_step.order / len(steps)) * 100) # get progress value
      return progress

   class Meta:
      model = Ticket
      exclude = ['form_data']
      datatables_always_serialize = ('ticket_id', 'progress')

class TicketCRUDSerializer(serializers.ModelSerializer):
   requested_by = UserSerializer(read_only=True)
   department = DepartmentSerializer(read_only=True)

   def create(self, validated_data):
      form = RequestForm.objects.get(pk=validated_data['request_form'].id)
      try:
         ticket = Ticket(
            ticket_no = validated_data['ticket_no'],
            description = validated_data['description'],
            request_form = validated_data['request_form'],
            form_data = validated_data['form_data'],
            status = form.status.get(requestformstatus__order=1),
            requested_by = self.context['request'].user,
            department = self.context['request'].user.department,
            is_active = True
         )
         ticket.save()
         ticket.category.add(*validated_data['category'])
      
         create_notification(str(ticket.ticket_id), ticket, 'ticket')  # Create notification instance
         create_remark(str(ticket.ticket_id), ticket) # Create initial remark
      except Exception as error:
         # Execute roll back from saved intance
         logs = CRUDEvent.objects.filter(object_id=str(ticket.ticket_id))
         ticket.delete()
         for log in logs:
            Notification.objects.filter(log=log).delete()
            log.delete()
         raise error
      return ticket

   def update(self, instance, validated_data):
      instance.description = validated_data.get('description', instance.description)
      instance.form_data = validated_data.get('form_data', instance.form_data)
      instance.request_form = validated_data.get('request_form', instance.request_form)
      instance.is_active = validated_data.get('is_active', instance.is_active)
      instance.category.clear()
      if validated_data.get('category', instance.category): # if there is submitted groups from form
         instance.category.add(*validated_data.get('category', instance.category)) # add selected groups to user
      instance.save()

      create_notification(str(instance.ticket_id), instance, 'ticket')  # Create notification instance

      return instance

   def validate_ticket_no(self, ticket_no):
      if not ticket_no:
         ticket_no = uuid.uuid4().hex[-10:].upper()            
      return ticket_no

   def validate_description(self, description):
      if not description:
         raise serializers.ValidationError('This field may not be blank.')         
      return description

   def validate_request_form(self, request_form):
      if not self.instance and not request_form:
         raise serializers.ValidationError('This field may not be blank.')  
      return request_form

   def validate_category(self, category):
      if not category:
         raise serializers.ValidationError('This field may not be blank.')  
      return category

   def validate_form_data(self, form_data):
      if not form_data:
         raise serializers.ValidationError()
      else:
         errors = list()
         # Iterate each dict from list
         # Check object form type
         # Verify if field is required and has value
         # Append to list on each error occur
         for obj in form_data:
            field_error = obj['id'] if not obj['is_multifield'] else 'multifield'
            # For text and textarea fields
            if obj['type'] == 'text' or obj['type'] == 'textarea' or obj['type'] == 'datetime':
               if obj['is_required'] and not obj['value']: 
                  errors.append({'field_id':obj['id'], 'field_type':obj['type'], 'field_error':field_error, 'message':'This field may not be blank.'})
            # For radio and checkbox fields
            if obj['type']  == 'radio' or obj['type']  == 'checkbox' or obj['type'] == 'select':
               if obj['is_required']:
                  checked = False # Checked or selected
                  for option in obj['value']:
                     if option['option_value']:
                        checked = True # Checked or selected
                        break
                  if not checked:
                     errors.append({'field_id':obj['id'], 'field_type':obj['type'], 'field_error':field_error, 'message':'Please select an option.'})
            # Remove object
            del obj['title']
         # If has errors raise exception
         if errors:
            raise serializers.ValidationError(errors)
      return form_data
      
   class Meta:
      model = Ticket
      exclude = ['reference_no']
        
class TicketReferenceSerializer(serializers.ModelSerializer):
   
   def validate_reference_no(self, reference_no):
      if self.instance.reference_no:
         raise serializers.ValidationError('Ticket reference number already generated.')
      return reference_no

   class Meta:
      model = Ticket
      fields = ['ticket_no', 'reference_no']
      read_only_fields = ['ticket_no']

class TicketStatusSerializer(serializers.ModelSerializer):

   class Meta:
      model = Ticket
      fields = ['ticket_no', 'status']
      read_only_fields = ['ticket_no']

class TicketActionSerializer(serializers.ModelSerializer):

   @transaction.atomic
   def create(self, validated_data):
      # update ticket status first
      ticket = get_object_or_404(Ticket, pk=uuid.UUID(str(validated_data['ticket'])))
      ticket.status = validated_data['status']
      ticket.save()
      
      # get log from easyaudit
      log = CRUDEvent.objects.filter(object_id=validated_data['ticket']).latest('datetime') 

      # post action Remark
      action = Remark(
         ticket_id = ticket.ticket_id,
         remark = validated_data['remark'],
         status = validated_data['status'],
         is_approve = validated_data['is_approve'],
         is_pass = validated_data['is_pass'],
         action_officer = self.context['request'].user,
         log = log
      )
      action.save()
      
      # post EventTicket if action has_event
      event_date = self.context['request'].data['event_date'] # event_date request obj
      if event_date: 
         EventTicket.objects.create(ticket_id=ticket.ticket_id, scheduled_event_id=event_date)
         
      return action
    
   class Meta:
      model = Remark
      fields = ['id', 'remark', 'date_created', 'ticket', 'status', 'is_approve', 'is_pass', 'action_officer', 'log',]
      read_only_fields = ['action_officer', 'log']

class AttachmentSerializer(serializers.ModelSerializer):
   uploaded_by = UserSerializer(read_only=True)
   file_size = serializers.SerializerMethodField('get_file_size')

   def get_file_size(self, filename):
      return filename.file.size
   
   class Meta:
      model = Attachment
      fields =  ['id', 'file_name', 'file_type', 'file_size', 'file', 'description', 'ticket', 'uploaded_at', 'uploaded_by']

# serializer choice field
class ChoiceField(serializers.ChoiceField):

   def to_representation(self, obj):
      if obj == '' and self.allow_blank:
         return obj
      return self._choices[obj]

   def to_internal_value(self, data):
      # To support inserts with the value
      if data == '' and self.allow_blank:
         return ''

      for key, val in self._choices.items():
         if val == data:
               return key
      self.fail('invalid_choice', input=data)

class CRUDEventSerializer(serializers.ModelSerializer):
   event_type = ChoiceField(choices=CRUDEvent.TYPES)
   changed_fields = serializers.JSONField()
   ticket_no = serializers.SerializerMethodField()
   remarks = serializers.SerializerMethodField()

   def get_ticket_no(self, instance):
      object_json_repr = json.loads(instance.object_json_repr)
      if (object_json_repr[0]['model'] == 'requests.comment'):
         ticket = Ticket.objects.get(pk=object_json_repr[0]['fields']['ticket'])
         return ticket.ticket_no
      return ''

   def get_remarks(self, instance):
      try:
         obj = Remark.objects.get(log_id=instance.id)
         if obj:
            return {
               'remark' : obj.remark,
               'is_approve' : obj.is_approve,
               'is_pass' : obj.is_pass
            }
         else:
            ''
      except Remark.DoesNotExist:
         pass

   class Meta:
      model = CRUDEvent
      fields = ['event_type', 'object_id', 'datetime', 'user', 'changed_fields', 'object_json_repr', 'ticket_no', 'remarks', 'content_type']

   def to_representation(self, instance):
      if instance.changed_fields:
         instance.changed_fields = json.loads(instance.changed_fields) # convert changed_fields from string to JSON
      self.fields['user'] = UserSerializer(read_only=True)
      return super(CRUDEventSerializer, self).to_representation(instance)

class NotificationSerializer(serializers.ModelSerializer):
   user = UserSerializer(read_only=True)
   log = CRUDEventSerializer(read_only=True)

   class Meta:
      model = Notification
      fields = ['id', 'log', 'user', 'unread']

class CommentSerializer(serializers.ModelSerializer):
   user = UserSerializer(read_only=True)

   class Meta:
      model = Comment
      fields = '__all__'
