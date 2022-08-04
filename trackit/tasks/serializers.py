from rest_framework import serializers

from .models import Task, Team
from core.models import User
from core.serializers import UserInfoSerializer

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

    def get_officers(self, task):
        return MemberSerializer(task.officers.all(), many=True, context={"task_instance": task}).data

    class Meta:
        model = Task
        fields = '__all__'