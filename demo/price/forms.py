from django.forms import  RadioSelect,ModelForm,DecimalField, ChoiceField
from django.forms.widgets import NumberInput
from price.models import Bom,Package
from shoveboxlist.forms import ShoveBox
from shoveboxlist.widgets import  LevelSlider, Reference, TypeSwitch,Select, SbTextInput, SbNumberInput, SbSelect, SbFormulaInput

from calculation import FormulaInput

from django.core.exceptions import ValidationError


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


    # def clean_amount(self):
    #     amount = self.cleaned_data['amount']
    #     return amount
    
#  attrs={  'class':'sbnumberfield','visibility':'100','step': '1','style': 'width:10ch'}

    class Meta:
        model = Bom

        fields = ['level',	'recordtype','ref', 'article', 'description', 'unit_type','unit','quantity' ,'unit_price' ]
        # fields = ['level',	'recordtype','ref', 'article', 'description', 'unit_type','unit','quantity' ,'unit_price']

        # For all fields a Shoveboxlist compatible widget has to be specified
        # Adding the visibility mask determines for which recordtype the field is visible ( 1 = visible, 0 = invisible )
        # Adding the class sbfield ensures that the context menu is triggered
        # Adding the shrinkable class determines which field will shrink when shoving




        widgets = {
         'level': LevelSlider(attrs={ 'class':'slider', 'oninput':'shove(this.parentNode,this)', 'min':0 , 'max':6 }) ,
         'recordtype' : TypeSwitch(choices= Bom.RecordType.choices),

         'ref': Reference(attrs={ 'class':'ref sbfield', 'size':'5','visibility':'110' , }),
         'description': SbTextInput(attrs={ 'class':'shrinkable sbfield','visibility':'111',}),

         'article' : SbTextInput(attrs={ 'class':'sbfield','visibility':'100','size':'6',}),
         'unit_type': SbSelect(attrs={ 'visibility':'100','class':'sbselectfield'}),
         'unit':SbSelect(attrs={ 'class':'sbselectfield','visibility':'100',}),

         'quantity':SbNumberInput(     attrs={  'class':'sbnumberfield','visibility':'100','step': '1','style': 'width:10ch',}),
         'unit_price':SbNumberInput(     attrs={  'class':'sbnumberfield','visibility':'100','step': '1','style': 'width:10ch'}),

          }
        
 
    def __init__(self, *args, **kwargs):
            super(PackageBomForm, self).__init__(*args, **kwargs)

            for field in self.fields.values():
                field.error_messages = {'required':'The field {fieldname} is required'.format(
                    fieldname=field.label)}


class ShoveBoxBomForm(ModelForm):
    class Meta:       
        model = Bom
        fields = ['ref','recordtype', 'article','description', 'unit_type','unit','quantity' ,'unit_price']


