# Generated by Django 4.2.3 on 2023-07-31 18:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('price', '0002_alter_bom_reference'),
    ]

    operations = [
        migrations.AlterField(
            model_name='bom',
            name='level',
            field=models.IntegerField(default=0),
        ),
    ]
