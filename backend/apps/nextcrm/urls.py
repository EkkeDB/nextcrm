# apps/nextcrm/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create router and register viewsets
router = DefaultRouter()

# Main entities
router.register(r'contracts', views.ContractViewSet, basename='contract')
router.register(r'counterparties', views.CounterpartyViewSet, basename='counterparty')
router.register(r'traders', views.TraderViewSet, basename='trader')

# Commodities
router.register(r'commodities', views.CommodityViewSet, basename='commodity')
router.register(r'commodity-groups', views.CommodityGroupViewSet, basename='commodity-group')
router.register(r'commodity-types', views.CommodityTypeViewSet, basename='commodity-type')
router.register(r'commodity-subtypes', views.CommoditySubtypeViewSet, basename='commodity-subtype')

# Reference data
router.register(r'cost-centers', views.CostCenterViewSet, basename='cost-center')
router.register(r'sociedades', views.SociedadViewSet, basename='sociedad')
router.register(r'brokers', views.BrokerViewSet, basename='broker')
router.register(r'currencies', views.CurrencyViewSet, basename='currency')
router.register(r'icoterms', views.ICOTERMViewSet, basename='icoterm')
router.register(r'trade-operation-types', views.TradeOperationTypeViewSet, basename='trade-operation-type')
router.register(r'delivery-formats', views.DeliveryFormatViewSet, basename='delivery-format')
router.register(r'additives', views.AdditiveViewSet, basename='additive')

# Facilities
router.register(r'counterparty-facilities', views.CounterpartyFacilityViewSet, basename='counterparty-facility')

app_name = 'nextcrm'

urlpatterns = [
    # Include all router URLs
    path('', include(router.urls)),
]