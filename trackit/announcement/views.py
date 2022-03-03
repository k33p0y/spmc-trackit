from django.contrib.auth.decorators import login_required, permission_required
from django.shortcuts import render, get_object_or_404
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

@login_required
@permission_required('announcement.view_article', raise_exception=True)
def view_article(request, pk):
   article = get_object_or_404(Article.objects.prefetch_related('resources'), pk=pk)
   return render(request, 'pages/announcement/article_view.html', {'article' : article})

@login_required
@permission_required('announcement.change_article', raise_exception=True)
def change_article(request, pk):
   article = get_object_or_404(Article, pk=pk)
   return render(request, 'pages/announcement/article_change.html', {'article' : article})