# Generated by Django 3.0.7 on 2022-05-12 06:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('events', '0005_eventdate_is_active'),
    ]

    operations = [
        migrations.AlterField(
            model_name='eventticket',
            name='attended',
            field=models.BooleanField(null=True),
        ),
    ]
