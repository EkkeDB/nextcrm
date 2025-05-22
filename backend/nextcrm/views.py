from django.contrib.auth.models import auth
from django.contrib.auth import authenticate, logout
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status, viewsets, permissions
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.db import models
from rest_framework_simplejwt.exceptions import TokenError

from .models import (
    Cost_Center,
    Sociedad,
    Trader,
    Commodity_Group,
    Commodity_Type,
    Commodity_Subtype,
    Commodity,
    Delivery_Format,
    Additive,
    Counterparty,
    Counterparty_Facility,
    Broker,
    Currency,
    ICOTERM,
    Trade_Operation_Type,
    Contract,
    TableNames,
    Cryptocurrency,
    HistoricalCryptocurrency,
    DashboardLayout,
)

from .serializers import (
    CostCenterSerializer,
    SociedadSerializer,
    TraderSerializer,
    CommodityGroupSerializer,
    CommodityTypeSerializer,
    CommoditySubtypeSerializer,
    CommoditySerializer,
    DeliveryFormatSerializer,
    AdditiveSerializer,
    CounterpartySerializer,
    CounterpartyFacilitySerializer,
    BrokerSerializer,
    CurrencySerializer,
    ICOTERMSerializer,
    TradeOperationTypeSerializer,
    ContractReadSerializer,
    ContractWriteSerializer,
    TableNamesSerializer,
    CryptocurrencySerializer,
    HistoricalCryptocurrencySerializer,
    DashboardLayoutSerializer,
)


# ✅ ViewSets por modelo
class CryptocurrencyViewSet(viewsets.ModelViewSet):
    queryset = Cryptocurrency.objects.all()
    serializer_class = CryptocurrencySerializer
    permission_classes = [permissions.IsAuthenticated]


class HistoricalCryptocurrencyViewSet(viewsets.ModelViewSet):
    queryset = HistoricalCryptocurrency.objects.all()
    serializer_class = HistoricalCryptocurrencySerializer
    permission_classes = [permissions.IsAuthenticated]


class CostCenterViewSet(viewsets.ModelViewSet):
    queryset = Cost_Center.objects.all()
    serializer_class = CostCenterSerializer
    permission_classes = [permissions.IsAuthenticated]


class SociedadViewSet(viewsets.ModelViewSet):
    queryset = Sociedad.objects.all()
    serializer_class = SociedadSerializer
    permission_classes = [permissions.IsAuthenticated]


class TraderViewSet(viewsets.ModelViewSet):
    queryset = Trader.objects.all()
    serializer_class = TraderSerializer
    permission_classes = [permissions.IsAuthenticated]


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


class CommodityViewSet(viewsets.ModelViewSet):
    queryset = Commodity.objects.all()
    serializer_class = CommoditySerializer
    permission_classes = [permissions.IsAuthenticated]


class DeliveryFormatViewSet(viewsets.ModelViewSet):
    queryset = Delivery_Format.objects.all()
    serializer_class = DeliveryFormatSerializer
    permission_classes = [permissions.IsAuthenticated]


class AdditiveViewSet(viewsets.ModelViewSet):
    queryset = Additive.objects.all()
    serializer_class = AdditiveSerializer
    permission_classes = [permissions.IsAuthenticated]


class CounterpartyViewSet(viewsets.ModelViewSet):
    queryset = Counterparty.objects.all()
    serializer_class = CounterpartySerializer
    permission_classes = [permissions.IsAuthenticated]


class CounterpartyFacilityViewSet(viewsets.ModelViewSet):
    queryset = Counterparty_Facility.objects.all()
    serializer_class = CounterpartyFacilitySerializer
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


from .serializers import ContractReadSerializer, ContractWriteSerializer


class ContractViewSet(viewsets.ModelViewSet):
    queryset = Contract.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ["list", "retrieve"]:
            return ContractReadSerializer
        return ContractWriteSerializer


class TableNamesViewSet(viewsets.ModelViewSet):
    queryset = TableNames.objects.all()
    serializer_class = TableNamesSerializer
    permission_classes = [permissions.IsAuthenticated]


# ✅ Secure login with JWT cookie
@api_view(["POST"])
def secure_login(request):
    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(username=username, password=password)
    if user is not None:
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        response = Response({"message": "Login successful", "access": access_token})
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=True,           # ✅ Required for cross-site cookies
            samesite="None",       # ✅ Allows cookie to work cross-origin
            path="/",
        )
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=True,           # ✅ Required for cross-site cookies
            samesite="None",       # ✅ Allows cookie to work cross-origin
            path="/",
        )
        return response

    return Response({"error": "Invalid credentials"}, status=401)


# ✅ Logout by deleting cookies
@api_view(["POST"])
def secure_logout(request):
    response = Response({"message": "Logout successful"})
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    logout(request)
    return response


@api_view(["POST"])
def refresh_access_token(request):
    refresh_token = request.COOKIES.get("refresh_token")

    if not refresh_token:
        return Response({"error": "No refresh token provided"}, status=401)

    try:
        refresh = RefreshToken(refresh_token)
        new_access = str(refresh.access_token)

        response = Response({
            "message": "Access token refreshed",
            "access": new_access
        })

        response.set_cookie(
            key="access_token",
            value=new_access,
            httponly=True,
            secure=True,           # ✅ Must be True with SameSite=None
            samesite="None",       # ✅ Required for cross-origin
            path="/",
        )
        return response
    except TokenError:
        return Response({"error": "Invalid or expired refresh token"}, status=401)



@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def dashboard_layout(request):
    try:
        instance, created = DashboardLayout.objects.get_or_create(user=request.user)

        if request.method == "GET":
            serializer = DashboardLayoutSerializer(instance)
            return Response(serializer.data)

        if request.method == "POST":
            serializer = DashboardLayoutSerializer(instance, data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)

    except Exception as e:
        return Response({"error": str(e)}, status=400)


# ✅ Protected test route
@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def protected_example(request):
    return Response(
        {"message": f"Hello, {request.user.username}. You're authenticated."}
    )
