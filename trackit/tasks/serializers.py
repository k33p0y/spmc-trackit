from rest_framework import serializers
from django.db import transaction

from .models import OpenTask, Task, Team
from core.models import User
from config.models import Status
from requests.models import Ticket, RequestForm, RequestFormStatus
from core.serializers import UserInfoSerializer

class StatusNameSerializer(serializers.ModelSerializer):

    class Meta:
        model = Status
        fields = ['id', 'name']

class RequestFormStatusNameSerializer(serializers.ModelSerializer):
    status = StatusNameSerializer(read_only=True)

    class Meta:
        model = RequestFormStatus
        fields = ['id', 'status']

class RequestFormReadOnlySerializer(serializers.ModelSerializer):
    
    class Meta:
        model = RequestForm
        fields = ['id', 'name', 'color', 'prefix']

class TicketShortListSerializer(serializers.ModelSerializer):
    request_form = RequestFormReadOnlySerializer(read_only=True)

    class Meta:
        model = Ticket
        fields = ('ticket_id', 'request_form', 'ticket_no', 'reference_no', 'description')

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
    ticket = TicketShortListSerializer(read_only=True)
    task_type = RequestFormStatusNameSerializer(read_only=True)

    def get_officers(self, task):
        return MemberSerializer(task.officers.all(), many=True, context={"task_instance": task}).data

    class Meta:
        model = Task
        fields = '__all__'
        datatables_always_serialize = ('id', 'task_type',)

class RemoveTasksSerializer(serializers.ModelSerializer):
    @transaction.atomic
    def update(self, instance, validated_data):
        officers = instance.officers.all()
        # if pivot table members has more than 1 record
        if len(officers) > 1:           
            Team.objects.filter(task_id=instance.pk, member_id=self.context['request'].user.pk).delete()  # delete team task instance
        else:
            OpenTask.objects.create(ticket = instance.ticket, task_type = instance.task_type) # save isntance to opentask
            Team.objects.filter(task_id=instance.pk).delete() # delete team task instance
            instance.delete() # delete instance
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
                Team.objects.create(
                    task_id = instance.pk,
                    member_id = int(person),
                    assignee = self.context['request'].user
                )
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
    
    @transaction.atomic
    def update(self, instance, validated_data):
        # save isntance to task
        task = Task.objects.create(
            ticket = instance.ticket,
            task_type = instance.task_type,
            opentask_str = str(instance.pk),
        )
        Team.objects.create(member_id=self.context['request'].user.pk, task_id=task.pk)

        # delete instance
        instance.delete()
        return instance

    class Meta:
        model = OpenTask
        fields = '__all__' 

class RemoveTeamPersonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ("id", "member")