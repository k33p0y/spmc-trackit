from django.contrib.auth.decorators import login_required, permission_required
from django.contrib.contenttypes.models import ContentType
from django.shortcuts import render, get_object_or_404
from core.decorators import user_is_verified, user_is_staff_member
from django.db import transaction

from .models import Task, Team, OpenTask
from easyaudit.models import CRUDEvent
from requests.models import RequestFormStatus, Ticket, Notification

# Create your views here.
@login_required
@user_is_verified
def mytasks(request):
   status = RequestFormStatus.objects.filter(officer=request.user).order_by('status__name').distinct()
   return render(request, 'pages/tasks/task.html', {'task_types' : status})

# Create notification method
def create_task_notification(instance, sender):
   if sender == 'task': officers = instance.officers.all() if not instance.opentask_str else instance.task_type.officer.all()
   if sender == 'team': officers = instance.task.officers.all()
   if sender == 'opentask': officers = instance.task_type.officer.all()
   ctype = ContentType.objects.get(model=sender)
   log = CRUDEvent.objects.filter(object_id=instance.pk, content_type=ctype).latest('datetime')
   for officer in officers:
      if not log.user == officer:
         Notification(log=log, user=officer).save()

# Task method post
def create_task(ticket, formstatus_id, officers, request_user, remark):
   # get formstatus instance
   steps = RequestFormStatus.objects.select_related('form', 'status',).filter(form=ticket.request_form).order_by('order') # get all steps from ticket request form
   last_step = steps.latest('order')
   form_status = steps.get(pk=formstatus_id)

   # client step status
   if form_status.is_client_step:
      task = Task.objects.create(ticket_id=ticket.ticket_id, task_type=form_status)
      Team.objects.create(member_id=ticket.requested_by.pk, task_id=task.pk, remark=remark)
      create_task_notification(task, 'task')
   # department head step status 
   elif form_status.is_head_step: 
      task = Task.objects.create(ticket_id=ticket.ticket_id, task_type=form_status)
      Team.objects.create(member_id=ticket.department.department_head.pk, task_id=task.pk, remark=remark)
      create_task_notification(task, 'task')
    # if request param assign_by is not empty
   elif officers: 
      task = Task.objects.create(ticket_id=ticket.ticket_id, task_type=form_status)
      if type(officers) is list:
         for officer in officers:
            Team.objects.create(
               member_id=officer,
               task_id=task.pk,
               assignee=request_user,
               remark=remark
            )
      else: 
         Team.objects.create(member_id=officers, task_id=task.pk, remark=remark)
      create_task_notification(task, 'task')
   elif not last_step.order == form_status.order:
      otask = OpenTask.objects.create(ticket_id=ticket.ticket_id, task_type=form_status)
      create_task_notification(otask, 'opentask')

def create_task_for_all_requests(request):
   tickets = Ticket.objects.filter(is_active=True)
   for ticket in tickets:
      steps = RequestFormStatus.objects.select_related('form', 'status',).filter(form_id=ticket.request_form).order_by('order') # get all steps from ticket request form
      curr_step = steps.get(status_id=ticket.status) # get current step
      officers = curr_step.officer.all()[0].pk if len(curr_step.officer.all()) == 1 else []
      create_task(ticket, curr_step.pk, officers, request.user, '')
   return render(request, 'pages/tasks/create_task.html', {})
