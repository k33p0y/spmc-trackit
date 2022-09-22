from asyncore import read
from datetime import date
from rest_framework import serializers
from django.db import transaction
from django.shortcuts import get_object_or_404

from .models import RequestForm, Ticket, RequestFormStatus, Notification, Attachment, Comment
from config.models import Status, Remark
from core.models import User
from events.models import EventTicket
from easyaudit.models import CRUDEvent
from tasks.models import Task, Team, OpenTask

from .views import create_notification, create_remark
from tasks.views import create_task

from core.serializers import GroupReadOnlySerializer, UserInfoSerializer
from config.serializers import DepartmentSerializer, UserSerializer, CategoryReadOnlySerializer
from tasks.serializers import MemberSerializer

import json, uuid, datetime

# Serializers
class RequestFormStatusSerializer(serializers.ModelSerializer):
   status_id = serializers.ReadOnlyField(source='status.id')
   name = serializers.ReadOnlyField(source='status.name')
   officer = UserInfoSerializer(read_only=True, many=True)

   class Meta: 
      model = RequestFormStatus
      fields = ('id', 'status_id', 'name', 'order', 'is_client_step', 'is_head_step', 'has_approving', 'has_pass_fail', 'has_event', 'officer')

class RequestFormListSerializer(serializers.ModelSerializer):
   status = RequestFormStatusSerializer(source="request_forms", many=True, read_only=True)
   group = GroupReadOnlySerializer(many=True, read_only=True)

   class Meta:
      model = RequestForm
      fields = ['id', 'name', 'prefix', 'color', 'date_created', 'date_modified', 'fields', 'is_active', 'status', 'group', 'category_types']
      depth = 1
      datatables_always_serialize = ('id', 'fields', 'status', 'group', 'category_types')

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
      request_form.group.add(*validated_data['group'])
      request_form.category_types.add(*validated_data['category_types'])

      # create status
      for status in self.context['request'].data['status']:
         form_status = RequestFormStatus.objects.create(
            status_id = status['status'], 
            order = status['order'], 
            is_client_step = status['is_client'],
            is_head_step = status['is_head'],
            has_approving = status['has_approving'],
            has_pass_fail = status['has_pass_fail'],
            has_event = status['has_event'],
            form = request_form
         )
         form_status.officer.add(*status['officer'])

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
      # RequestFormStatus.objects.filter(form=instance).delete()
      for status in self.context['request'].data['status']:
         ins = get_object_or_404(RequestFormStatus, pk=status['formstatus'])
         ins.status_id = status['status']
         ins.order = status['order']
         ins.is_client_step = status['is_client']
         ins.is_head_step = status['is_head']
         ins.has_approving = status['has_approving']
         ins.has_pass_fail = status['has_pass_fail']
         ins.has_event = status['has_event']
         ins.form = instance
         
         ins.officer.clear()
         if status['officer']:
            ins.officer.add(*status['officer'])
         ins.save()
  
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
      # datatables_always_serialize = ('id', 'fields', 'status', 'group', 'category_types')

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
   officers = serializers.SerializerMethodField()

   def get_progress(self, instance):
      steps = RequestFormStatus.objects.select_related('form', 'status').filter(form_id=instance.request_form).order_by('order')
      for step in steps: curr_step = steps.get(status_id=instance.status)
      progress = round((curr_step.order / len(steps)) * 100) # get progress value
      return progress
   
   def get_officers(self, instance):
      # getting current working officers per status
      task = instance.tasks.filter(task_type__status=instance.status).last()
      ticket_officers = MemberSerializer(task.officers.all(), many=True, context={"task_instance": task}).data if task else None
      return ticket_officers

   class Meta:
      model = Ticket
      exclude = ['form_data']
      datatables_always_serialize = ('ticket_id', 'progress', 'department', 'officers')

class TicketCounterSerializer(serializers.ModelSerializer):

   class Meta:
      model = Ticket
      fields = ['form_data']

class TicketProfileSerializer(serializers.ModelSerializer):
   status = StatusReadOnlySerializer(read_only=True)
   request_form = RequestFormReadOnlySerializer(read_only=True)
   category = CategoryReadOnlySerializer(many=True, read_only=True)
   progress = serializers.SerializerMethodField()

   def get_progress(self, instance):
      steps = RequestFormStatus.objects.select_related('form', 'status').filter(form_id=instance.request_form).order_by('order')
      for step in steps: curr_step = steps.get(status_id=instance.status)
      progress = round((curr_step.order / len(steps)) * 100) # get progress value
      return progress

   class Meta:
      model = Ticket
      fields = ('ticket_id', 'ticket_no', 'request_form', 'description', 'requested_by', 'category', 'status', 'progress', 'date_created')
      datatables_always_serialize = ('ticket_id', 'progress')

class TicketDashboardSerializer(serializers.ModelSerializer):
   status = StatusReadOnlySerializer(read_only=True)
   request_form = RequestFormReadOnlySerializer(read_only=True)
   requested_by = UserSerializer(read_only=True)
   progress = serializers.SerializerMethodField()

   def get_progress(self, instance):
      steps = RequestFormStatus.objects.select_related('form', 'status').filter(form_id=instance.request_form).order_by('order')
      for step in steps: curr_step = steps.get(status_id=instance.status)
      progress = round((curr_step.order / len(steps)) * 100) # get progress value
      return progress

   class Meta:
      model = Ticket
      fields = ('ticket_id', 'ticket_no', 'request_form', 'description', 'requested_by', 'status', 'progress', 'date_created')
      datatables_always_serialize = ('ticket_id', 'progress')

class TicketCRUDSerializer(serializers.ModelSerializer):
   requested_by = UserSerializer(read_only=True)
   department = DepartmentSerializer(read_only=True)

   def create(self, validated_data):
      form = RequestForm.objects.get(pk=validated_data['request_form'].id)
      formstatus = form.request_forms.get(order=1).pk

      try:
         ticket = Ticket(
            ticket_no = validated_data['ticket_no'],
            description = validated_data['description'],
            request_form = validated_data['request_form'],
            form_data = validated_data['form_data'],
            status = form.status.get(form_statuses__order=1),
            requested_by = self.context['request'].user,
            department = self.context['request'].user.department,
            is_active = True
         )
         ticket.save()
         ticket.category.add(*validated_data['category'])

         create_task(ticket, formstatus, None, None, '') # create new task instance
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
   
   def create(self, validated_data):
      current_user = self.context['request'].user
      active_task = self.context['request'].data['task'] # task id request data
      event_date = self.context['request'].data['event_date'] # event_date request obj
      assign_officer = self.context['request'].data['assign_to'] # officers list request data
      formstatus = self.context['request'].data['formstatus'] # formstatus id request data

      # update ticket status first
      ticket = get_object_or_404(Ticket, pk=uuid.UUID(str(validated_data['ticket'])))
      ticket.status = validated_data['status']
      ticket.save()
 
      # get log from easyaudit
      log = CRUDEvent.objects.filter(object_id=ticket).latest('datetime') 
   
      # create action Remark
      action = Remark(
         ticket_id = ticket.ticket_id,
         status = ticket.status,
         remark = validated_data['remark'],
         is_approve = validated_data['is_approve'],
         is_pass = validated_data['is_pass'],
         action_officer = current_user,
         log = log
      )  
      action.save()

      # update task instance, mark complete\
      if active_task:
         task = get_object_or_404(Task, pk=active_task)
         task.date_completed = datetime.datetime.now()
         task.save()
   
      create_task(ticket, formstatus, assign_officer, current_user, action.remark) # create new task instance
      create_notification(str(ticket.ticket_id), ticket, 'ticket') # create notification instance

      # post EventTicket if action has_event
      if event_date: 
         EventTicket.objects.create(ticket_id=ticket.ticket_id, scheduled_event_id=event_date)

      return action

   def validate_ticket(self, ticket):
      event_ticket = EventTicket.objects.filter(ticket=ticket, attended__isnull=True).first()
      if event_ticket: # check if attendance has not yet performed. 
         raise serializers.ValidationError({'attendance': 'Attendance has not yet tagged. '})     
      return ticket
    
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
      datatables_always_serialize = ('id', 'file_type', 'file', 'file_size', 'ticket')

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
   ticket = serializers.SerializerMethodField()
   remarks = serializers.SerializerMethodField()
   task = serializers.SerializerMethodField()

   def get_ticket(self, instance):
      object_json_repr = json.loads(instance.object_json_repr)
      object_id = None
      if (object_json_repr[0]['model'] == 'requests.comment'): object_id = object_json_repr[0]['fields']['ticket']
      if (object_json_repr[0]['model'] == 'requests.ticket'): object_id = instance.object_id
      if object_id:
         ticket = Ticket.objects.get(pk=object_id)
         return {
            'ticket_no' : ticket.ticket_no,
            'requestor' : '%s %s' % (ticket.requested_by.first_name, ticket.requested_by.last_name)
         }
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

   def get_task(self, instance):
      object_json_repr = json.loads(instance.object_json_repr)
      if (object_json_repr[0]['model'] == 'tasks.task'):
         task = Task.objects.get(pk=instance.object_id)
         return {
            'task_id' : task.pk,
            'is_head_task' : task.task_type.is_head_step,
            'is_client_task' : task.task_type.is_client_step,
            'date_created' : task.date_created,
            'date_completed' : task.date_completed,
            'task_type' : task.task_type.status.name,
            'ticket' : {
               'ticket_no' : task.ticket.ticket_no
            }
         }
      elif (object_json_repr[0]['model'] == 'tasks.team'):
         user = User.objects.get(pk=object_json_repr[0]['fields']['member'])
         return {
               'task_id' : object_json_repr[0]['fields']['task'],
               'member' : '%s %s' % (user.first_name, user.last_name)
            }
      elif (object_json_repr[0]['model'] == 'tasks.opentask'):
         otask = OpenTask.objects.get(pk=instance.object_id)
         return {'task_id': otask.pk}
      return ''
   
   class Meta:
      model = CRUDEvent
      fields = ['event_type', 'object_id', 'datetime', 'user', 'changed_fields', 'object_json_repr', 'ticket', 'remarks', 'task', 'content_type']

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

class FormStatusOfficerSerializer(serializers.ModelSerializer):
   name = serializers.ReadOnlyField(source='status.name')
   officer = UserInfoSerializer(read_only=True, many=True)

   class Meta: 
      model = RequestFormStatus
      fields = ('id', 'name', 'officer')
