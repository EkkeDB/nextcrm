# backend/test_system.py
import os
import django
from django.conf import settings

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.sqlite_temp')
django.setup()

def test_database_connection():
    """Probar conexión a la base de datos"""
    try:
        from django.db import connection
        cursor = connection.cursor()
        cursor.execute("SELECT 1")
        result = cursor.fetchone()
        print(f"✅ Database connection: OK (SQLite)")
        print(f"   Database file: {settings.DATABASES['default']['NAME']}")
        return True
    except Exception as e:
        print(f"❌ Database connection: FAILED - {e}")
        return False

def test_models():
    """Probar que los modelos funcionan"""
    try:
        from apps.nextcrm.models import (
            Currency, Cost_Center, Sociedad, Trader, 
            Counterparty, Commodity_Group, Contract,
            Commodity, Delivery_Format, Additive,
            Broker, ICOTERM, Trade_Operation_Type
        )
        
        # Contar registros en cada modelo
        models_to_test = [
            ('Currency', Currency),
            ('Cost_Center', Cost_Center),
            ('Sociedad', Sociedad),
            ('Trader', Trader),
            ('Counterparty', Counterparty),
            ('Commodity_Group', Commodity_Group),
            ('Commodity', Commodity),
            ('Delivery_Format', Delivery_Format),
            ('Additive', Additive),
            ('Broker', Broker),
            ('ICOTERM', ICOTERM),
            ('Trade_Operation_Type', Trade_Operation_Type),
            ('Contract', Contract),
        ]
        
        print("\n📊 Model counts:")
        for name, model in models_to_test:
            try:
                count = model.objects.count()
                print(f"   ✅ {name}: {count} records")
            except Exception as e:
                print(f"   ❌ {name}: ERROR - {e}")
        
        print("✅ Models: OK")
        return True
    except Exception as e:
        print(f"❌ Models: FAILED - {e}")
        return False

def test_admin():
    """Probar configuración del admin"""
    try:
        from django.contrib import admin
        from apps.nextcrm.models import Contract
        
        # Verificar que Contract está registrado en admin
        if Contract in admin.site._registry:
            print("✅ Admin registration: OK")
            return True
        else:
            print("❌ Admin registration: Contract not registered")
            return False
    except Exception as e:
        print(f"❌ Admin: FAILED - {e}")
        return False

def test_tables_created():
    """Verificar que las tablas se crearon en SQLite"""
    try:
        from django.db import connection
        cursor = connection.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")
        tables = cursor.fetchall()
        table_names = [table[0] for table in tables]
        
        print(f"\n🗄️ Tables in database:")
        for table in sorted(table_names):
            print(f"   ✅ {table}")
        
        # Verificar tablas importantes
        important_tables = ['contracts', 'counterparties', 'commodities', 'traders']
        missing_tables = [table for table in important_tables if table not in table_names]
        
        if missing_tables:
            print(f"   ⚠️ Missing important tables: {missing_tables}")
        else:
            print("   ✅ All important tables present")
        
        return len(missing_tables) == 0
    except Exception as e:
        print(f"❌ Tables check: FAILED - {e}")
        return False

def test_settings():
    """Probar configuraciones importantes"""
    try:
        print(f"\n⚙️ Settings check:")
        print(f"   DEBUG: {settings.DEBUG}")
        print(f"   Database: {settings.DATABASES['default']['ENGINE']}")
        print(f"   Database name: {settings.DATABASES['default']['NAME']}")
        print(f"   Installed apps count: {len(settings.INSTALLED_APPS)}")
        print(f"   NextCRM app installed: {'apps.nextcrm' in settings.INSTALLED_APPS}")
        print(f"   Secret key set: {'***' if settings.SECRET_KEY else 'NO'}")
        print("✅ Settings: OK")
        return True
    except Exception as e:
        print(f"❌ Settings: FAILED - {e}")
        return False

def create_sample_data():
    """Crear algunos datos de ejemplo"""
    try:
        from apps.nextcrm.models import Currency, Cost_Center, Sociedad
        
        # Crear moneda EUR si no existe
        eur, created = Currency.objects.get_or_create(
            currency_code='EUR',
            defaults={
                'currency_name': 'Euro',
                'currency_symbol': '€'
            }
        )
        if created:
            print("   ✅ Created EUR currency")
        
        # Crear centro de costos si no existe
        cc, created = Cost_Center.objects.get_or_create(
            cost_center_name='Trading Operations',
            defaults={'description': 'Main trading operations center'}
        )
        if created:
            print("   ✅ Created Trading Operations cost center")
        
        # Crear sociedad si no existe
        sociedad, created = Sociedad.objects.get_or_create(
            sociedad_name='Sovena Trading',
            defaults={'tax_id': 'ES12345678', 'address': 'Madrid, Spain'}
        )
        if created:
            print("   ✅ Created Sovena Trading sociedad")
        
        print("✅ Sample data created")
        return True
    except Exception as e:
        print(f"❌ Sample data creation: FAILED - {e}")
        return False

def main():
    """Ejecutar todas las pruebas"""
    print("🔍 NextCRM System Check (SQLite)")
    print("=" * 50)
    
    tests = [
        test_database_connection,
        test_settings,
        test_tables_created,
        test_models,
        test_admin,
        create_sample_data,
    ]
    
    results = []
    for test in tests:
        results.append(test())
        print()
    
    # Resumen
    passed = sum(results)
    total = len(results)
    
    print("=" * 50)
    print(f"📋 SUMMARY: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 ALL TESTS PASSED! Your system is working correctly.")
        print("\n🌐 You can now access:")
        print("   • Home: http://127.0.0.1:8000/")
        print("   • Admin: http://127.0.0.1:8000/admin/")
        print("   • Health: http://127.0.0.1:8000/api/health/")
    else:
        print("⚠️  SOME TESTS FAILED. Check the errors above.")
    
    return passed == total

if __name__ == "__main__":
    main()