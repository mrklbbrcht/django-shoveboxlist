from django.forms.renderers import  BaseRenderer


class TemplatesSetting(BaseRenderer):
    """
    Load templates using template.loader.get_template() which is configured
    based on settings.TEMPLATES.
    """
    # form_template_name = "django/forms/div.html"

    formset_template_name = "django/forms/formsets/div.html"

    form_template_name = "shoveboxlist/shovebox.html"



    def __init__(self, *args, **kwargs):
        # additional procesing before saving
        super().__init__(*args, **kwargs)









# https://smithdc1.github.io/my-blog/2022/forms/forms.html

# class ShoveBoxTemplates(DjangoTemplates):
    """
    Load Django templates from the built-in widget templates in
    django/forms/templates and from apps' 'templates' directory.




    # RemovedInDjango50Warning: When the deprecation ends, replace with
    # form_template_name = "django/forms/div.html"
    # formset_template_name = "django/forms/formsets/div.html"
    form_template_name = "django/forms/default.html"
    formset_template_name = "django/forms/formsets/default.html"


    """
    # pass

    # backend = DjangoTemplates