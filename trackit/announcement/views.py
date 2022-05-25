from django.contrib.auth.decorators import login_required, permission_required
from django.shortcuts import render, get_object_or_404
from .models import Article, Resources

from core.decorators import user_is_verified, user_is_staff_member

# Create your views here.
@login_required
@user_is_verified
@user_is_staff_member
@permission_required('announcement.view_article', raise_exception=True)
def announcement(request):
   return render(request, 'pages/announcement/article_list.html', {})

@login_required
@user_is_verified
@user_is_staff_member
@permission_required('announcement.add_article', raise_exception=True)
def create_article(request):
   return render(request, 'pages/announcement/article_new.html', {})

@login_required
@user_is_verified
@user_is_staff_member
@permission_required('announcement.view_article', raise_exception=True)
def view_article(request, pk):
   article = get_object_or_404(Article.objects.prefetch_related('resources'), pk=pk)
   return render(request, 'pages/announcement/article_view.html', {'article' : article})

@login_required
@user_is_verified
@user_is_staff_member
@permission_required('announcement.change_article', raise_exception=True)
def change_article(request, pk):
   article = get_object_or_404(Article, pk=pk)
   return render(request, 'pages/announcement/article_change.html', {'article' : article})