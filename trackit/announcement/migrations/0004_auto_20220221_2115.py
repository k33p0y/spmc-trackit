# Generated by Django 3.0.7 on 2022-02-21 13:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('announcement', '0003_auto_20220201_2122'),
    ]

    operations = [
        migrations.AlterField(
            model_name='article',
            name='content',
            field=models.TextField(blank=True),
        ),
        migrations.AlterField(
            model_name='article',
            name='preface',
            field=models.CharField(max_length=255),
        ),
    ]
