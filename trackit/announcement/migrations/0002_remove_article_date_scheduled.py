# Generated by Django 3.0.7 on 2022-01-20 09:52

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('announcement', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='article',
            name='date_scheduled',
        ),
    ]