# Generated by Django 3.0.7 on 2021-02-04 01:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('requests', '0015_auto_20210127_1422'),
    ]

    operations = [
        migrations.AddField(
            model_name='requestformstatus',
            name='has_apporving',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='requestformstatus',
            name='has_pass_fail',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='requestformstatus',
            name='is_clent_step',
            field=models.BooleanField(default=False),
        ),
    ]
