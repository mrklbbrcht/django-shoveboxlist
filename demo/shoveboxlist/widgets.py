from  django.forms.widgets import NumberInput, TextInput,  ChoiceWidget, CheckboxInput, Select

class TypeSwitch(ChoiceWidget):
  #  input_type = "radio"
    input_type = "typebuttons"
    template_name = "shoveboxlist/widgets/typeswitch.html"
    # option_template_name = "shoveboxlist/widgets/typeswitch_option.html"
    use_fieldset = True

    # when getting the context, you'll get optgroups of which 1 option 'll have a selected attribute of True   
    # watch for context['widget']['optgroups']
    def render(self, name, value, attrs=None, renderer=None):
        """Render the widget as an HTML string."""
        context = self.get_context(name, value, attrs)
        return self._render(self.template_name, context, renderer)

    def subwidgets(self, name, value, attrs=None):
        """
        Yield all "subwidgets" of this widget. Used to enable iterating
        options from a BoundField for choice widgets.
        """
        value = self.format_value(value)
        yield from self.options(name, value, attrs)

    def id_for_label(self, id_, index=None):
            """
            Don't include for="field_0" in <label> to improve accessibility when
            using a screen reader, in addition clicking such a label would toggle
            the first input.
            """
            if index is None:
                return ""
            return super().id_for_label(id_, index)

class LevelSlider(NumberInput):
    input_type = "range"
    template_name = "shoveboxlist/widgets/levelslider.html"

class Reference(TextInput):
    input_type = "text"
    template_name = "shoveboxlist/widgets/sbref.html"

class SbTextInput(TextInput):
    input_type = "text"
    template_name = "shoveboxlist/widgets/sbtextinput.html"



class DeleteCheckbox(CheckboxInput):
    template_name = "shoveboxlist/widgets/deletecheckbox.html"



