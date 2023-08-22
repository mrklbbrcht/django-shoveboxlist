# Django-Shoveboxlist

## 1. pip install django-shoveboxlist

Note: Possibly you need to install django-calculation

## 2. Add "shoveboxlist" to your INSTALLED_APPS setting like this::

```
	INSTALLED_APPS = [
		...
		'shoveboxlist',
	]
```


## 3. Define your Model to be used 

An integer field to indicate the level and a character field that characterizes the tri-state button states are **mandatory**.

example

```
# Bill Of Materials Model
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

     
```

## 4. Defining your form:

Define a Form by subclassing ShoveBox. For styling and event response reasons, all fields of the form have to have its widgets specified by using a Shoveboxlist compatible widget

Tri-state selection button :
To define if a field will be visible for each of the three positions, a visibility attribute has to be added. This mask is 3 characters long and and contains either 1 for visible and  0 for invisible 
e.g.   'visibility':'100' means the field will be visible when position 1 is selected and invisible if position 2 or 3 are selected.

Adding the class sbfield ensures that the context menu is triggered

Adding the shrinkable class to indicate the field that will shrink when shoved

example:

```
from shoveboxlist.forms import ShoveBox
from shoveboxlist.widgets import  LevelSlider, Reference, TypeSwitch,Select, SbTextInput, SbNumberInput, SbSelect, SbFormulaInput, SbShrinkableTextInput

...

class PackageBomForm(ShoveBox):


    # Add calculated field (using django-calculation) if applicable        
    amount = CalcDecimalField( widget= SbFormulaInput ('quantity*unit_price') )
    amount.widget.attrs['visibility']='100'
    amount.widget.attrs['style']='width:10ch' 
    amount.widget.attrs['class']='sbformulafield'


    class Meta:
        model = Bom

        fields = ['level',	'recordtype','ref', 'article', 'description', 'unit_type','unit','quantity' ,'unit_price' ]

        widgets = {
         'level': LevelSlider(attrs={ 'class':'slider', 'oninput':'shove(this.parentNode,this)', 'min':0 , 'max':6 }) ,
         'recordtype' : TypeSwitch(choices= Bom.RecordType.choices),
         'ref': Reference(attrs={ 'class':'ref sbfield', 'size':'8','visibility':'110' , }),
         'description': SbShrinkableTextInput(attrs={ 'class':'shrinkable sbfield','visibility':'111',}),
         'article' : SbTextInput(attrs={ 'class':'sbfield','visibility':'100','size':'6',}),
         'unit_type': SbSelect(attrs={ 'visibility':'100','class':'sbselectfield'}),
         'unit':SbSelect(attrs={ 'class':'sbselectfield','visibility':'100',}),
         'quantity':SbNumberInput(     attrs={  'class':'sbnumberfield','visibility':'100','step': '1','style': 'width:10ch',}),
         'unit_price':SbNumberInput(     attrs={  'class':'sbnumberfield','visibility':'100','step': '1','style': 'width:10ch'}),
          }
```


## 5. Defining an Edit form:

Define an edit form that pops up when double clicking in the formset



       PackageBomFormSet = inlineformset_factory(Package, Bom, form= PackageBomForm ,  formset=ShoveboxInlineFormSet,    extra=0, can_delete=True )

## 6. Creating the update view

Create an generic update view the usual way.
Define a Formset with the help of the django inlineformset_factory and the shoveboxlist.forms.ShoveboxInlineFormSet:

e.g.
    PackageBomFormSet = inlineformset_factory(Package, Bom, form= PackageBomForm ,  formset=ShoveboxInlineFormSet,    extra=0, can_delete=True )


