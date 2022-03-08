from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required, permission_required
from django.contrib.auth.models import Permission, Group
from django.contrib.contenttypes.models import ContentType
from django.db.models import Q
from django.http import Http404, HttpResponse
from django.template.response import SimpleTemplateResponse
from core.models import User
from core.decorators import user_is_verified, user_has_upload_verification
from config.models import Department
from announcement.models import Article
from requests.models import Ticket, RequestForm, Notification
from easyaudit.models import CRUDEvent

import datetime

def register(request):
   if request.user.is_anonymous:
      departments = Department.objects.filter(is_active=True).order_by('name')
      return render(request, 'registration/register.html', {'departments': departments})
   raise Http404()

@login_required
def verification(request):
   user = User.objects.prefetch_related('documents').get(pk=request.user.pk)
   if not user.documents.all() and not user.is_verified or user.is_superuser:
      return render(request, 'registration/verify.html', {'user' : user})
   else: 
      raise Http404()
   
@login_required
@user_has_upload_verification 
def home(request):
   now = datetime.datetime.now()
   users = User.objects.filter(date_joined__lte=now, is_active=True, is_superuser=False).order_by('-date_joined')[:8]
   tickets = Ticket.objects.filter(date_created__lte=now, is_active=True).order_by('-date_created')[:6]
   announcement = Article.objects.filter(is_active=True).order_by('-date_publish')

   context =  {"users": users, "tickets":tickets, "announcement":announcement}
   return render(request, 'pages/index.html', context)

@login_required
@user_is_verified
@permission_required('core.view_group', raise_exception=True)
def group_list(request):
   permissions = Permission.objects.all()
   return render(request, 'pages/core/group_list.html', {'permissions': permissions})

@login_required
@user_is_verified
@permission_required('core.view_user', raise_exception=True)
def user_list(request):
   permissions = Permission.objects.all()
   groups = Group.objects.all().order_by('name')
   departments = Department.objects.all().order_by('name')

   select_departments = departments.filter(is_active=True)

   context = {
      'permissions': permissions,
      'groups': groups,
      'departments' : departments,
      'select_departments' : select_departments
   }
   return render(request, 'pages/core/user_list.html', context)

@login_required
@user_has_upload_verification
def user_profile(request, pk):
   if request.user.id == pk:
      user = User.objects.prefetch_related('documents').get(id=pk)
      tickets = Ticket.objects.filter(requested_by=user.id, is_active=True)[:5]
      departments = Department.objects.filter(is_active=True).order_by('name')
      
      context = {'user': user, 'tickets': tickets, 'departments': departments}
      return render(request, 'pages/core/user_profile.html', context)
   else:
      raise Http404()

# Create user notification method
def create_users_notification(object_id, user_instance, sender):
   events = list([CRUDEvent.CREATE, CRUDEvent.UPDATE, CRUDEvent.DELETE])
   log = CRUDEvent.objects.filter(object_id=object_id, event_type__in=events).latest('datetime')
   ctype = ContentType.objects.get(model='user')
   perms = Permission.objects.filter(content_type=ctype).values_list('id')
   users_with_perms = User.objects.filter(Q(groups__permissions__in=perms) | Q(user_permissions__in=perms)).distinct()

   if sender == 'client':
      # create notifications for users with permission
      for user in users_with_perms:
         if not log.user == user and not user == user_instance:
            Notification(log=log, user=user).save()

   if sender == 'staff':
      # create notifications for user client     
      if log.user and not log.user == user_instance:
         Notification(log=log, user=user_instance).save()


# Error Template 403, 404 & 500
def forbidden(request, exception=None):
   return SimpleTemplateResponse('pages/403.html', status=403)

def page_not_found(request, exception=None):
   return SimpleTemplateResponse('pages/404.html', status=404)

def unexpected_error(request, exception=None):
  return SimpleTemplateResponse('pages/500.html', status=500)