from rest_framework import serializers

from .models import Department, Category, CategoryType
from core.models import User

# Serializers
class UserSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name']

class DepartmentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Department
        fields = ['id', 'name', 'is_active', 'department_head',]
        datatables_always_serialize = ('id',)
        
    def to_representation(self, instance):
        self.fields['department_head'] =  UserSerializer(read_only=True)
        return super(DepartmentSerializer, self).to_representation(instance)

class CategoryTypeSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = CategoryType
        fields = ['id', 'name', 'is_active',]
        datatables_always_serialize = ('id',)

class CategorySerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'is_active', 'category_type',]
        datatables_always_serialize = ('id',)


    def to_representation(self, instance):
        self.fields['category_type'] =  CategoryTypeSerializer(read_only=True)
        return super(CategorySerializer, self).to_representation(instance)

