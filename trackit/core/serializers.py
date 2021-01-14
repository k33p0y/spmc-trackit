from django.contrib.auth.hashers import make_password
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from django.contrib.auth.models import Group, Permission
from .models import User

class UserSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        password = make_password(validated_data['password'])
        groups = validated_data['groups'],
        user_permissions = validated_data['user_permissions'],
        print(groups)
        print(user_permissions)

        user = User(
            username=validated_data['username'],
            password=password,
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            is_superuser=validated_data['is_superuser'],
            is_staff=validated_data['is_staff'],
            is_active=validated_data['is_active'],
            # groups=validated_data['groups'],
            # user_permissions=validated_data['user_permissions'],
        )
        user.save()
        return user

    def validate_password(self, value):
        user = self.context['request'].user
        validate_password(password=value, user=user)
        return value

    class Meta:
        model = User
        fields = '__all__'

class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['id', 'name', 'permissions']