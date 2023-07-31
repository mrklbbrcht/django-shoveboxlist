from django.forms import  RadioSelect,ModelForm
from price.models import Bom
from shoveboxlist.forms import ShoveBox
from shoveboxlist.widgets import  LevelSlider, Reference, TypeSwitch, TextInput, SbTextInput,Select


class PackageBomForm(ShoveBox):
    class Meta:
        model = Bom

        fields = ['level',	'recordtype','ref', 'article', 'description', 'unit_type','unit','quantity' ,'unit_price' ]

        # For all fields a Shoveboxlist compatible widget has to be specified
        # Adding the visibility mask determines for which recordtype the field is visible ( 1 = visible, 0 = invisible )
        # Adding the class sbfield ensures that the context menu is triggered
        # Adding the shrinkable class determines which field will shrink when shoving


        widgets = {
         'level': LevelSlider(attrs={ 'class':'slider', 'oninput':'shove(this.parentNode,this)', 'min':0 , 'max':6 }) ,
         'recordtype' : TypeSwitch(choices= Bom.Recordtype.choices),
         'ref': Reference(attrs={ 'class':'ref sbfield', 'size':'5','visibility':'110' , }),
         'description': SbTextInput(attrs={ 'class':'shrinkable sbfield','visibility':'111',}),

         'article' : SbTextInput(attrs={ 'class':'sbfield','visibility':'100',}),
         'unit_type': SbTextInput(attrs={ 'class':'sbfield','visibility':'100',}),
         'unit':SbTextInput(attrs={ 'class':'sbfield','visibility':'100',}),
         'quantity': SbTextInput(attrs={ 'class':'sbfield','visibility':'100',}),
         'unit_price': SbTextInput(attrs={ 'class':'sbfield','visibility':'100',}),

           }
        
 
class ShoveBoxBomForm(ModelForm):
    class Meta:       
        model = Bom
        fields = ['ref','recordtype', 'article','description', 'unit_type','unit','quantity' ,'unit_price']


