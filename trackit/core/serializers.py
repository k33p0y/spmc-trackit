from django.contrib.auth.hashers import make_password
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from django.contrib.auth.models import Group, Permission
from .models import User
from config.models import Department

class DepartmentReadOnlySerializer(serializers.ModelSerializer):

    class Meta:
        model = Department
        fields = ['id', 'name']
        
        
class UserSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        user = User(
            username = validated_data['username'],
            password = make_password(validated_data['password']), # hash password
            first_name = validated_data['first_name'],
            middle_name = validated_data['middle_name'],
            last_name = validated_data['last_name'],
            suffix = validated_data['suffix'],
            department = validated_data['department'],
            is_superuser = validated_data['is_superuser'],
            is_staff = validated_data['is_staff'],
            is_active = validated_data['is_active'],
        )
        user.save()
        user.groups.add(*validated_data['groups']) # add groups to user
        user.user_permissions.add(*validated_data['user_permissions']) # add permissions to user
        return user

    def update(self, instance, validated_data):
        instance.username = instance.username
        instance.first_name = instance.first_name
        instance.middle_name = instance.middle_name
        instance.last_name = instance.last_name
        instance.suffix = instance.suffix
        instance.email = instance.email
        instance.department = instance.department
        instance.is_superuser = instance.is_superuser
        instance.is_staff = instance.is_staff
        instance.is_active = instance.is_active
        instance.password = make_password(validated_data.get('password', instance.password)) # hash password

        instance.save() 
        return instance

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
        if not email:
            raise serializers.ValidationError('This field may not be blank.')
        return lastname

    def validate_email(self, email):
        if not email:
            raise serializers.ValidationError('This field may not be blank.')
        return email

    def validate_department(self, department):
        if not department:
            raise serializers.ValidationError('This field may not be blank.')
        return department

    def to_representation(self, instance):
        self.fields['department'] =  DepartmentReadOnlySerializer(read_only=True)
        return super(UserSerializer, self).to_representation(instance)

    class Meta:
        model = User
        fields = '__all__'

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'first_name', 'middle_name', 'last_name', 'email', 'suffix', 'department', 'is_superuser', 'is_staff', 'is_active', 'groups', 'user_permissions']

    def update(self, instance, validated_data):
        instance.username = validated_data.get('username', instance.username)
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.middle_name = validated_data.get('middle_name', instance.middle_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.email = validated_data.get('email', instance.email)
        instance.suffix = validated_data.get('suffix', instance.suffix)
        instance.department = validated_data.get('department', instance.department)
        instance.is_superuser = validated_data.get('is_superuser', instance.is_superuser)
        instance.is_staff = validated_data.get('is_staff', instance.is_staff)
        instance.is_active = validated_data.get('is_active', instance.is_active)

        instance.groups.clear() # clear user groups
        instance.user_permissions.clear() # clear user permissions
        if validated_data.get('groups', instance.groups): # if there is submitted groups from form
            instance.groups.add(*validated_data.get('groups', instance.groups)) # add selected groups to user
        if validated_data.get('user_permissions', instance.user_permissions): # if there is submitted user permissions from form
            instance.user_permissions.add(*validated_data.get('user_permissions', instance.user_permissions)) # add selected permissions to user
        instance.save() 
        return instance

    def validate_first_name(self, firstname):
        if not firstname:
            raise serializers.ValidationError('This field may not be blank.')
        return firstname

    def validate_last_name(self, lastname):
        if not lastname:
            raise serializers.ValidationError('This field may not be blank.')
        return lastname

    def validate_email(self, email):
        if not email:
            raise serializers.ValidationError('This field may not be blank.')
        return email

    def validate_department(self, department):
        if not department:
            raise serializers.ValidationError('This field may not be blank.')
        return department

class GroupSerializer(serializers.ModelSerializer):
   user_count = serializers.SerializerMethodField()

   def get_user_count(self, obj):
      return obj.user_set.count()

   class Meta:
      model = Group
      fields = ['id', 'name', 'permissions', 'user_count']
      

class GroupReadOnlySerializer(serializers.ModelSerializer):

   class Meta:
      model = Group
      fields = ['id', 'name']