# Generated by Django 3.0.7 on 2020-08-04 02:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('config', '0002_auto_20200724_2202'),
    ]

    operations = [
        migrations.AddField(
            model_name='category',
            name='is_archive',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='categorytype',
            name='is_archive',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='department',
            name='is_archive',
            field=models.BooleanField(default=False),
        ),
    ]
