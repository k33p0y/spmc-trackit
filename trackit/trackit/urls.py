from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include

from core import views

urlpatterns = [
   path('admin/', admin.site.urls),
   path('accounts/', include('django.contrib.auth.urls')),
   path('api-auth/', include('rest_framework.urls')),
   
   path('', include('core.urls')),
   path('', include('config.urls')),
   path('', include('requests.urls')),

   path('403', views.forbidden, name='forbidden'),
   path('404', views.page_not_found, name='page_not_found'),
   path('500', views.unexpected_error, name='unexpected_error')

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
   