# Generated by Django 3.0.7 on 2022-08-31 19:24

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('config', '0015_auto_20220831_0313'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='tour',
            name='is_explore_update',
        ),
    ]