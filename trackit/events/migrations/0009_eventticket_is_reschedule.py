# Generated by Django 3.0.7 on 2022-11-09 07:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('events', '0008_auto_20221014_1503'),
    ]

    operations = [
        migrations.AddField(
            model_name='eventticket',
            name='is_reschedule',
            field=models.BooleanField(default=False),
        ),
    ]