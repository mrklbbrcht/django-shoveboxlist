from django.urls import include,path
from .views import BillOfMaterialsFormView,ShoveBoxListEdit

app_name='price'

urlpatterns = [
path('bom/<pk>', BillOfMaterialsFormView.as_view(), name='bom'),
path('sbledit/<pk>', ShoveBoxListEdit.as_view(), name= 'sbl_bom_edit'), 
# path("table/",BomTableListView.as_view(),name='table'),

]