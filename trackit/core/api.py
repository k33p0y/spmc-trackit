from rest_framework import generics, viewsets, permissions
from rest_framework.response import Response
from django.contrib.auth.models import Group
from .serializers import UserSerializer, GroupSerializer
from .models import User

# Users Viewset API
class UserViewSet(viewsets.ModelViewSet):    
   serializer_class = UserSerializer
   queryset = User.objects.all()
   permission_classes = [permissions.IsAuthenticated]
    
class GroupViewSet(viewsets.ModelViewSet):
   serializer_class = GroupSerializer
   queryset = Group.objects.all()
   permission_classes = [permissions.IsAuthenticated]