# Generated by Django 3.0.7 on 2021-02-22 13:26

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('config', '0006_auto_20210218_1509'),
    ]

    operations = [
        migrations.RenameField(
            model_name='remark',
            old_name='user',
            new_name='action_officer',
        ),
    ]
