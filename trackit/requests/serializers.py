from rest_framework import serializers

from .models import RequestForm, Ticket, RequestFormStatus, Notification, Attachment, Comment
from config.models import Department, Status, Remark
from core.models import User
from core.serializers import GroupReadOnlySerializer
from config.serializers import DepartmentSerializer, UserSerializer, CategorySerializer, StatusSerializer
from django.db import transaction
from easyaudit.models import CRUDEvent

import json

# Serializers
class RequestFormStatusSerializer(serializers.ModelSerializer):
   id = serializers.ReadOnlyField(source='status.id')
   name = serializers.ReadOnlyField(source='status.name')

   class Meta: 
      model = RequestFormStatus
      fields = ('id', 'name', 'order', 'is_client_step', 'is_head_step', 'has_approving', 'has_pass_fail')

class RequestFormSerializer(serializers.ModelSerializer):
   color = serializers.CharField(required=True, max_length=10)
   status = RequestFormStatusSerializer(source="requestformstatus_set", many=True, read_only=True)
   group = GroupReadOnlySerializer(many=True, read_only=True)

   class Meta:
      model = RequestForm
      fields = ['id', 'name', 'color', 'date_created', 'date_modified', 'fields', 'is_active', 'is_archive', 'status', 'group']
      depth = 1

class RequestFormReadOnlySerializer(serializers.ModelSerializer):
   class Meta:
      model = RequestForm
      fields = ['id', 'name', 'color']

class StatusReadOnlySerializer(serializers.ModelSerializer):
   class Meta:
      model = Status
      fields = ['id', 'name']

class TicketSerializer(serializers.ModelSerializer):
   requested_by = UserSerializer(read_only=True)

   # def validate(self, data):
   #    if(data['form_data']):
   #       for x in data['form_data']:
   #          if (x['required'] == True and x['value'] != ''):
   #             raise serializers.ValidationError("validate error")

   #    return data

   class Meta:
      model = Ticket
      fields = '__all__'
      datatables_always_serialize = ('ticket_id',)
        
   def to_representation(self, instance):
      self.fields['status'] = StatusReadOnlySerializer(read_only=True)
      self.fields['department'] = DepartmentSerializer(read_only=True)
      self.fields['request_form'] = RequestFormReadOnlySerializer(read_only=True)
      self.fields['category'] = CategorySerializer(read_only=True)
      return super(TicketSerializer, self).to_representation(instance)

class AttachmentSerializer(serializers.ModelSerializer):
   uploaded_by = UserSerializer(read_only=True)
   file_size = serializers.SerializerMethodField('get_file_size')

   def get_file_size(self, filename):
      return filename.file.size
   
   class Meta:
      model = Attachment
      fields =  ['id', 'file_name', 'file_type', 'file_size', 'file', 'ticket', 'uploaded_at', 'uploaded_by']

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
      fields = ['event_type', 'object_id', 'datetime', 'user', 'changed_fields', 'object_json_repr', 'ticket_no', 'remarks']

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
