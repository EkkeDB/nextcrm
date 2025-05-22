from django.urls import path, include
from rest_framework.routers import DefaultRouter
from nextcrm.views import (
    CryptocurrencyViewSet, HistoricalCryptocurrencyViewSet, CostCenterViewSet, SociedadViewSet,
    TraderViewSet, CommodityGroupViewSet, CommodityTypeViewSet, CommoditySubtypeViewSet,
    CommodityViewSet, DeliveryFormatViewSet, AdditiveViewSet, CounterpartyViewSet,
    CounterpartyFacilityViewSet, BrokerViewSet, CurrencyViewSet, ICOTERMViewSet,
    TradeOperationTypeViewSet, ContractViewSet, TableNamesViewSet, ContractViewSet, refresh_access_token, dashboard_layout,
    secure_login, secure_logout, protected_example
)
from .views import refresh_access_token
from .models import DashboardLayout

# DRF router setup
router = DefaultRouter()
router.register(r'cryptocurrencies', CryptocurrencyViewSet)
router.register(r'historical-cryptos', HistoricalCryptocurrencyViewSet)
router.register(r'cost-centers', CostCenterViewSet)
router.register(r'sociedades', SociedadViewSet)
router.register(r'traders', TraderViewSet)
router.register(r'commodity-groups', CommodityGroupViewSet)
router.register(r'commodity-types', CommodityTypeViewSet)
router.register(r'commodity-subtypes', CommoditySubtypeViewSet)
router.register(r'commodities', CommodityViewSet)
router.register(r'delivery-formats', DeliveryFormatViewSet)
router.register(r'additives', AdditiveViewSet)
router.register(r'counterparties', CounterpartyViewSet)
router.register(r'counterparty-facilities', CounterpartyFacilityViewSet)
router.register(r'brokers', BrokerViewSet)
router.register(r'currencies', CurrencyViewSet)
router.register(r'icoterms', ICOTERMViewSet)
router.register(r'trade-operation-types', TradeOperationTypeViewSet)
router.register(r'contracts', ContractViewSet, basename='contracts')
router.register(r'table-names', TableNamesViewSet)

urlpatterns = [
    path("api/", include(router.urls)),
    path("api/secure-login/", secure_login),
    path("api/secure-logout/", secure_logout),
    path("api/protected/", protected_example),
    path('api/', include(router.urls)),
    path("token/refresh-cookie/", refresh_access_token),
    path("api/dashboard-layout/", dashboard_layout),
    
]
