from rest_framework import serializers

from .models import RequestForm, Ticket

# Serializers
class RequestFormSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = RequestForm
        fields = '__all__'

class TicketSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Ticket
        fields = '__all__'