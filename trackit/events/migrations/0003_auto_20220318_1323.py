# Generated by Django 3.0.7 on 2022-03-18 05:23

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('events', '0002_auto_20220317_1339'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='eventticket',
            name='event',
        ),
        migrations.AddField(
            model_name='eventticket',
            name='scheduled_event',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='participants', to='events.EventDate'),
            preserve_default=False,
        ),
    ]
