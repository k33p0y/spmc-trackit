from rest_framework import generics, viewsets, permissions
from rest_framework.response import Response

from .serializers import UserSerializer
from .models import User

# Users Viewset API
class UserViewSet(viewsets.ModelViewSet):    
   serializer_class = UserSerializer
   queryset = User.objects.all()
   permission_classes = [permissions.IsAuthenticated]
    