from django.contrib.auth.decorators import login_required, permission_required
from django.shortcuts import render, get_object_or_404
from core.decorators import user_is_verified, user_is_staff_member

# Create your views here.
@login_required
@user_is_verified
@user_is_staff_member
def mytasks(request):
   return render(request, 'pages/tasks/task.html', {})