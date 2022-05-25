from django.core.exceptions import PermissionDenied
from django.shortcuts import redirect
from .models import User

def user_is_verified(function):
    def wrap(request, *args, **kwargs):
        user = User.objects.get(pk=request.user.id)
        if user.is_verified:
            return function(request, *args, **kwargs)
        else:
            raise PermissionDenied
    wrap.__doc__ = function.__doc__
    wrap.__name__ = function.__name__
    return wrap

def user_is_staff_member(function):
    def wrap(request, *args, **kwargs):
        user = User.objects.get(pk=request.user.id)
        if user.is_staff:
            return function(request, *args, **kwargs)
        else:
            raise PermissionDenied
    wrap.__doc__ = function.__doc__
    wrap.__name__ = function.__name__
    return wrap

def user_has_upload_verification(function):
    def wrap(request, *args, **kwargs):
        user = User.objects.get(pk=request.user.id)
        if user.documents.all() or user.is_verified:
            return function(request, *args, **kwargs)
        else:
            return redirect('/verification/')
    wrap.__doc__ = function.__doc__
    wrap.__name__ = function.__name__
    return wrap