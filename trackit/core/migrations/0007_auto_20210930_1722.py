# Generated by Django 3.0.7 on 2021-09-30 09:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0006_auto_20210304_1454'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='contant_no',
            field=models.PositiveIntegerField(max_length=12, null=True),
        ),
        migrations.AddField(
            model_name='user',
            name='license_no',
            field=models.CharField(blank=True, max_length=25),
        ),
    ]