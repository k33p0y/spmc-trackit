from rest_framework import serializers

from .models import Department, Category

# Serializer
class DepartmentSerializer(serializers.ModelSerializer):
    department_head = serializers.StringRelatedField()

    class Meta:
        model = Department
        fields = '__all__'

class CategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = Category