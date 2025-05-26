# apps/nextcrm/admin.py
from django.contrib import admin
from .models import (
    Cost_Center, Sociedad, Trader, Commodity_Group, Commodity_Type,
    Commodity_Subtype, Commodity, Delivery_Format, Additive,
    Counterparty, Counterparty_Facility, Broker, Currency,
    ICOTERM, Trade_Operation_Type, Contract
)

# Base admin class
class BaseModelAdmin(admin.ModelAdmin):
    list_display = ['id', 'created_at', 'updated_at', 'is_active']
    list_filter = ['is_active', 'created_at']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(Cost_Center)
class CostCenterAdmin(BaseModelAdmin):
    list_display = ['id_cost_center', 'cost_center_name', 'is_active']
    search_fields = ['cost_center_name']

@admin.register(Sociedad)
class SociedadAdmin(BaseModelAdmin):
    list_display = ['id_sociedad', 'sociedad_name', 'tax_id', 'is_active']
    search_fields = ['sociedad_name', 'tax_id']

@admin.register(Trader)
class TraderAdmin(BaseModelAdmin):
    list_display = ['id_trader', 'trader_name', 'email', 'phone', 'is_active']
    search_fields = ['trader_name', 'email']

@admin.register(Commodity_Group)
class CommodityGroupAdmin(BaseModelAdmin):
    list_display = ['id_commodity_group', 'commodity_group_name', 'is_active']
    search_fields = ['commodity_group_name']

@admin.register(Commodity_Type)
class CommodityTypeAdmin(BaseModelAdmin):
    list_display = ['id_commodity_type', 'commodity_type_name', 'is_active']
    search_fields = ['commodity_type_name']

@admin.register(Commodity_Subtype)
class CommoditySubtypeAdmin(BaseModelAdmin):
    list_display = ['id_commodity_subtype', 'commodity_subtype_name', 'is_active']
    search_fields = ['commodity_subtype_name']

@admin.register(Commodity)
class CommodityAdmin(BaseModelAdmin):
    list_display = ['id_commodity', 'commodity_name_short', 'commodity_group', 'commodity_type', 'is_active']
    search_fields = ['commodity_name_short', 'commodity_name_full']
    list_filter = ['commodity_group', 'commodity_type', 'is_active']

@admin.register(Delivery_Format)
class DeliveryFormatAdmin(BaseModelAdmin):
    list_display = ['id_delivery_format', 'delivery_format_name', 'delivery_format_cost', 'is_active']
    search_fields = ['delivery_format_name']

@admin.register(Additive)
class AdditiveAdmin(BaseModelAdmin):
    list_display = ['id_additive', 'additive_name', 'additive_cost', 'is_active']
    search_fields = ['additive_name']

@admin.register(Counterparty)
class CounterpartyAdmin(BaseModelAdmin):
    list_display = ['id_counterparty', 'counterparty_name', 'counterparty_code', 'city', 'country', 'is_supplier', 'is_customer']
    search_fields = ['counterparty_name', 'counterparty_code', 'contact_person']
    list_filter = ['is_supplier', 'is_customer', 'country', 'is_active']

@admin.register(Counterparty_Facility)
class CounterpartyFacilityAdmin(BaseModelAdmin):
    list_display = ['id_counterparty_facility', 'counterparty_facility_name', 'counterparty', 'city', 'country']
    search_fields = ['counterparty_facility_name']
    list_filter = ['counterparty', 'country', 'is_active']

@admin.register(Broker)
class BrokerAdmin(BaseModelAdmin):
    list_display = ['id_broker', 'broker_name', 'broker_code', 'contact_person', 'email']
    search_fields = ['broker_name', 'broker_code', 'contact_person']

@admin.register(Currency)
class CurrencyAdmin(BaseModelAdmin):
    list_display = ['id_currency', 'currency_code', 'currency_name', 'currency_symbol']
    search_fields = ['currency_code', 'currency_name']

@admin.register(ICOTERM)
class ICOTERMAdmin(BaseModelAdmin):
    list_display = ['id_icoterm', 'icoterm_code', 'icoterm_name']
    search_fields = ['icoterm_code', 'icoterm_name']

@admin.register(Trade_Operation_Type)
class TradeOperationTypeAdmin(BaseModelAdmin):
    list_display = ['id_trade_operation_type', 'trade_operation_type_name', 'operation_code']
    search_fields = ['trade_operation_type_name', 'operation_code']

@admin.register(Contract)
class ContractAdmin(BaseModelAdmin):
    list_display = ['id', 'contract_number', 'trader', 'counterparty', 'commodity', 'status', 'date', 'total_value']
    search_fields = ['contract_number', 'counterparty__counterparty_name', 'trader__trader_name']
    list_filter = ['status', 'trade_operation_type', 'commodity_group', 'date']
    readonly_fields = ['total_value', 'created_at', 'updated_at']