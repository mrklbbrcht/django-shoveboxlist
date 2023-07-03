from queue import Empty
from sys import maxsize
from django.db import models


UNIT_CHOICES= [
    ( 1, 'Piece'),
    (2, 'm'),
    (3, 'm²'),
    (4, 'hours'),
    ]

TYPE_CHOICES= [
    ( 1, 'Lump sum'),
    ( 2, 'Fixed Quantity'),
    ( 3, 'Estimated Quantity'),
    ]


class Package(models.Model):
    description = models.CharField(max_length=120,verbose_name='Package description')    

class Bom(models.Model):
    class RecordType(models.TextChoices): 
        N = "N", "Normal items"
        T = "T", "Titel"
        C = "C",  'Comment'

    class UnitTypes(models.TextChoices): 
        LS = "LS", "Lump Sum"
        FQ = "FQ", "Fixed Quantity"
        EQ = "EQ",  'Estimated Quantity'

    ( 1, 'Piece'),
    (2, 'm'),
    (3, 'm²'),
    (4, 'hours'),

    class Units(models.IntegerChoices):
        PC = 1 , 'Piece'
        M = 2 , 'm'
        M2 = 3 ,'m²'
        HR = 4 , 'hour'

    class Recordtype(models.TextChoices): 
        N = "N", 'Normal items'
        T = 'T', 'Titel'
        C = "C",  'Comment'

    package = models.ForeignKey(Package,on_delete=models.CASCADE)
    level = models.IntegerField(default=0,blank=True, null=True)
    recordtype = models.CharField( max_length=1, choices=RecordType.choices, default= RecordType.N)
    reference = models.CharField(verbose_name='Reference',max_length=20,blank=True, null=True)  
    description = models.CharField(max_length=120,verbose_name='Price Item')
    unit_type =  models.CharField( max_length=2, verbose_name='Unit Type',choices=UnitTypes.choices, default= UnitTypes.FQ ) 
    unit =  models.IntegerField(choices=Units.choices, default= Units.PC) 
    quantity = models.DecimalField(verbose_name='Aantal',blank=False, null=False, max_digits=9, decimal_places=2)
    unit_price = models.DecimalField(verbose_name='Unit Price',blank=False, null=False, max_digits=9, decimal_places=2)
  

    def __str__(self):
        return self.description

    class Meta:
       ordering=["reference"]

    