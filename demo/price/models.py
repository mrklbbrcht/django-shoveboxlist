from queue import Empty
from sys import maxsize
from django.db import models
from django.urls import reverse

class Package(models.Model):
    description = models.CharField(max_length=120,verbose_name='Package description')    

    def __str__(self):
        return self.description
    
    def get_absolute_url(self) :
        return reverse('price:bom',kwargs={'pk':self.pk})


class Bom(models.Model):
    class RecordType(models.TextChoices): 
        N = 'N', 'Normal items'
        T = 'T', 'Title'
        C = 'C',  'Comment'

    class UnitTypes(models.TextChoices): 
        LS = "LS", "Lump Sum"
        FQ = "FQ", "Fixed Quantity"
        EQ = "EQ",  'Estimated Quantity'

    class Units(models.IntegerChoices):
        PC = 1 , 'Piece'
        M = 2 , 'm'
        M2 = 3 ,'m²'
        HR = 4 , 'hour'

    package = models.ForeignKey(Package,on_delete=models.CASCADE)
    level = models.IntegerField(default=0)
    recordtype = models.CharField( max_length=1, choices=RecordType.choices, default= RecordType.N)
    ref = models.CharField(verbose_name='Reference',max_length=20,blank=True,default='')  
    article = models.CharField(verbose_name='Article',max_length=20,blank=True, default="")  
    description = models.CharField(max_length=120,verbose_name='Price Item',blank=True,default="")
    unit_type =  models.CharField( max_length=2, verbose_name='Unit Type',choices=UnitTypes.choices, default= UnitTypes.FQ ) 
    unit =  models.IntegerField(choices=Units.choices, default= Units.PC) 
    quantity = models.DecimalField(verbose_name='Aantal',default=0, max_digits=9, decimal_places=2)
    unit_price = models.DecimalField(verbose_name='Unit Price',default=0, max_digits=9, decimal_places=2)

    def __str__(self):
        return self.description + " "+ str(self.quantity) +" "+self.unit_type+" "+str(self.unit_price)

    class Meta:
       ordering=["ref"]

    