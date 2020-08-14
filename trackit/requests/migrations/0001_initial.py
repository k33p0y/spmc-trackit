# Generated by Django 3.0.7 on 2020-08-14 07:48

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django_mysql.models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('config', '0003_auto_20200804_1044'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='FormType',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('form_fields', django_mysql.models.JSONField(default=dict)),
            ],
        ),
        migrations.CreateModel(
            name='Ticket',
            fields=[
                ('ticket_id', models.UUIDField(editable=False, primary_key=True, serialize=False)),
                ('form_data', django_mysql.models.JSONField(default=dict)),
                ('reference_no', models.PositiveIntegerField()),
                ('date_created', models.DateTimeField(auto_now_add=True)),
                ('date_modified', models.DateTimeField(auto_now=True)),
                ('department', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='config.Department')),
                ('formtype_id', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='form_type', to='requests.FormType')),
                ('requested_by', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='requestor', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
