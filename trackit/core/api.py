from rest_framework import generics, viewsets, permissions
from rest_framework.response import Response
from django.contrib.auth.models import Group
from .serializers import UserSerializer, GroupSerializer, UserUpdateSerializer
from .models import User

# Users Viewset API
class UserViewSet(viewsets.ModelViewSet):    
   serializer_class = UserSerializer
   queryset = User.objects.all()
   permission_classes = [permissions.IsAuthenticated]

   def get_queryset(self):
      # search_input = self.request.GET.get('search_input', None)
      # is_active = self.request.GET.get('is_active', None)

      last_name_input = self.request.GET.get("last_name_input", None)
      first_name_input = self.request.GET.get("first_name_input", None)
      username_input = self.request.GET.get("username_input", None)
      is_staff_select = self.request.GET.get("is_staff_select", None)


      if not self.request.user.has_perm('requests.view_requestform'):
         return User.objects.none()
      else:
         # return User.objects.all().order_by('id')
         qs = User.objects.all()
         # qs = qs.filter(is_archive=False)

         if last_name_input:
               qs = qs.filter(last_name__icontains=last_name_input)
         if first_name_input:
               qs = qs.filter(first_name__icontains=first_name_input)
         if username_input:
               qs = qs.filter(username__icontains=username_input)
         if is_staff_select:
            if is_staff_select == "1":
               qs = qs.filter(is_staff=True)
            else:
               qs = qs.filter(is_staff=False)

         return qs

class UserUpdateAPIView(generics.RetrieveUpdateAPIView):
   serializer_class = UserUpdateSerializer
   queryset = User.objects.all()
   permission_classes = [permissions.IsAuthenticated]
    
class GroupViewSet(viewsets.ModelViewSet):
   serializer_class = GroupSerializer
   queryset = Group.objects.all()
   permission_classes = [permissions.IsAuthenticated]

   def get_queryset(self):
      search_input = self.request.GET.get('search_input', None)
      qs = Group.objects.all()
      
      print(search_input)

      if search_input:
            qs = qs.filter(name__icontains=search_input)

      return qs