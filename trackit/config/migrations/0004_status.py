# Generated by Django 3.0.7 on 2020-10-16 01:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('config', '0003_auto_20200804_1044'),
    ]

    operations = [
        migrations.CreateModel(
            name='Status',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('date_created', models.DateTimeField(auto_now_add=True)),
                ('date_modified', models.DateTimeField(auto_now=True)),
                ('is_active', models.BooleanField(default=True)),
                ('is_archive', models.BooleanField(default=False)),
            ],
        ),
    ]