from django.forms import  ModelForm,DecimalField
from django.forms.widgets import Textarea
from price.models import Bom
from shoveboxlist.forms import ShoveBox
from shoveboxlist.widgets import  LevelSlider, Reference, TypeSwitch,Select, SbTextInput, SbNumberInput, SbSelect, SbFormulaInput, SbShrinkableTextInput


# overwrite the Decimalfield to be used for calculated fields only
class CalcDecimalField(DecimalField):
# No need to raise an validation error since it is a calculated field, not persisted to the database
    def validate(self, value):
        if value in self.empty_values and self.required:
            pass




class PackageBomForm(ShoveBox):


    # Add calculated field (using django-calculation)         
    amount = CalcDecimalField( widget= SbFormulaInput ('quantity*unit_price') )
    amount.widget.attrs['visibility']='100'
    amount.widget.attrs['style']='width:10ch' 
    amount.widget.attrs['class']='sbformulafield'


    class Meta:
        model = Bom

        fields = ['level',	'recordtype','ref', 'article', 'description', 'unit_type','unit','quantity' ,'unit_price' ]
        # fields = ['level',	'recordtype','ref', 'article', 'description', 'unit_type','unit','quantity' ,'unit_price']

        # For all fields a Shoveboxlist compatible widget has to be specified (for styling and event response reasons )
        # Adding the visibility mask determines for which recordtype the field is visible ( 1 = visible, 0 = invisible )
        # Adding the class sbfield ensures that the context menu is triggered
        # Adding the shrinkable class determines which field will shrink when shoving

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
        

class BomEditForm(ModelForm):
    class Meta:       
        model = Bom
        fields = ['ref','recordtype', 'article','description', 'unit_type','unit','quantity' ,'unit_price','package']


        widgets = {

         'description' : Textarea(     attrs={  'style': 'color:red'}),
       }