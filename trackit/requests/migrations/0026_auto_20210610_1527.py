# Generated by Django 3.0.7 on 2021-06-10 07:27

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('requests', '0025_auto_20210505_1351'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='ticket',
            options={'permissions': [('generate_reference', 'Can generate reference no')]},
        ),
    ]
