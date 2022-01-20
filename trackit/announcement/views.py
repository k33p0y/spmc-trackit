from django.contrib.auth.decorators import login_required, permission_required
from django.shortcuts import render
from .models import Article, Resources


# Create your views here.
@login_required
@permission_required('announcement.view_article', raise_exception=True)
def announcement(request):
   return render(request, 'pages/announcement/article_list.html', {})

@login_required
@permission_required('announcement.add_article', raise_exception=True)
def create_article(request):
   return render(request, 'pages/announcement/article_new.html', {})