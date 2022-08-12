from asyncore import read
from calendar import c
from pickle import OBJ
from rest_framework import serializers

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

    def get_full_name(self, obj):
        return '%s %s' % (obj.first_name, obj.last_name)

    def serialize_team(self, instance):
        member = instance.team_members.filter(task=self.context["task_instance"]).first()

        if member:
            return TeamSerializer(member).data
        return {}

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        return {**rep, **self.serialize_team(instance)}

    class Meta:
        model = User
        fields = ('id', 'full_name', 'first_name', 'last_name')

class TeamSerializer(serializers.ModelSerializer):
    assignee = UserInfoSerializer()
    
    class Meta:
        model = Team
        fields = ("assignee", "date_assigned", "remark")

class TasksSerializer(serializers.ModelSerializer):
    officers = serializers.SerializerMethodField()
    ticket = TicketShortListSerializer(read_only=True)
    task_type = RequestFormStatusNameSerializer(read_only=True)
    
    def get_officers(self, task):
        return MemberSerializer(task.officers.all(), many=True, context={"task_instance": task}).data

    class Meta:
        model = Task
        fields = '__all__'
        datatables_always_serialize = ('task_type',)

class OpenTasksSerializer(serializers.ModelSerializer):
    ticket = TicketShortListSerializer(read_only=True)
    task_type = RequestFormStatusNameSerializer(read_only=True)

    class Meta:
        model = OpenTask
        fields = '__all__'