from rest_framework import serializers

from .models import RequestForm, Ticket
from config.models import Department
from core.models import User

from config.serializers import DepartmentSerializer, UserSerializer

# Serializers
class RequestFormSerializer(serializers.ModelSerializer):
    color = serializers.CharField(required=True, max_length=10)

    class Meta:
        model = RequestForm
        fields = '__all__'

class TicketSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Ticket
        fields = '__all__'
        datatables_always_serialize = ('ticket_id',)
        
    def to_representation(self, instance):
        self.fields['requested_by'] = UserSerializer(read_only=True)
        self.fields['department'] = DepartmentSerializer(read_only=True)
        self.fields['request_form'] = RequestFormSerializer(read_only=True)
        return super(TicketSerializer, self).to_representation(instance)