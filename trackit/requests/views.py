from django.contrib.auth.decorators import login_required, permission_required
from django.contrib.contenttypes.models import ContentType
from django.http import Http404
from django.shortcuts import render, get_object_or_404
from django.db import transaction
from django.db.models import Q

from .models import Ticket, RequestForm, Attachment, RequestFormStatus, Notification
from config.models import Category, CategoryType, Department, Status, Remark
from core.models import User
from easyaudit.models import CRUDEvent
from events.models import Event, EventTicket
from tasks.models import OpenTask, Task, Team 

from core.decorators import user_is_verified

import datetime

# Create your views here.
@login_required
@user_is_verified
@permission_required('requests.view_ticket', raise_exception=True)
def ticket(request):
   tickets = Ticket.objects.all()

   # Filter dropdown querysets
   departments =  Department.objects.all().order_by('name')
   types = CategoryType.objects.all().order_by('name')
   statuses = Status.objects.all().order_by('name')
   forms = RequestForm.objects.all().order_by('name')
   users = User.objects.filter(is_staff=True).order_by('first_name')

   context = {'tickets': tickets, 'departments':departments, 'types':types, 'statuses': statuses, 'forms': forms, 'task_officers': users}
   return render(request, 'pages/requests/ticket_lists.html', context)
   
@login_required
@user_is_verified
@permission_required('requests.add_ticket', raise_exception=True)
def create_ticket(request):
   forms= RequestForm.objects.filter(is_active=True).order_by('name')
   types =  CategoryType.objects.filter(is_active=True).order_by('name')

   context = {'forms': forms, 'types': types}
   return render(request, 'pages/requests/ticket_new.html', context)

@login_required
@user_is_verified
@permission_required('requests.change_ticket', raise_exception=True)
def detail_ticket(request, ticket_id):
   ticket = get_object_or_404(Ticket, ticket_id=ticket_id)
   ticket_categories = ticket.category.all()
   steps = RequestFormStatus.objects.select_related('form', 'status').filter(form_id=ticket.request_form).order_by('order') 

   ## tasks
   task = ticket.tasks.filter(task_type__status=ticket.status).last()
   ticket_officers = task.officers.all() if task else None

   if steps.latest('order').status.id != ticket.status.id or request.user.is_superuser:
      forms = RequestForm.objects.prefetch_related('status', 'group', 'category_types').filter(is_active=True).order_by('name')
      categories = Category.objects.filter(category_type=ticket_categories[0].category_type, is_active=True).order_by('name')
      types = ticket.request_form.category_types.filter(is_active=True).order_by('name')
      attachments = Attachment.objects.filter(ticket_id=ticket_id).order_by('-uploaded_at')

      remark = None

      for step in steps:
         if(step.status == ticket.status):
            curr_step = steps.get(status_id=ticket.status)

         remarks = ticket.remarks.filter(ticket_id=ticket_id, status_id=step.status_id, is_approve=True) 
         if step.is_head_step and step.has_approving: 
            remark = remarks.earliest('id') if remarks else None
      context = {
         'ticket': ticket, 
         'forms': forms, 
         'types': types, 
         'categories':categories, 
         'ticket_categories': ticket_categories, 
         'attachments':attachments, 
         'steps':steps, 
         'ticket_officers': ticket_officers,
         'curr_step':curr_step, 
         'last_step':steps.latest('order'),
         'remark' : remark
      }
      return render(request, 'pages/requests/ticket_detail.html', context)
   else:
      raise Http404()  

@login_required
@user_is_verified
@permission_required('requests.view_ticket', raise_exception=True)
def view_ticket(request, ticket_id):
   ticket = get_object_or_404(Ticket, ticket_id=ticket_id)
   categories = ticket.category.all()
   attachments = Attachment.objects.filter(ticket_id=ticket_id).order_by('-uploaded_at')

   ### events
   events = Event.objects.filter(event_for=ticket.request_form, is_active=True) # events
   event_tickets = EventTicket.objects.select_related('scheduled_event').filter(ticket=ticket).order_by('-scheduled_event__date', '-id')   # events ticket
   is_schedule_open = None
   event_schedule = None
   if event_tickets: event_schedule = event_tickets.filter(attended__isnull=True).first()
   if event_schedule: is_schedule_open = True if str(datetime.datetime.now().replace(microsecond=0)) >= event_schedule.scheduled_event.date_start() else False

   ### form status
   steps = RequestFormStatus.objects.select_related('form', 'status',).filter(form_id=ticket.request_form).order_by('order') # get all steps from ticket request form
   last_step = steps.latest('order') # get last step
   first_step = steps.first() # get first step
   curr_step = steps.get(status_id=ticket.status) # get current step
   next_step = steps.get(order=curr_step.order+1) if not curr_step.status == last_step.status else curr_step # next current step
   prev_step = steps.get(order=curr_step.order-1) if not curr_step.status == first_step.status else curr_step # prev current step
   has_event_form = True if steps.filter(has_event=True) else False  # check if statuses has event
   officers = next_step.officer.all() # get officer in current status.
   
   ### tasks
   ### get task officers of current step
   task = ticket.tasks.filter(task_type__status=ticket.status).last()
   ticket_officers = task.officers.all() if task else None
   
   ### iterate steps/status
   for step in steps:
      # get remark if has approving and is head step 
      remarks = ticket.remarks.filter(ticket_id=ticket_id, status_id=step.status_id, is_approve=True) 
      if step.is_head_step and step.has_approving:
         remark = remarks.earliest('id') if remarks else None

   remark = None
   progress = round((curr_step.order / len(steps)) * 100) # get progress value

   context = {
      'ticket': ticket, 
      'categories' : categories,
      'attachments':attachments, 
      'events' : events,
      'steps':steps, 
      'prev_step':prev_step,
      'curr_step':curr_step, 
      'next_step':next_step,
      'last_step':last_step, 
      'officers':officers,
      'task' : task,
      'ticket_officers': ticket_officers,
      'remark': remark,
      'progress' : progress,
      'event_tickets' : event_tickets.filter(attended__isnull=False),
      'scheduled_event' : event_tickets.filter(attended__isnull=True).first(),
      'has_event_form' : has_event_form,
      'is_schedule_open' : is_schedule_open,
   }
   return render(request, 'pages/requests/ticket_view.html', context)
      
def ticket_log_list(request):
   return render(request, 'pages/requests/track.html', {})

# Create notification method
def create_notification(object_id, ticket, sender):
   log = CRUDEvent.objects.filter(object_id=object_id, event_type__in=list([1, 2, 3])).latest('datetime')
   form_groups = ticket.request_form.group.all()
   requestor = ticket.requested_by
   date_created = ticket.date_created.replace(microsecond=0)
   date_modified = ticket.date_modified.replace(microsecond=0)
   form_status = ticket.request_form.request_forms.get(status=ticket.status)
   task = ticket.tasks.filter(task_type__status=ticket.status).last()
   ticket_officers = task.officers.all()
   
   if not form_status.is_client_step and not form_status.is_head_step:
      if not form_status.officer.all():
         for group in form_groups:
            categories = Category.objects.filter(groups=group)
            if categories:
               for category in categories:
                  if ticket.category.filter(id=category.id):
                     # create notifications for users in selected group
                     users = group.user_set.all()
                     for user in users:
                        if not log.user == user and not user == requestor:
                           Notification(log=log, user=user).save()
                  else:
                     continue
            else:
               # create notifications for users in selected group
               users = group.user_set.all()
               for user in users:
                  if not log.user == user and not user == requestor:
                     Notification(log=log, user=user).save()
      else:
         officers = ticket_officers if ticket_officers else form_status.officer.all()
         for officer in officers:
            if not log.user == officer:
               Notification(log=log, user=officer).save()

   # # create notification for department head
   # if date_modified == date_created and sender == 'ticket':
   #    if ticket.department.department_head:
   #       if not log.user == ticket.department.department_head:
   #          Notification(log=log, user=ticket.department.department_head).save()
   if not log.user == requestor:
      Notification(log=log, user=requestor).save()

# Create notification method
def create_task_notification(instance, sender):
   if sender == 'task': officers = instance.officers.all()
   if sender == 'opentask': officers = instance.task_type.officer.all()
   ctype = ContentType.objects.get(model=sender)
   log = CRUDEvent.objects.filter(object_id=instance.pk, content_type=ctype, event_type=CRUDEvent.CREATE).latest('datetime')
   for officer in officers:
      Notification(log=log, user=officer).save()

# Remark Method
def create_remark(object_id, ticket):
   log = CRUDEvent.objects.filter(object_id=object_id).latest('datetime')
   remark, created = Remark.objects.get_or_create(ticket=ticket, status=ticket.status, action_officer=ticket.requested_by, log=log)

# Generate reference no
def generate_reference(form):
   year = datetime.datetime.now().year
   ticket = Ticket.objects.filter(request_form=form).exclude(reference_no__exact='').order_by('-reference_no').first()
   
   if ticket:
      ref_no = ticket.reference_no.split('-')
      # check if instance reference no is in the same year.
      num_series = int(ref_no[2])+1 if int(ref_no[1]) == year else "00001"
      reference_no = (str(ticket.request_form.prefix)+"-"+str(year)+"-"+str(num_series).zfill(5))
   else:
      form = RequestForm.objects.get(id=form)
      num_series = "00001"
      reference_no = (str(form.prefix)+"-"+str(year)+"-"+num_series.zfill(5))

   return reference_no

# Task method post
@transaction.atomic
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
      task = OpenTask.objects.create(ticket_id=ticket.ticket_id, task_type=form_status)
      create_task_notification(task, 'opentask')

def create_task_for_all_requests(request):
   tickets = Ticket.objects.filter(is_active=True)
   for ticket in tickets:
      steps = RequestFormStatus.objects.select_related('form', 'status',).filter(form_id=ticket.request_form).order_by('order') # get all steps from ticket request form
      curr_step = steps.get(status_id=ticket.status) # get current step
      
      remark = ''
      officers = curr_step.officer.all()[0].pk if len(curr_step.officer.all()) == 1 else []

      create_task(ticket, curr_step.pk, officers, request.user, remark)
      
   return render(request, 'pages/tasks/create_task.html', {})
