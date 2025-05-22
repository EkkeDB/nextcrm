from rest_framework import serializers
from .models import (
    Additive,
    Broker,
    Commodity,
    Commodity_Group,
    Commodity_Subtype,
    Commodity_Type,
    Contract,
    Cost_Center,
    Counterparty,
    Counterparty_Facility,
    Cryptocurrency,
    Currency,
    Delivery_Format,
    HistoricalCryptocurrency,
    ICOTERM,
    Sociedad,
    TableNames,
    Trade_Operation_Type,
    Trader,
    DashboardLayout,
)

# === Basic Serializers ===

class AdditiveSerializer(serializers.ModelSerializer):
    class Meta:
        model = Additive
        fields = '__all__'


class BrokerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Broker
        fields = '__all__'


class CommodityGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Commodity_Group
        fields = '__all__'


class CommoditySubtypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Commodity_Subtype
        fields = '__all__'


class CommodityTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Commodity_Type
        fields = '__all__'


class CommoditySerializer(serializers.ModelSerializer):
    class Meta:
        model = Commodity
        fields = '__all__'


class CostCenterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cost_Center
        fields = '__all__'


class CounterpartySerializer(serializers.ModelSerializer):
    class Meta:
        model = Counterparty
        fields = '__all__'


class CounterpartyFacilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Counterparty_Facility
        fields = '__all__'


class CryptocurrencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Cryptocurrency
        fields = '__all__'


class CurrencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Currency
        fields = '__all__'


class DeliveryFormatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Delivery_Format
        fields = '__all__'


class HistoricalCryptocurrencySerializer(serializers.ModelSerializer):
    class Meta:
        model = HistoricalCryptocurrency
        fields = '__all__'


class ICOTERMSerializer(serializers.ModelSerializer):
    class Meta:
        model = ICOTERM
        fields = '__all__'


class SociedadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sociedad
        fields = '__all__'


class TableNamesSerializer(serializers.ModelSerializer):
    class Meta:
        model = TableNames
        fields = '__all__'


class TradeOperationTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trade_Operation_Type
        fields = '__all__'


class TraderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trader
        fields = '__all__'

class DashboardLayoutSerializer(serializers.ModelSerializer):
    class Meta:
        model = DashboardLayout
        fields = ['layout', 'widgets']

# === Contract Serializers ===

class ContractReadSerializer(serializers.ModelSerializer):
    trader = TraderSerializer(read_only=True)
    sociedad = SociedadSerializer(read_only=True)
    counterparty = CounterpartySerializer(read_only=True)
    commodity = CommoditySerializer(read_only=True)
    commodity_group = CommodityGroupSerializer(read_only=True)
    delivery_format = DeliveryFormatSerializer(read_only=True)
    additive = AdditiveSerializer(read_only=True)
    broker = BrokerSerializer(read_only=True)
    broker_fee_currency = CurrencySerializer(read_only=True)
    icoterm = ICOTERMSerializer(read_only=True)
    cost_center = CostCenterSerializer(read_only=True)
    trade_currency = CurrencySerializer(read_only=True)
    trade_operation_type = TradeOperationTypeSerializer(read_only=True)

    class Meta:
        model = Contract
        fields = '__all__'


class ContractWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contract
        fields = '__all__'
