from rest_framework import serializers
from drf_writable_nested.serializers import WritableNestedModelSerializer

from .models import Department, Category
from core.models import User

# Serializers
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name']

class DepartmentSerializer(WritableNestedModelSerializer):
    # department_head = HeadSerializer(allow_null=True, required=False, many=False)

    class Meta:
        model = Department
        fields = ['id', 'name', 'is_active', 'department_head',]
        datatables_always_serialize = ('id',)
        
    def to_representation(self, instance):
        self.fields['department_head'] =  UserSerializer(read_only=True)
        return super(DepartmentSerializer, self).to_representation(instance)

class CategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = Category