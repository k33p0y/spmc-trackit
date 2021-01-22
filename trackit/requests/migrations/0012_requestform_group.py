# Generated by Django 3.0.7 on 2020-12-21 05:48

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('auth', '0011_update_proxy_permissions'),
        ('requests', '0011_notification'),
    ]

    operations = [
        migrations.AddField(
            model_name='requestform',
            name='group',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='auth.Group'),
        ),
    ]