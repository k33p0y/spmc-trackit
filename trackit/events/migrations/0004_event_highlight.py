# Generated by Django 3.0.7 on 2022-03-23 01:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('events', '0003_auto_20220318_1323'),
    ]

    operations = [
        migrations.AddField(
            model_name='event',
            name='highlight',
            field=models.CharField(blank=True, max_length=50),
        ),
    ]
