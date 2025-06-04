# apps/nextcrm/views.py
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Count, Sum, Q, Avg
from django.utils import timezone
from datetime import timedelta, datetime
from decimal import Decimal

from .models import (
    Contract, Counterparty, Commodity, Trader, Cost_Center,
    Sociedad, Broker, Currency, ICOTERM, Trade_Operation_Type,
    Delivery_Format, Additive, Commodity_Group, Commodity_Type,
    Commodity_Subtype, Counterparty_Facility
)
from .serializers import (
    ContractListSerializer, ContractDetailSerializer, ContractCreateUpdateSerializer,
    CounterpartySerializer, CounterpartyListSerializer, CommoditySerializer,
    TraderSerializer, CostCenterSerializer, SociedadSerializer, BrokerSerializer,
    CurrencySerializer, ICOTERMSerializer, TradeOperationTypeSerializer,
    DeliveryFormatSerializer, AdditiveSerializer, CommodityGroupSerializer,
    CommodityTypeSerializer, CommoditySubtypeSerializer, CounterpartyFacilitySerializer,
    DashboardStatsSerializer, BulkContractUpdateSerializer
)

# ==================== CONTRACT VIEWSET ====================

class ContractViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing contracts with advanced filtering and actions
    """
    queryset = Contract.objects.select_related(
        'trader', 'counterparty', 'commodity', 'trade_operation_type',
        'sociedad', 'broker', 'icoterm', 'cost_center', 'delivery_format',
        'additive', 'trade_currency', 'broker_fee_currency'
    ).all()
    
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    
    # Filtering options
    filterset_fields = {
        'status': ['exact', 'in'],
        'trader': ['exact'],
        'counterparty': ['exact'],
        'commodity': ['exact'],
        'commodity_group': ['exact'],
        'trade_operation_type': ['exact'],
        'date': ['gte', 'lte', 'year', 'month'],
        'delivery_period': ['gte', 'lte'],
        'price': ['gte', 'lte'],
        'quantity': ['gte', 'lte'],
    }
    
    # Search fields
    search_fields = [
        'contract_number', 'counterparty__counterparty_name',
        'commodity__commodity_name_short', 'trader__trader_name',
        'notes', 'entrega'
    ]
    
    # Ordering options
    ordering_fields = [
        'date', 'delivery_period', 'price', 'quantity', 'total_value',
        'created_at', 'updated_at', 'contract_number'
    ]
    ordering = ['-date', '-created_at']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return ContractListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ContractCreateUpdateSerializer
        return ContractDetailSerializer
    
    def get_queryset(self):
        """Filter queryset based on user permissions and query params"""
        queryset = super().get_queryset()
        
        # Filter by user's trader if not staff
        if not self.request.user.is_staff:
            user_trader = getattr(self.request.user, 'trader', None)
            if user_trader:
                queryset = queryset.filter(trader=user_trader)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """Get comprehensive dashboard statistics"""
        queryset = self.get_queryset()
        
        # Basic counts
        total_contracts = queryset.count()
        active_contracts = queryset.filter(status__in=['approved', 'executed']).count()
        pending_contracts = queryset.filter(status='draft').count()
        completed_contracts = queryset.filter(status='completed').count()
        
        # Financial stats
        total_value = queryset.aggregate(
            total=Sum('price')
        )['total'] or Decimal('0')
        
        # Overdue contracts
        today = timezone.now().date()
        overdue_contracts = queryset.filter(
            delivery_period__lt=today,
            status__in=['approved', 'executed']
        ).count()
        
        # Monthly trends (last 12 months)
        end_date = today
        start_date = end_date - timedelta(days=365)
        
        monthly_data = []
        current_date = start_date.replace(day=1)
        
        while current_date <= end_date:
            next_month = (current_date.replace(day=28) + timedelta(days=4)).replace(day=1)
            month_contracts = queryset.filter(
                date__gte=current_date,
                date__lt=next_month
            )
            
            monthly_data.append({
                'month': current_date.strftime('%Y-%m'),
                'count': month_contracts.count(),
                'value': float(month_contracts.aggregate(Sum('price'))['price__sum'] or 0)
            })
            
            current_date = next_month
        
        # Status distribution
        status_distribution = list(queryset.values('status').annotate(
            count=Count('id')
        ).order_by('-count'))
        
        # Top commodities by value
        top_commodities = list(queryset.values(
            'commodity__commodity_name_short'
        ).annotate(
            count=Count('id'),
            total_value=Sum('price')
        ).order_by('-total_value')[:10])
        
        # Top counterparties by value
        top_counterparties = list(queryset.values(
            'counterparty__counterparty_name'
        ).annotate(
            count=Count('id'),
            total_value=Sum('price')
        ).order_by('-total_value')[:10])
        
        stats = {
            'total_contracts': total_contracts,
            'active_contracts': active_contracts,
            'pending_contracts': pending_contracts,
            'completed_contracts': completed_contracts,
            'total_value': total_value,
            'overdue_contracts': overdue_contracts,
            'monthly_trends': monthly_data,
            'status_distribution': status_distribution,
            'top_commodities': top_commodities,
            'top_counterparties': top_counterparties,
        }
        
        serializer = DashboardStatsSerializer(stats)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Get overdue contracts"""
        today = timezone.now().date()
        overdue_queryset = self.get_queryset().filter(
            delivery_period__lt=today,
            status__in=['approved', 'executed']
        )
        
        serializer = ContractListSerializer(overdue_queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def upcoming_deliveries(self, request):
        """Get contracts with deliveries in the next 30 days"""
        today = timezone.now().date()
        future_date = today + timedelta(days=30)
        
        upcoming_queryset = self.get_queryset().filter(
            delivery_period__gte=today,
            delivery_period__lte=future_date,
            status__in=['approved', 'executed']
        ).order_by('delivery_period')
        
        serializer = ContractListSerializer(upcoming_queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def bulk_update(self, request):
        """Bulk update multiple contracts"""
        serializer = BulkContractUpdateSerializer(data=request.data)
        if serializer.is_valid():
            contract_ids = serializer.validated_data['contract_ids']
            update_data = {k: v for k, v in serializer.validated_data.items() 
                          if k != 'contract_ids'}
            
            contracts = self.get_queryset().filter(id__in=contract_ids)
            updated_count = contracts.update(**update_data)
            
            return Response({
                'message': f'Successfully updated {updated_count} contracts',
                'updated_contracts': updated_count
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def change_status(self, request, pk=None):
        """Change contract status with validation"""
        contract = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in dict(Contract.STATUS_CHOICES):
            return Response(
                {'error': 'Invalid status'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        old_status = contract.status
        contract.status = new_status
        contract.save()
        
        return Response({
            'message': f'Status changed from {old_status} to {new_status}',
            'old_status': old_status,
            'new_status': new_status
        })

# ==================== COUNTERPARTY VIEWSET ====================

class CounterpartyViewSet(viewsets.ModelViewSet):
    """ViewSet for managing counterparties"""
    queryset = Counterparty.objects.prefetch_related('facilities').all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    
    filterset_fields = ['is_supplier', 'is_customer', 'country', 'city']
    search_fields = ['counterparty_name', 'counterparty_code', 'contact_person', 'email']
    ordering_fields = ['counterparty_name', 'created_at', 'country']
    ordering = ['counterparty_name']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return CounterpartyListSerializer
        return CounterpartySerializer
    
    @action(detail=True, methods=['get'])
    def contracts(self, request, pk=None):
        """Get all contracts for this counterparty"""
        counterparty = self.get_object()
        contracts = Contract.objects.filter(counterparty=counterparty)
        serializer = ContractListSerializer(contracts, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        """Get statistics for this counterparty"""
        counterparty = self.get_object()
        contracts = Contract.objects.filter(counterparty=counterparty)
        
        stats = {
            'total_contracts': contracts.count(),
            'active_contracts': contracts.filter(status__in=['approved', 'executed']).count(),
            'total_value': contracts.aggregate(Sum('price'))['price__sum'] or 0,
            'average_contract_value': contracts.aggregate(Avg('price'))['price__avg'] or 0,
            'last_contract_date': contracts.order_by('-date').first().date if contracts.exists() else None,
        }
        
        return Response(stats)

# ==================== OTHER VIEWSETS ====================

class TraderViewSet(viewsets.ModelViewSet):
    queryset = Trader.objects.all()
    serializer_class = TraderSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['trader_name', 'email']
    ordering = ['trader_name']

class CommodityViewSet(viewsets.ModelViewSet):
    queryset = Commodity.objects.select_related(
        'commodity_group', 'commodity_type', 'commodity_subtype'
    ).all()
    serializer_class = CommoditySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['commodity_group', 'commodity_type', 'commodity_subtype']
    search_fields = ['commodity_name_short', 'commodity_name_full']
    ordering = ['commodity_name_short']

class CommodityGroupViewSet(viewsets.ModelViewSet):
    queryset = Commodity_Group.objects.all()
    serializer_class = CommodityGroupSerializer
    permission_classes = [permissions.IsAuthenticated]

class CommodityTypeViewSet(viewsets.ModelViewSet):
    queryset = Commodity_Type.objects.all()
    serializer_class = CommodityTypeSerializer
    permission_classes = [permissions.IsAuthenticated]

class CommoditySubtypeViewSet(viewsets.ModelViewSet):
    queryset = Commodity_Subtype.objects.all()
    serializer_class = CommoditySubtypeSerializer
    permission_classes = [permissions.IsAuthenticated]

class CostCenterViewSet(viewsets.ModelViewSet):
    queryset = Cost_Center.objects.all()
    serializer_class = CostCenterSerializer
    permission_classes = [permissions.IsAuthenticated]

class SociedadViewSet(viewsets.ModelViewSet):
    queryset = Sociedad.objects.all()
    serializer_class = SociedadSerializer
    permission_classes = [permissions.IsAuthenticated]

class BrokerViewSet(viewsets.ModelViewSet):
    queryset = Broker.objects.all()
    serializer_class = BrokerSerializer
    permission_classes = [permissions.IsAuthenticated]

class CurrencyViewSet(viewsets.ModelViewSet):
    queryset = Currency.objects.all()
    serializer_class = CurrencySerializer
    permission_classes = [permissions.IsAuthenticated]

class ICOTERMViewSet(viewsets.ModelViewSet):
    queryset = ICOTERM.objects.all()
    serializer_class = ICOTERMSerializer
    permission_classes = [permissions.IsAuthenticated]

class TradeOperationTypeViewSet(viewsets.ModelViewSet):
    queryset = Trade_Operation_Type.objects.all()
    serializer_class = TradeOperationTypeSerializer
    permission_classes = [permissions.IsAuthenticated]

class DeliveryFormatViewSet(viewsets.ModelViewSet):
    queryset = Delivery_Format.objects.all()
    serializer_class = DeliveryFormatSerializer
    permission_classes = [permissions.IsAuthenticated]

class AdditiveViewSet(viewsets.ModelViewSet):
    queryset = Additive.objects.all()
    serializer_class = AdditiveSerializer
    permission_classes = [permissions.IsAuthenticated]

class CounterpartyFacilityViewSet(viewsets.ModelViewSet):
    queryset = Counterparty_Facility.objects.select_related('counterparty').all()
    serializer_class = CounterpartyFacilitySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['counterparty']
    