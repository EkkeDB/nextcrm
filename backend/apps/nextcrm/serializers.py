# apps/nextcrm/serializers.py
from rest_framework import serializers
from .models import (
    Contract, Counterparty, Commodity, Trader, Cost_Center,
    Sociedad, Broker, Currency, ICOTERM, Trade_Operation_Type,
    Delivery_Format, Additive, Commodity_Group, Commodity_Type,
    Commodity_Subtype, Counterparty_Facility
)

# ==================== REFERENCE DATA SERIALIZERS ====================

class CurrencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Currency
        fields = '__all__'
        
class ICOTERMSerializer(serializers.ModelSerializer):
    class Meta:
        model = ICOTERM
        fields = '__all__'

class TradeOperationTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trade_Operation_Type
        fields = '__all__'

class CostCenterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cost_Center
        fields = '__all__'

class SociedadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sociedad
        fields = '__all__'

class BrokerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Broker
        fields = '__all__'

class DeliveryFormatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Delivery_Format
        fields = '__all__'

class AdditiveSerializer(serializers.ModelSerializer):
    class Meta:
        model = Additive
        fields = '__all__'

# ==================== COMMODITY SERIALIZERS ====================

class CommodityGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Commodity_Group
        fields = '__all__'

class CommodityTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Commodity_Type
        fields = '__all__'

class CommoditySubtypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Commodity_Subtype
        fields = '__all__'

class CommoditySerializer(serializers.ModelSerializer):
    commodity_group_name = serializers.CharField(source='commodity_group.commodity_group_name', read_only=True)
    commodity_type_name = serializers.CharField(source='commodity_type.commodity_type_name', read_only=True)
    commodity_subtype_name = serializers.CharField(source='commodity_subtype.commodity_subtype_name', read_only=True)
    
    class Meta:
        model = Commodity
        fields = '__all__'

# ==================== TRADER SERIALIZER ====================

class TraderSerializer(serializers.ModelSerializer):
    total_contracts = serializers.SerializerMethodField()
    active_contracts = serializers.SerializerMethodField()
    
    class Meta:
        model = Trader
        fields = '__all__'
    
    def get_total_contracts(self, obj):
        return obj.contract_set.count()
    
    def get_active_contracts(self, obj):
        return obj.contract_set.filter(status__in=['approved', 'executed']).count()

# ==================== COUNTERPARTY SERIALIZERS ====================

class CounterpartyFacilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Counterparty_Facility
        fields = '__all__'

class CounterpartySerializer(serializers.ModelSerializer):
    facilities = CounterpartyFacilitySerializer(many=True, read_only=True)
    total_contracts = serializers.SerializerMethodField()
    total_contract_value = serializers.SerializerMethodField()
    last_contract_date = serializers.SerializerMethodField()
    
    class Meta:
        model = Counterparty
        fields = '__all__'
    
    def get_total_contracts(self, obj):
        return obj.contract_set.count()
    
    def get_total_contract_value(self, obj):
        contracts = obj.contract_set.all()
        return sum(contract.total_value for contract in contracts)
    
    def get_last_contract_date(self, obj):
        last_contract = obj.contract_set.order_by('-date').first()
        return last_contract.date if last_contract else None

class CounterpartyListSerializer(serializers.ModelSerializer):
    """Simplified serializer for list views"""
    total_contracts = serializers.SerializerMethodField()
    
    class Meta:
        model = Counterparty
        fields = [
            'id_counterparty', 'counterparty_name', 'counterparty_code',
            'city', 'country', 'contact_person', 'email', 'phone',
            'is_supplier', 'is_customer', 'total_contracts'
        ]
    
    def get_total_contracts(self, obj):
        return obj.contract_set.count()

# ==================== CONTRACT SERIALIZERS ====================

class ContractListSerializer(serializers.ModelSerializer):
    """Optimized serializer for contract list views"""
    trader_name = serializers.CharField(source='trader.trader_name', read_only=True)
    counterparty_name = serializers.CharField(source='counterparty.counterparty_name', read_only=True)
    commodity_name = serializers.CharField(source='commodity.commodity_name_short', read_only=True)
    trade_operation_type_name = serializers.CharField(source='trade_operation_type.trade_operation_type_name', read_only=True)
    trade_currency_code = serializers.CharField(source='trade_currency.currency_code', read_only=True)
    total_value = serializers.ReadOnlyField()
    is_overdue = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Contract
        fields = [
            'id', 'contract_number', 'trader_name', 'counterparty_name',
            'commodity_name', 'trade_operation_type_name', 'price', 'quantity',
            'total_value', 'trade_currency_code', 'delivery_period', 'status',
            'status_display', 'date', 'is_overdue', 'created_at'
        ]
    
    def get_is_overdue(self, obj):
        from django.utils import timezone
        if obj.delivery_period and obj.status not in ['completed', 'cancelled']:
            return timezone.now().date() > obj.delivery_period
        return False

class ContractDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for contract detail views"""
    # Foreign key names
    trader_name = serializers.CharField(source='trader.trader_name', read_only=True)
    counterparty_name = serializers.CharField(source='counterparty.counterparty_name', read_only=True)
    commodity_name = serializers.CharField(source='commodity.commodity_name_short', read_only=True)
    trade_operation_type_name = serializers.CharField(source='trade_operation_type.trade_operation_type_name', read_only=True)
    sociedad_name = serializers.CharField(source='sociedad.sociedad_name', read_only=True)
    broker_name = serializers.CharField(source='broker.broker_name', read_only=True)
    icoterm_name = serializers.CharField(source='icoterm.icoterm_name', read_only=True)
    cost_center_name = serializers.CharField(source='cost_center.cost_center_name', read_only=True)
    delivery_format_name = serializers.CharField(source='delivery_format.delivery_format_name', read_only=True)
    additive_name = serializers.CharField(source='additive.additive_name', read_only=True)
    trade_currency_code = serializers.CharField(source='trade_currency.currency_code', read_only=True)
    broker_fee_currency_code = serializers.CharField(source='broker_fee_currency.currency_code', read_only=True)
    
    # Calculated fields
    total_value = serializers.ReadOnlyField()
    is_overdue = serializers.SerializerMethodField()
    days_until_delivery = serializers.SerializerMethodField()
    
    class Meta:
        model = Contract
        fields = '__all__'
    
    def get_is_overdue(self, obj):
        from django.utils import timezone
        if obj.delivery_period and obj.status not in ['completed', 'cancelled']:
            return timezone.now().date() > obj.delivery_period
        return False
    
    def get_days_until_delivery(self, obj):
        from django.utils import timezone
        if obj.delivery_period:
            delta = obj.delivery_period - timezone.now().date()
            return delta.days
        return None

class ContractCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating contracts"""
    
    class Meta:
        model = Contract
        exclude = ['contract_number']  # Auto-generated
    
    def validate(self, data):
        """Custom validation for contracts"""
        errors = {}
        
        # Validate delivery period
        if data.get('delivery_period') and data.get('date'):
            if data['delivery_period'] < data['date']:
                errors['delivery_period'] = "Delivery period cannot be before contract date."
        
        # Validate quantity
        if data.get('quantity', 0) <= 0:
            errors['quantity'] = "Quantity must be greater than zero."
        
        # Validate price
        if data.get('price', 0) <= 0:
            errors['price'] = "Price must be greater than zero."
        
        # Validate broker fee
        if data.get('broker_fee', 0) < 0:
            errors['broker_fee'] = "Broker fee cannot be negative."
        
        # Validate forex
        if data.get('forex', 0) <= 0:
            errors['forex'] = "Forex rate must be greater than zero."
        
        # Validate payment days
        if data.get('payment_days', 0) < 0:
            errors['payment_days'] = "Payment days cannot be negative."
        
        if errors:
            raise serializers.ValidationError(errors)
        
        return data
    
    def create(self, validated_data):
        """Create contract with auto-generated contract number"""
        contract = Contract.objects.create(**validated_data)
        return contract

# ==================== DASHBOARD SERIALIZERS ====================

class DashboardStatsSerializer(serializers.Serializer):
    """Serializer for dashboard statistics"""
    total_contracts = serializers.IntegerField()
    active_contracts = serializers.IntegerField()
    pending_contracts = serializers.IntegerField()
    completed_contracts = serializers.IntegerField()
    total_value = serializers.DecimalField(max_digits=20, decimal_places=2)
    monthly_trends = serializers.ListField()
    status_distribution = serializers.ListField()
    top_commodities = serializers.ListField()
    top_counterparties = serializers.ListField()
    overdue_contracts = serializers.IntegerField()

# ==================== BULK OPERATIONS SERIALIZERS ====================

class BulkContractUpdateSerializer(serializers.Serializer):
    """Serializer for bulk contract updates"""
    contract_ids = serializers.ListField(child=serializers.IntegerField())
    status = serializers.ChoiceField(choices=Contract.STATUS_CHOICES, required=False)
    trader = serializers.PrimaryKeyRelatedField(queryset=Trader.objects.all(), required=False)
    
    def validate_contract_ids(self, value):
        if not value:
            raise serializers.ValidationError("At least one contract ID is required.")
        return value