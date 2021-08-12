from rest_framework import serializers

from .models import RequestForm, Ticket, RequestFormStatus, Notification, Attachment, Comment
from .views import create_notification, create_remark, generate_reference
from config.models import Department, Status, Remark
from core.models import User

from core.serializers import GroupReadOnlySerializer
from config.serializers import DepartmentSerializer, UserSerializer, CategorySerializer, StatusSerializer, CategoryReadOnlySerializer

from django.db import transaction
from easyaudit.models import CRUDEvent

import json, uuid

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
      fields = ['id', 'name', 'prefix', 'color', 'date_created', 'date_modified', 'fields', 'is_active', 'status', 'group', 'category_types']
      depth = 1

class RequestFormReadOnlySerializer(serializers.ModelSerializer):
   class Meta:
      model = RequestForm
      fields = ['id', 'name', 'color', 'prefix']

class StatusReadOnlySerializer(serializers.ModelSerializer):
   class Meta:
      model = Status
      fields = ['id', 'name']

class TicketSerializer(serializers.ModelSerializer):
   requested_by = UserSerializer(read_only=True)
   department = DepartmentSerializer(read_only=True)

   def create(self, validated_data):
      form = RequestForm.objects.get(pk=validated_data['request_form'].id)
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
      remark, created = create_remark(str(ticket.ticket_id), ticket) # Create initial remark
      return ticket

   def validate_ticket_no(self, ticket_no):
      if not ticket_no:
         ticket_no = uuid.uuid4().hex[-10:].upper()            
      return ticket_no

   def validate_description(self, description):
      ticket = Ticket.objects.filter(description__iexact=description).exists()
      if ticket:
         raise serializers.ValidationError('Duplicate Record. A record with this title already exists.')
      if not description:
         raise serializers.ValidationError('This field may not be blank.')         
      return description

   def validate_request_form(self, request_form):
      if not request_form:
         raise serializers.ValidationError('This field may not be blank.')  
      return request_form

   def validate_category(self, category):
      if not category:
         raise serializers.ValidationError('This field may not be blank.')  
      return category

   class Meta:
      model = Ticket
      fields = '__all__'
      datatables_always_serialize = ('ticket_id',)
        
class TicketReferenceSerializer(serializers.ModelSerializer):

   class Meta:
      model = Ticket
      fields = ['ticket_id', 'reference_no']

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
