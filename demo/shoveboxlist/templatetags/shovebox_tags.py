from django import template

register = template.Library()

@register.filter
def strip_quotes(quoted_string):
    a = quoted_string.replace("'", '')
    return a