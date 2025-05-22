from django.db import models
from reversion import revisions as reversion
from django.contrib.auth.models import User

# Define the Cryptocurrency model
class Cryptocurrency(models.Model):
    id                      = models.AutoField(primary_key=True)  # Explicit auto-incremental primary key
    name                    = models.CharField(max_length=100)
    symbol                  = models.CharField(max_length=10)
    current_price           = models.FloatField()
    market_cap              = models.BigIntegerField()
    total_volume            = models.BigIntegerField()

    def __str__(self):
        return self.name

# Define the HistoricalCryptocurrency model
class HistoricalCryptocurrency(models.Model):
    id                      = models.AutoField(primary_key=True)  # Explicit auto-incremental primary key
    name                    = models.CharField(max_length=100)
    symbol                  = models.CharField(max_length=10)
    current_price           = models.FloatField()
    market_cap              = models.BigIntegerField()
    total_volume            = models.BigIntegerField()
    timestamp               = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.name} - {self.timestamp}"



#                   ++++++++++++++++++++ MODELOS DE CONTRATOS DE COMPRA/VENTA ++++++++++++++++++++
#                   ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++




# Define the CENTRO model
class Cost_Center(models.Model):
    id_cost_center              = models.AutoField(primary_key=True)  # Explicit auto-incremental primary key
    cost_center_name           = models.CharField(max_length=50)
    

    def __str__(self):
        return f"{self.id_cost_center} - {self.cost_center_name}"
    

# Define the SOCIEDAD model
class Sociedad(models.Model):
    id_sociedad             = models.AutoField(primary_key=True)  # Explicit auto-incremental primary key
    sociedad_name         = models.CharField(max_length=50)
    

    def __str__(self):
        return f"{self.id_sociedad} - {self.nombre_sociedad}"



# Define the TRADER model
class Trader(models.Model):
    id_trader               = models.AutoField(primary_key=True)  # Explicit auto-incremental primary key
    trader_name             = models.CharField(max_length=50)
    

    def __str__(self):
        return f"{self.id_trader} - {self.trader_name}"




# +++++++ COMMODITY +++++++
# +++++++++++++++++++++++++


    
# Define the COMMODITY GROUP model
class Commodity_Group(models.Model):
    id_commodity_group          = models.AutoField(primary_key=True)  # Explicit auto-incremental primary key
    commodity_group_name        = models.CharField(max_length=50)
    

    def __str__(self):
        return f"{self.id_familia} - {self.nombre_familia}"
    
# Define the COMMODITY TYPE model
class Commodity_Type(models.Model):
    id_commodity_type           = models.AutoField(primary_key=True)  # Explicit auto-incremental primary key
    commodity_type_name         = models.CharField(max_length=50)
    

    def __str__(self):
        return f"{self.id_tipo_producto} - {self.nombre_tipo_producto}"


# Define the COMMODITY SUBTYPE model
class Commodity_Subtype(models.Model):
    id_commodity_subtype        = models.AutoField(primary_key=True)  # Explicit auto-incremental primary key
    commodity_subtype_name      = models.CharField(max_length=50)
    

    def __str__(self):
        return f"{self.id_tipo_sub_producto} - {self.nombre_tipo_sub_producto}"
    

# Define the COMMODITY model
class Commodity(models.Model):
    id_commodity                = models.AutoField(primary_key=True)  # Explicit auto-incremental primary key
    commodity_name_short        = models.CharField(max_length=50)
    commodity_group             = models.ForeignKey(Commodity_Group, on_delete=models.CASCADE, db_column='id_commodity_group')
    commodity_type              = models.ForeignKey(Commodity_Type, on_delete=models.CASCADE, db_column='id_commodity_type')
    commodity_subtype           = models.ForeignKey(Commodity_Subtype, on_delete=models.CASCADE, db_column='id_commodity_subtype')

    def __str__(self):
        return f"{self.id_commodity} - {self.commodity_name_short}"
    

#+++++++ DATOS DE FORMATO Y ADITIVO +++++++
#++++++++++++++++++++++++++++++++++++++++++


# Define the FORMATO model
class Delivery_Format(models.Model):
    id_delivery_format          = models.AutoField(primary_key=True)  # Explicit auto-incremental primary key
    delivery_format_name        = models.CharField(max_length=50)
    delivery_format_cost        = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.id_delivery_format} - {self.delivery_format_name}"

# Define the ADITIVO model    
class Additive(models.Model):
    id_additive                 = models.AutoField(primary_key=True)  # Explicit auto-incremental primary key
    additive_name               = models.CharField(max_length=50)
    additive_cost               = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.id_additive} - {self.additive_name}"




#+++++++ DATOS DE CLIENTE +++++++
#++++++++++++++++++++++++++++++++



class Counterparty(models.Model):
    id_counterparty             = models.AutoField(primary_key=True)                                    # Explicit auto-incremental primary key
    counterparty_name           = models.CharField(max_length=50)
    

    def __str__(self):
        return f"{self.id_counterparty} - {self.counterparty_name}"


class Counterparty_Facility(models.Model):
    id_counterparty_facility      = models.AutoField(primary_key=True)                                    # Explicit auto-incremental primary key
    counterparty_facility_name    = models.CharField(max_length=50)
    

    def __str__(self):
        return f"{self.id_counterparty_facility} - {self.counterparty_facility_name}"





#+++++++ DATOS DE BROKER ++++++++
#++++++++++++++++++++++++++++++++


class Broker(models.Model):
    id_broker                   = models.AutoField(primary_key=True)                                    # Explicit auto-incremental primary key
    broker_name                 = models.CharField(max_length=50)
    

    def __str__(self):
        return f"{self.id_broker} - {self.broker_name}"




#+++++++ DATOS DE OTHERS ++++++++
#++++++++++++++++++++++++++++++++

# Define the CURRENCY model    
class Currency(models.Model):
    id_currency                 = models.AutoField(primary_key=True)                                    # Explicit auto-incremental primary key
    currency_name               = models.CharField(max_length=50)
    

    def __str__(self):
        return f"{self.id_currency} - {self.currency_name}"

# Define the ICOTERM model    
class ICOTERM(models.Model):
    id_icoterm                  = models.AutoField(primary_key=True)                                    # Explicit auto-incremental primary key
    icoterm_name                = models.CharField(max_length=50)
    

    def __str__(self):
        return f"{self.id_icoterm} - {self.icoterm_name}"


# Define the TRADE OPERATION TYPE model    
class Trade_Operation_Type(models.Model):
    id_trade_operation_type                  = models.AutoField(primary_key=True)                                    # Explicit auto-incremental primary key
    trade_operation_type_name                = models.CharField(max_length=50)
    

    def __str__(self):
        return f"{self.id_trade_operation_type} - {self.trade_operation_type_name}"

#++++++ CONTRATO DE VENTA +++++++
#++++++++++++++++++++++++++++++++

# Define the Contract model

class Contract(models.Model):
    id                          = models.AutoField(primary_key=True)                                                                        # Explicit auto-incremental primary key
    trader                      = models.ForeignKey(Trader, on_delete=models.CASCADE)                                                       # Foreign Key
    trade_operation_type        = models.ForeignKey(Trade_Operation_Type, on_delete=models.CASCADE)  
    sociedad                    = models.ForeignKey(Sociedad, on_delete=models.CASCADE)                                                     # Foreign Key
    counterparty                = models.ForeignKey(Counterparty, on_delete=models.CASCADE)                                                 # Foreign Key
    commodity                   = models.ForeignKey(Commodity, on_delete=models.CASCADE)                                                    # Foreign Key
    commodity_group             = models.ForeignKey(Commodity_Group, on_delete=models.CASCADE)                                              # Foreign Key
    delivery_format             = models.ForeignKey(Delivery_Format, on_delete=models.CASCADE)                                              # Foreign Key
    additive                    = models.ForeignKey(Additive, on_delete=models.CASCADE)                                                     # Foreign Key
    broker                      = models.ForeignKey(Broker, on_delete=models.CASCADE)                                                       # Foreign Key
    broker_fee                  = models.DecimalField(max_digits=10, decimal_places=2)                                                      # Divisa, decimal
    broker_fee_currency         = models.ForeignKey(Currency, on_delete=models.CASCADE, related_name='broker_fee_contracts')                # Foreign Key
    icoterm                     = models.ForeignKey(ICOTERM, on_delete=models.CASCADE)                                                      # Foreign Key
    entrega                     = models.CharField(max_length=50)                                                                           # Texto libre para definir el punto de entrega. se puede mirar igualmente en plantas?
    freight_cost                = models.DecimalField(max_digits=10, decimal_places=2)                                                      # Divisa, decimal
    cost_center                 = models.ForeignKey(Cost_Center, on_delete=models.CASCADE)                                                       # Divisa, decimal
    forex                       = models.DecimalField(max_digits=10, decimal_places=4)                                                      # Divisa, decimal
    payment_days                = models.IntegerField()                                                                                     # Integer
    price                       = models.DecimalField(max_digits=10, decimal_places=2)                                                      # Divisa, decimal
    trade_currency              = models.ForeignKey(Currency, on_delete=models.CASCADE, related_name='trade_contracts')                     # Foreign Key
    delivery_period             = models.DateField()
    date                        = models.DateField()

    def __str__(self):
        return f"{self.comercial} - {self.tipo_operacion}"




class TableNames(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        #return self.name
        return f"{self.name}"
    

class DashboardLayout(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="dashboard_layout")
    layout = models.JSONField(default=list)
    widgets = models.JSONField(default=list)

    def __str__(self):
        return f"{self.user.username}'s Dashboard Layout"