from rest_framework import serializers

from .models import Department, Category

# Serializer
class DepartmentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Department

class CategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = Category