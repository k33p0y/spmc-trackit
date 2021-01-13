from rest_framework import serializers
from django.contrib.auth.models import Group, Permission
from .models import User

class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = '__all__'

class GroupSerializer(serializers.ModelSerializer):
    
    def create(self, validated_data):
        request = self.context['request']
        post_data_permissions = request.data.get('permissions')
        group = Group.objects.create(**validated_data)
        
        if post_data_permissions:
            permissions_qs = Permission.objects.filter(pk__in=post_data_permissions) # selected permissions queryset
            group.permissions.add(*permissions_qs) # add permissions queryset to group
        return group
    
    class Meta:
        model = Group
        fields = ['id', 'name',]