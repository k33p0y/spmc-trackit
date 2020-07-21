from rest_framework import serializers

from .models import Department, Category
from core.models import User

# Serializers
class HeadSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id']


class DepartmentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Department
        fields = ['id', 'name', 'is_active', 'department_head',]
        datatables_always_serialize = ('id',)

    # Override method
    def to_representation(self, instance):
        rep = super(DepartmentSerializer, self).to_representation(instance)
        if rep['department_head'] is not None:
            rep['department_head'] = instance.department_head.first_name + ' ' + instance.department_head.last_name
        return rep

class CategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = Category