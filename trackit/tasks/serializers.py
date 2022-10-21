from urllib import request
from rest_framework import serializers
from django.db import transaction

from .models import OpenTask, Task, Team
from core.models import User
from config.models import Status
from requests.models import Ticket, RequestForm, RequestFormStatus
from core.serializers import UserInfoSerializer
from config.serializers import DepartmentSerializer, UserSerializer

from .views import create_task_notification

class StatusNameSerializer(serializers.ModelSerializer):

    class Meta:
        model = Status
        fields = ['id', 'name']

class RequestFormStatusNameSerializer(serializers.ModelSerializer):
    status = StatusNameSerializer(read_only=True)
    officers_len = serializers.SerializerMethodField()

    def get_officers_len(self, instance):
        return instance.officer.count()

    class Meta:
        model = RequestFormStatus
        fields = ['id', 'status', 'is_client_step', 'is_head_step', 'officers_len']

class RequestFormReadOnlySerializer(serializers.ModelSerializer):
    
    class Meta:
        model = RequestForm
        fields = ['id', 'name', 'color', 'prefix']
        
class TicketShortListSerializer(serializers.ModelSerializer):
    request_form = RequestFormReadOnlySerializer(read_only=True)
    requested_by = UserSerializer(read_only=True)
    department = DepartmentSerializer(read_only=True)
    category = serializers.StringRelatedField(many=True)
    
    class Meta:
        model = Ticket
        fields = ('ticket_id', 'request_form', 'ticket_no', 'reference_no', 'description', 'department', 'requested_by', 'category')

class MemberSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    user_id = serializers.SerializerMethodField()

    def get_full_name(self, obj):
        return '%s %s' % (obj.first_name, obj.last_name)

    def get_user_id(self, instance):
        return instance.id

    def serialize_team(self, instance):
        member = instance.team_members.filter(task=self.context["task_instance"]).first()

        if member:
            return TeamInfoSerializer(member).data
        return {}

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        return {**rep, **self.serialize_team(instance)}

    class Meta:
        model = User
        fields = ('user_id', 'full_name', 'first_name', 'last_name', 'username')

class TeamInfoSerializer(serializers.ModelSerializer):
    assignee = UserInfoSerializer()
    team_id = serializers.SerializerMethodField()

    def get_team_id(self, instance):
        return instance.id
    
    class Meta:
        model = Team
        fields = ("team_id", "assignee", "date_assigned", "remark")

class TasksListSerializer(serializers.ModelSerializer):
    officers = serializers.SerializerMethodField()
    logged_in_officer = serializers.SerializerMethodField()
    ticket = TicketShortListSerializer(read_only=True)
    task_type = RequestFormStatusNameSerializer(read_only=True)

    def get_officers(self, task):
        return MemberSerializer(task.officers.all(), many=True, context={"task_instance": task}).data
    
    def get_logged_in_officer(self, task):
        for member in task.officers.all():
            if member == self.context['request'].user: 
                return task.members.get(member=member).pk
        return ''

    class Meta:
        model = Task
        fields = '__all__'
        datatables_always_serialize = ('id', 'task_type', 'officers', 'logged_in_officer', 'date_created', 'date_completed')

class TasksNotificationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Task
        fields = '__all__'

class RemoveTasksSerializer(serializers.ModelSerializer):
    def update(self, instance, validated_data):
        officers = instance.officers.all()
        otask = OpenTask.objects.create(ticket = instance.ticket, task_type = instance.task_type) # save isntance to opentask
        Team.objects.filter(task_id=instance.pk).delete() # delete team task instance
        instance.delete() # delete task instance
        create_task_notification(otask, 'opentask')
        return instance

    class Meta:
        model = Task
        fields = ['id', 'ticket', 'task_type', 'officers']
        read_only_fields = ['id', 'ticket', 'task_type']

class ShareTaskSerializer(serializers.ModelSerializer):

    def update(self, instance, validated_data):
        people = self.context['request'].data['people']
        if people:
            for person in people:
                team = Team.objects.create(
                    task_id = instance.pk,
                    member_id = int(person),
                    assignee = self.context['request'].user
                )
                create_task_notification(team, 'team')
        return instance

    def validate(self, data):
        if not self.context['request'].data['people']:
            raise serializers.ValidationError({'people': 'This field may not be blank.'}) 
        return data

    class Meta:
        model = Task
        fields = ['id', 'ticket', 'task_type', 'officers']
        read_only_fields = ['id', 'ticket', 'task_type']

class OpenTasksSerializer(serializers.ModelSerializer):
    ticket = TicketShortListSerializer(read_only=True)
    task_type = RequestFormStatusNameSerializer(read_only=True)
    
    def update(self, instance, validated_data):
        # save instance to task
        task = Task.objects.create(
            ticket = instance.ticket,
            task_type = instance.task_type,
            opentask_str = str(instance.pk),
        )
        Team.objects.create(member_id=self.context['request'].user.pk, task_id=task.pk)
        instance.delete() # delete opentask instance
        create_task_notification(task, 'task')
        return instance

    class Meta:
        model = OpenTask
        fields = '__all__' 

class RemoveTeamPersonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ("id", "member")