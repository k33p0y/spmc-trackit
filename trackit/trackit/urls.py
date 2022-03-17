from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include
from django.views.generic import TemplateView

from core import views

urlpatterns = [
   path('admin/', admin.site.urls),
   path('accounts/', include('django.contrib.auth.urls')),
   path('api-auth/', include('rest_framework.urls')),

   path('', include('core.urls')),
   path('', include('config.urls')),
   path('', include('requests.urls')),
   path('', include('announcement.urls')),
   path('', include('events.urls')),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
  
handler403 = 'core.views.forbidden'
handler404 = 'core.views.page_not_found'
handler500 = 'core.views.unexpected_error'