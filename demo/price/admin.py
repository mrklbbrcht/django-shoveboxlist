from django.contrib import admin
from .models import Bom, Package


class PackageAdmin(admin.ModelAdmin):
    pass
admin.site.register(Package, PackageAdmin)



class BomAdmin(admin.ModelAdmin):
    pass
admin.site.register(Bom, BomAdmin)


