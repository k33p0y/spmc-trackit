from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin
from django.apps import apps 

from .models import User

class CustomUserAdmin(UserAdmin):
   model = User

apps.get_model('auth.Group')._meta.app_label = 'core'
admin.site.register(User, CustomUserAdmin)
