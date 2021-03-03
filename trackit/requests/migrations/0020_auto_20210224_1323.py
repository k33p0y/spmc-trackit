# Generated by Django 3.0.7 on 2021-02-24 05:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('requests', '0019_requestformstatus_is_head_step'),
    ]

    operations = [
        migrations.AddField(
            model_name='requestform',
            name='prefix',
            field=models.CharField(default=1, max_length=5),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='ticket',
            name='reference_no',
            field=models.CharField(blank=True, max_length=15),
        ),
    ]