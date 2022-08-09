# Generated by Django 3.0.7 on 2022-08-08 05:50

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('config', '0014_auto_20220705_1354'),
        ('requests', '0030_requestformstatus_officer'),
    ]

    operations = [
        migrations.AlterField(
            model_name='requestformstatus',
            name='status',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='form_statuses', to='config.Status'),
        ),
    ]
