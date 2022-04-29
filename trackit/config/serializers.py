from rest_framework import serializers

from .models import Department, Category, CategoryType, Status
from core.models import User
from core.serializers import GroupReadOnlySerializer

# Serializers
class UserSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name']

class DepartmentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Department
        fields = ['id', 'name', 'is_active', 'department_head']
        datatables_always_serialize = ('id',)
        
    def to_representation(self, instance):
        self.fields['department_head'] =  UserSerializer(read_only=True)
        return super(DepartmentSerializer, self).to_representation(instance)

class CategoryTypeSerializer(serializers.ModelSerializer):

    def create(self, validated_data):
        categorytype = CategoryType(
            name = validated_data['name'],
            is_active = validated_data['is_active']
        )
        categorytype.save()
        return categorytype

    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.is_active = validated_data.get('is_active', instance.is_active)
        instance.save()
        return instance

    def validate_name(self, name):
        if not name:
            raise serializers.ValidationError('This field may not be blank.')
        return name

    class Meta:
        model = CategoryType
        fields = ['id', 'name', 'is_active']
        datatables_always_serialize = ('id',)

class CategoryGETSerializer(serializers.ModelSerializer):
    groups = GroupReadOnlySerializer(read_only=True, many=True)
    category_type = CategoryTypeSerializer(read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'is_active', 'category_type', 'groups',]
        datatables_always_serialize = ('id',)

class CategorySerializer(serializers.ModelSerializer):

    def create(self, validated_data):
        category = Category(
            name = validated_data['name'],
            category_type = validated_data['category_type'],
            is_active = validated_data['is_active']
        )
        category.save()
        category.groups.add(*validated_data['groups'])
        return category

    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.category_type = validated_data.get('category_type', instance.category_type)
        instance.is_active = validated_data.get('is_active', instance.is_active)  
        instance.groups.clear()
        if validated_data.get('groups', instance.groups):
            instance.groups.add(*validated_data.get('groups', instance.groups))
        instance.save()
        return instance

    def validate_name(self, name):
        if not name:
            raise serializers.ValidationError('This field may not be blank.')
        return name

    def validate_category_type(self, category_type):
        if not category_type:
            raise serializers.ValidationError('This field may not be blank.')
        return category_type

    class Meta:
        model = Category
        fields = ['id', 'name', 'is_active', 'category_type', 'groups',]
        datatables_always_serialize = ('id',)

class CategoryReadOnlySerializer(serializers.BaseSerializer):

    class Meta:
        model = Category
        fields = ['name', 'category_type']

    def to_representation(self, instance):
        return {
            'id': instance.id,
            'name': instance.name,
            'category_type_id': instance.category_type.id,
            'category_type_name': instance.category_type.name
        }

class CategoryTypeReadOnlySerializer(serializers.ModelSerializer):

    class Meta:
        model = CategoryType
        fields = ['id', 'name',]

class StatusSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Status
        fields = ['id', 'name', 'is_active', 'forms']
