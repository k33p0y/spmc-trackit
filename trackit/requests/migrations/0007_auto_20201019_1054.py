# Generated by Django 3.0.7 on 2020-10-19 02:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('config', '0004_status'),
        ('requests', '0006_auto_20201016_1033'),
    ]

    operations = [
        migrations.AlterField(
            model_name='requestform',
            name='status',
            field=models.ManyToManyField(blank=True, related_name='forms', to='config.Status'),
        ),
    ]
