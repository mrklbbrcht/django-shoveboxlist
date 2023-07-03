from django.forms import ModelForm,Form, HiddenInput
from django.forms.formsets import BaseFormSet
from django.forms.models import  inlineformset_factory, BaseInlineFormSet
from shoveboxlist.widgets import DeleteCheckbox



# https://docs.djangoproject.com/en/4.2/ref/forms/renderers/

class ShoveBox(ModelForm):
# class ShoveBox(Form):
    template_name_shoveboxlist = "shoveboxlist/shovebox.html"



    # name of reference field (if not empty) that automatically gets value  ( autoref)
    referencefield = ""
    levelfield = ""

    def as_table(self):
        return self.render(self.template_name_table)
    
    def as_shoveboxlist(self):
        vorm = self.render(self.template_name_shoveboxlist)
        pf = self.prefix
        return vorm




# https://docs.djangoproject.com/en/4.2/ref/forms/renderers/
class ShoveboxInlineFormSet(BaseInlineFormSet):
    # The inlineformset_factory used to instantiate this ShoveboxInlineFormSet
    # uses the can_order=True argument so an ordering field is added to the forms
    # by using the HiddenInput as ordering_widget this field is made invisible
    ordering_widget = HiddenInput
    def get_deletion_widget(self):
        return DeleteCheckbox()  
        # return DeleteCheckbox(attrs={"class": "deletion"})    


    # overwrite the empty_form operation of  BaseFormSet  since a shoveboxlist has a particulair
    # format compared to a normal form

    # https://docs.djangoproject.com/en/4.0/ref/forms/api/#django.forms.Form.default_renderer


    @property
    def empty_form(self):

        # self.renderer = ShoveBoxTemplates

        form = self.form(
            auto_id=self.auto_id,
            prefix=self.add_prefix("__prefix__"),
            empty_permitted=True,
            use_required_attribute=False,
            **self.get_form_kwargs(None),
            renderer=self.renderer,
        )
        self.add_fields(form, None)
        return form


    def __getitem__(self, index):
        """Return the form at the given index, based on the rendering order."""
        dummy = 0
        super().__getitem__(index)
    

    def __iter__(self):
            for sb in super(ShoveboxInlineFormSet,self).__iter__():
                yield sb  



