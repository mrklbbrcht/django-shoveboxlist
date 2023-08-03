from django.views import generic
from .models import Package,Bom
from .forms import PackageBomForm, ShoveBoxBomForm

from shoveboxlist.widgets import DeleteCheckbox
from shoveboxlist.forms import ShoveboxInlineFormSet

from django.forms.models import  inlineformset_factory
from django.shortcuts import get_object_or_404
import json
from django.urls import reverse_lazy

from django.http import HttpResponseRedirect
import json

class BillOfMaterialsFormView(generic.edit.UpdateView):
    model = Package
    template_name = 'price/package_bom.html'
    fields = ( 'id',)   


    # Make a simple dropdown select box to pick a package ( = foreign key )
    # Get the available packages and push them to the context via render_to_response
    packages = Package.objects.all().order_by('id')
    packagelist = []

    for p in packages:
        packagelist.append((p.id,p.description))


    



    def get_context_data(self, **kwargs):
        context = super(BillOfMaterialsFormView, self).get_context_data(**kwargs)
        package = self.object
        queryset = Bom.objects.filter(package = package)

        PackageBomFormSet = inlineformset_factory(Package, Bom, form= PackageBomForm ,  formset=ShoveboxInlineFormSet,    extra=0, can_delete=True )
        
    
        if self.request.POST:
            context['formset'] = PackageBomFormSet(self.request.POST,  instance=package, queryset=queryset)

            formset = context['formset']

            if formset.is_valid():
                formset.save()


        else:


            context['formset'] = PackageBomFormSet( instance=package, queryset=queryset)

        # context['author'] = package



    # def __init__(self, *args, **kwargs):
    #     package_id = int(kwargs.pop('package_id',None))
    #     super(BillOfMaterialsFormView,self).__init__(*args, **kwargs)
    #     self.fields['package'].initial = package_id


    # bom_package_select = ChoiceField(choices=packagelist,  widget=Select(attrs={'onchange': 'form.submit();'}))





        return context

    def form_valid(self, form):
            context = self.get_context_data(form=form)
            formset = context['formset']
            if formset.is_valid():
                response = super().form_valid(form)
                formset.instance = self.object
                formset.save()
                return response
            else:
                return super().form_invalid(form) 




    def render_to_response(self, context, **response_kwargs):

        response_kwargs.setdefault("content_type", self.content_type)
        fs = context['formset']

        # pass the url to the detail edit form on to the context
        # a javascript in the template will pick this up and save it in a javascript value.
        context['detail_edit_url'] =  "/price/sbledit/"   

        # strip 2 last characters  -0 from first indexed form
        context['base_prefix'] =  fs.forms[0].prefix[:-2]




        # add also the available packages to the context to establish the select element
        context['packagelist'] = self.packagelist


        return self.response_class(
            request=self.request,
            template=self.get_template_names(),
            context=context,
            using=self.template_engine,
            **response_kwargs,
        )



class ShoveBoxListEdit(generic.edit.UpdateView):
    model = Bom
    form_class= ShoveBoxBomForm
    success_url = reverse_lazy("price:sbl_bom_edit",  kwargs={'pk': 2}) 


def home(request):
    """Renders the home page."""

    return HttpResponseRedirect('/price/bom/1')

