from django.shortcuts import render
from .models import Article, Resources

# Create your views here.
def announcement(request):
   articles = Article.objects.all()
   context = {'articles': articles}
   return render(request, 'pages/announcement/article_list.html', context)