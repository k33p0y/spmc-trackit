# Generated by Django 3.0.7 on 2021-08-19 02:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('config', '0010_auto_20210813_1448'),
    ]

    operations = [
        migrations.AlterField(
            model_name='remark',
            name='remark',
            field=models.CharField(blank=True, max_length=100),
        ),
    ]