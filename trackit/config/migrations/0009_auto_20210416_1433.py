# Generated by Django 3.0.7 on 2021-04-16 06:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('config', '0008_auto_20210305_1415'),
    ]

    operations = [
        migrations.AlterField(
            model_name='remark',
            name='remark',
            field=models.CharField(max_length=100),
        ),
    ]
