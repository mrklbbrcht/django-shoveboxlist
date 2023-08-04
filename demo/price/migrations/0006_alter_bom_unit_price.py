# Generated by Django 4.2.3 on 2023-08-02 16:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('price', '0005_alter_bom_quantity'),
    ]

    operations = [
        migrations.AlterField(
            model_name='bom',
            name='unit_price',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=9, verbose_name='Unit Price'),
        ),
    ]