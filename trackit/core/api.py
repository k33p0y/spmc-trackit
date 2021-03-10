from rest_framework import generics, viewsets, permissions
from rest_framework.response import Response
from django.contrib.auth.models import Group
from django.db.models import Q
from .serializers import UserSerializer, GroupSerializer, UserUpdateSerializer, UserProfileSerializer, ChangePasswordSerializer
from .models import User

import datetime

# Users Viewset API
class UserViewSet(viewsets.ModelViewSet):    
   serializer_class = UserSerializer
   queryset = User.objects.all()
   permission_classes = [permissions.IsAuthenticated]

   def get_queryset(self):
      # Search & Filter Parameters
      search = self.request.query_params.get("search", None)
      is_staff = self.request.query_params.get("is_staff", None)
      is_superuser = self.request.query_params.get("is_superuser", None)
      is_active = self.request.query_params.get("is_active", None)
      department = self.request.query_params.get("department", None)
      group = self.request.query_params.get("group", None)
      date_from = self.request.query_params.get('date_from', None)
      date_to = self.request.query_params.get('date_to', None)

      if not self.request.user.has_perm('core.view_user'):
         return User.objects.none()
      else:
         # Queryset
         qs = User.objects.all().order_by('-id')

         # Parameters
         if search: qs = qs.filter(Q(last_name__icontains=search) | Q(first_name__icontains=search) | Q(username__icontains=search))
         if is_staff: qs = qs.filter(is_staff=True) if is_staff =='0' else qs.filter(is_staff=False)
         if is_superuser: qs = qs.filter(is_superuser=True) if is_superuser == '0' else qs.filter(is_superuser=False)
         if is_active: qs = qs.filter(is_active=True) if is_active == '0' else qs.filter(is_active=False)
         if department: qs = qs.filter(department=department)
         if group: qs = qs.filter(groups__in=group)
         if date_from: qs = qs.filter(date_joined__gte=date_from)
         if date_to: qs = qs.filter(date_joined__lte=datetime.datetime.strptime(date_to + "23:59:59", '%Y-%m-%d%H:%M:%S'))

         return qs

class UserUpdateAPIView(generics.RetrieveUpdateAPIView):
   serializer_class = UserUpdateSerializer
   queryset = User.objects.all()
   permission_classes = [permissions.IsAuthenticated]

class UserProfileViewSet(viewsets.ModelViewSet):
   serializer_class = UserProfileSerializer
   queryset = User.objects.all()
   permission_classes = [permissions.IsAuthenticated]

class ChangePasswordAPIView(generics.RetrieveUpdateAPIView):
   serializer_class = ChangePasswordSerializer
   queryset = User.objects.all()
   permission_classes = [permissions.IsAuthenticated]
    
class GroupViewSet(viewsets.ModelViewSet):
   serializer_class = GroupSerializer
   queryset = Group.objects.all()
   permission_classes = [permissions.IsAuthenticated]

   def get_queryset(self):
      # Search Parameter
      search = self.request.query_params.get("search", None)
      
      qs = Group.objects.all()
      if search: qs = qs.filter(name__icontains=search)
      return qs