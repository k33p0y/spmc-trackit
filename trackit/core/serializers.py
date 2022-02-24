from rest_framework import serializers
from rest_framework.validators import UniqueTogetherValidator
from django.contrib.auth import authenticate, login
from django.contrib.auth.hashers import make_password, check_password
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.models import Group, Permission
from django.db.models import Q
from .models import User, UserVerification
from .views import create_users_notification
from config.models import Department


import datetime

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
            email = validated_data['email'],
            contact_no = validated_data['contact_no'],
            department = validated_data['department'],
            license_no = validated_data['license_no'],
            is_superuser = validated_data['is_superuser'],
            is_staff = validated_data['is_staff'],
            is_active = validated_data['is_active'],
            created_by = self.context['request'].user,
            modified_by = self.context['request'].user,
            verified_by = self.context['request'].user,
            verified_at = datetime.datetime.now(),
            is_verified = True,   
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
        if not lastname:
            raise serializers.ValidationError('This field may not be blank.')
        return lastname

    def validate_department(self, department):
        request = self.context['request']
        is_superuser = request.data.get('is_superuser')

        if not department and not is_superuser:
            raise serializers.ValidationError('This field may not be blank.')
        return department

    def validate_contact_no(self, contact_no):
        if contact_no and not contact_no.isdigit():
            raise serializers.ValidationError('This field must be numeric.')
        return contact_no

    def to_representation(self, instance):
        self.fields['department'] =  DepartmentReadOnlySerializer(read_only=True)
        return super(UserSerializer, self).to_representation(instance)

    class Meta:
        model = User
        fields = '__all__'

class UserUpdateSerializer(serializers.ModelSerializer):
    def update(self, instance, validated_data):
        instance.username = validated_data.get('username', instance.username)
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.middle_name = validated_data.get('middle_name', instance.middle_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.suffix = validated_data.get('suffix', instance.suffix)
        instance.email = validated_data.get('email', instance.email)
        instance.contact_no = validated_data.get('contact_no', instance.contact_no)
        instance.department = validated_data.get('department', instance.department)
        instance.license_no = validated_data.get('license_no', instance.license_no)
        instance.is_superuser = validated_data.get('is_superuser', instance.is_superuser)
        instance.is_staff = validated_data.get('is_staff', instance.is_staff)
        instance.is_active = validated_data.get('is_active', instance.is_active)
        instance.modified_by = self.context['request'].user

        instance.groups.clear() # clear user groups
        instance.user_permissions.clear() # clear user permissions
        if validated_data.get('groups', instance.groups): # if there is submitted groups from form
            instance.groups.add(*validated_data.get('groups', instance.groups)) # add selected groups to user
        if validated_data.get('user_permissions', instance.user_permissions): # if there is submitted user permissions from form
            instance.user_permissions.add(*validated_data.get('user_permissions', instance.user_permissions)) # add selected permissions to user
        instance.save() 
        
        create_users_notification(str(instance.pk), instance, 'staff')  # Create notification instance
        return instance

    def validate_first_name(self, firstname):
        if not firstname:
            raise serializers.ValidationError('This field may not be blank.')
        return firstname

    def validate_last_name(self, lastname):
        if not lastname:
            raise serializers.ValidationError('This field may not be blank.')
        return lastname

    def validate_department(self, department):
        request = self.context['request']
        is_superuser = request.data.get('is_superuser')

        if not department and not is_superuser:
            raise serializers.ValidationError('This field may not be blank.')
        return department

    def validate_contact_no(self, contact_no):
        if contact_no and not contact_no.isdigit():
            raise serializers.ValidationError('This field must be numeric.')
        return contact_no

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'middle_name', 'last_name', 'suffix', 'email', 'contact_no', 'department', 'license_no', 'is_superuser', 'is_staff', 'is_active', 'groups', 'user_permissions']

class UserProfileUpdateSerializer(serializers.ModelSerializer):

    def update(self, instance, validated_data):
        instance.email = validated_data.get('email', instance.email)
        instance.contact_no = validated_data.get('contact_no', instance.contact_no)
        instance.license_no = validated_data.get('license_no', instance.license_no)
        instance.modified_by = self.context['request'].user
        instance.save() 
        create_users_notification(str(instance.pk), instance, 'client')  # Create notification instance
        return instance
    
    def validate_contact_no(self, contact_no):
        if contact_no and not contact_no.isdigit():
            raise serializers.ValidationError('This field must be numeric.')
        return contact_no

    class Meta:
        model = User
        fields =  ('id', 'email', 'contact_no', 'license_no')

class ChangePasswordSerializer(serializers.ModelSerializer):
    current_password = serializers.CharField(max_length=128, write_only=True, required=True)
    new_password = serializers.CharField(max_length=128, write_only=True, required=True)

    def update(self, instance, validated_data):
        instance.username = instance.username
        instance.password = make_password(validated_data.get('new_password', instance.password)) # hash password
        instance.save() 
        return instance

    def validate_current_password(self, current_password):   
        if not self.context['request'].user.check_password(current_password):
            raise serializers.ValidationError('Incorrect password.',)
        return current_password

    def validate_new_password(self, new_password):
        request = self.context['request']
        confirm_password = request.data.get('confirm_password')
        
        if not new_password == confirm_password:
            raise serializers.ValidationError('Password does not match.')
        validate_password(password=new_password, user=request.user)
        return new_password

    class Meta:
        model = User
        fields =  ('id', 'username', 'current_password', 'new_password',)

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

class RegisterSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        user = User(
            first_name = validated_data['first_name'],
            last_name = validated_data['last_name'],
            contact_no = validated_data['contact_no'],
            license_no = validated_data['license_no'],
            department = validated_data['department'],
            email = validated_data['email'],
            username = validated_data['username'],
            password = make_password(validated_data['password']) # hash password
        )
        user.save()
        create_users_notification(str(user.pk), user, 'client')  # Create notification instance
        login(self.context['request'], user)
        return user

    def validate_first_name(self, firstname):
        if not firstname:
            raise serializers.ValidationError('This field may not be blank.')
        elif self.context['request'].data.get('last_name'):
            if User.objects.filter(Q(first_name=firstname) & Q(last_name=self.context['request'].data.get('last_name'))).exists():
                raise serializers.ValidationError({'fullname': ['A user with that first name and last name already exists.']})
        return firstname

    def validate_last_name(self, lastname):
        if not lastname:
            raise serializers.ValidationError('This field may not be blank.')
        return lastname
    
    def validate_contact_no(self, contact_no):
        if not contact_no:
            raise serializers.ValidationError('This field may not be blank.')
        if contact_no and not contact_no.isdigit():
            raise serializers.ValidationError('This field must be numeric.')
        return contact_no

    def validate_email(self, email):
        if not email:
            raise serializers.ValidationError('This field may not be blank.')
        else:
            if User.objects.filter(email=email).exists():
                raise serializers.ValidationError('A user with that email address already exists.')
        return email

    def validate_department(self, department):
        if not department:
            raise serializers.ValidationError('This field may not be blank.')
        return department

    def validate_password(self, password):
        request = self.context['request']
        password2 = request.data.get('password2')
        
        if not password == password2:
            raise serializers.ValidationError('Password does not match.')
        validate_password(password=password, user=request.user)
        return password

    # def validate(self, data):
    #     #       Validate first and last name
    #     #        Pre
        
    #     if User.objects.filter(Q(first_name=data['first_name']) & Q(last_name=data['last_name'])).exists():
            
    #     return data

    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'contact_no', 'license_no', 'department', 'email', 'username', 'password',]

class UserVerificationSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = UserVerification
        fields = '__all__'

class DocumentsSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = UserVerification
        exclude = ['user']

class UserInfoSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField('get_full_name')

    def get_full_name(self, obj):
        return '%s %s' % (obj.first_name, obj.last_name)

    class Meta:
        model = User
        fields = ['name']

class UserListSerializer(serializers.ModelSerializer):
    groups = GroupReadOnlySerializer(read_only=True, many=True)
    department = DepartmentReadOnlySerializer(read_only=True)
    documents = DocumentsSerializer(read_only=True, many=True)
    created_by = UserInfoSerializer(read_only=True)
    modified_by = UserInfoSerializer(read_only=True)
    verified_by = UserInfoSerializer(read_only=True)

    class Meta:
        model = User
        exclude = ['password']

class VerifyUserSerializer(serializers.ModelSerializer):

    def update(self, instance, validated_data):
        instance.verified_by = self.context['request'].user
        instance.verified_at = datetime.datetime.now()
        instance.is_verified = True
        instance.save()
        create_users_notification(str(instance.pk), instance, 'staff')  # Create notification instance
        return instance

    class Meta:
        model = User
        fields = ['id', 'username', 'verified_by', 'verified_at', 'is_verified']
        read_only_fields = ['username']

class DeclineVerificationSerializer(serializers.ModelSerializer):

    def update(self, instance, validated_data):
        instance.is_verified = False
        instance.remarks = validated_data.get('remarks', instance.remarks)
        instance.save()
        create_users_notification(str(instance.pk), instance, 'staff')  # Create notification instance
        return instance
        
    class Meta:
        model = User
        fields = ['id', 'username', 'is_verified', 'remarks']
        read_only_fields = ['username']