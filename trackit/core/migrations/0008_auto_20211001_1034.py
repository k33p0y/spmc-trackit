# Generated by Django 3.0.7 on 2021-10-01 02:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0007_auto_20210930_1722'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='contant_no',
            field=models.PositiveIntegerField(null=True),
        ),
    ]
