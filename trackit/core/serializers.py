from django.contrib.auth.hashers import make_password
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from django.contrib.auth.models import Group, Permission
from .models import User

class UserSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        user = User(
            username = validated_data['username'],
            password = make_password(validated_data['password']), # hash password
            first_name = validated_data['first_name'],
            last_name = validated_data['last_name'],
            is_superuser = validated_data['is_superuser'],
            is_staff = validated_data['is_staff'],
            is_active = validated_data['is_active'],
        )
        user.save()
        user.groups.add(*validated_data['groups']) # add groups to user
        user.user_permissions.add(*validated_data['user_permissions']) # add permissions to user
        return user

    def validate_password(self, password):
        request = self.context['request']
        password2 = request.data.get('password2')
        
        if not password == password2:
            raise serializers.ValidationError('Password does not match.')
        validate_password(password=password, user=request.user)
        return password
    
    def validate_first_name(self, firstname):
        if not firstname:
            raise serializers.ValidationError('This field may not be blank.')
        return firstname

    def validate_last_name(self, lastname):
        if not lastname:
            raise serializers.ValidationError('This field may not be blank.')
        return lastname

    class Meta:
        model = User
        fields = '__all__'

class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['id', 'name', 'permissions']