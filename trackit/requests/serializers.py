from rest_framework import serializers

from .models import FormType

# Serializers
class FormTypeSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = FormType
        fields = '__all__'