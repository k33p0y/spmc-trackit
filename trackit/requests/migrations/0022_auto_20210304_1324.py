# Generated by Django 3.0.7 on 2021-03-04 05:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('config', '0007_auto_20210222_2126'),
        ('requests', '0021_auto_20210303_2307'),
    ]

    operations = [
        migrations.AddField(
            model_name='requestform',
            name='category_types',
            field=models.ManyToManyField(blank=True, related_name='form_types', to='config.CategoryType'),
        ),
        migrations.AddField(
            model_name='requestform',
            name='guide',
            field=models.CharField(blank=True, max_length=255),
        ),
    ]
