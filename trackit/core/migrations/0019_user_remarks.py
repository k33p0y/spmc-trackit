# Generated by Django 3.0.7 on 2022-02-11 00:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0018_remove_user_created_at'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='remarks',
            field=models.CharField(blank=True, max_length=100),
        ),
    ]
