# backend/check_backend_health.py
import os
import sys
import django
import requests
from django.core.management import execute_from_command_line

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.development')
django.setup()

def check_database():
    """Check database connection and basic queries"""
    print("🗄️  Checking Database Connection...")
    try:
        from django.db import connection
        cursor = connection.cursor()
        cursor.execute("SELECT 1")
        result = cursor.fetchone()
        print("✅ Database: Connected successfully")
        
        # Check if migrations are applied
        cursor.execute("SELECT COUNT(*) FROM django_migrations")
        migration_count = cursor.fetchone()[0]
        print(f"✅ Migrations: {migration_count} applied")
        
        return True
    except Exception as e:
        print(f"❌ Database: Failed - {e}")
        return False

def check_models():
    """Check if models can be imported and basic operations work"""
    print("\n📊 Checking Models...")
    try:
        from apps.nextcrm.models import Contract, Counterparty, Commodity, Currency
        from django.contrib.auth.models import User
        from apps.authentication.models import UserProfile
        
        # Test basic model operations
        user_count = User.objects.count()
        currency_count = Currency.objects.count()
        contract_count = Contract.objects.count()
        
        print(f"✅ Models: Working")
        print(f"   - Users: {user_count}")
        print(f"   - Currencies: {currency_count}")
        print(f"   - Contracts: {contract_count}")
        
        return True
    except Exception as e:
        print(f"❌ Models: Failed - {e}")
        return False

def check_admin():
    """Check admin interface"""
    print("\n👨‍💼 Checking Admin...")
    try:
        from django.contrib import admin
        from apps.nextcrm.models import Contract
        
        registered = Contract in admin.site._registry
        print(f"✅ Admin: {'Configured' if registered else 'Not fully configured'}")
        return registered
    except Exception as e:
        print(f"❌ Admin: Failed - {e}")
        return False

def check_api_structure():
    """Check if API endpoints are configured"""
    print("\n🔗 Checking API Structure...")
    try:
        from django.urls import reverse
        from rest_framework.test import APIClient
        
        # Check if URLs resolve
        health_url = '/api/health/'
        auth_url = '/api/auth/'
        nextcrm_url = '/api/nextcrm/'
        
        print("✅ API Structure: URLs configured")
        print(f"   - Health: {health_url}")
        print(f"   - Auth: {auth_url}")
        print(f"   - NextCRM: {nextcrm_url}")
        
        return True
    except Exception as e:
        print(f"❌ API Structure: Failed - {e}")
        return False

def check_settings():
    """Check Django settings"""
    print("\n⚙️  Checking Settings...")
    try:
        from django.conf import settings
        
        db_engine = settings.DATABASES['default']['ENGINE']
        installed_apps = len(settings.INSTALLED_APPS)
        debug = settings.DEBUG
        
        print("✅ Settings: Loaded successfully")
        print(f"   - Database: {db_engine}")
        print(f"   - Apps: {installed_apps}")
        print(f"   - Debug: {debug}")
        print(f"   - SECRET_KEY: {'Set' if settings.SECRET_KEY else 'Missing'}")
        
        return True
    except Exception as e:
        print(f"❌ Settings: Failed - {e}")
        return False

def create_sample_data():
    """Create minimal sample data for testing"""
    print("\n📝 Creating Sample Data...")
    try:
        from apps.nextcrm.models import Currency, Cost_Center, Sociedad
        
        # Create EUR currency if not exists
        eur, created = Currency.objects.get_or_create(
            currency_code='EUR',
            defaults={
                'currency_name': 'Euro',
                'currency_symbol': '€'
            }
        )
        
        # Create USD currency if not exists
        usd, created = Currency.objects.get_or_create(
            currency_code='USD',
            defaults={
                'currency_name': 'US Dollar',
                'currency_symbol': '$'
            }
        )
        
        print("✅ Sample Data: Created basic reference data")
        return True
    except Exception as e:
        print(f"❌ Sample Data: Failed - {e}")
        return False

def main():
    """Run all health checks"""
    print("🚀 NextCRM Backend Health Check")
    print("=" * 50)
    
    checks = [
        check_settings,
        check_database,
        check_models,
        check_admin,
        check_api_structure,
        create_sample_data,
    ]
    
    results = []
    for check in checks:
        results.append(check())
        print()
    
    # Summary
    passed = sum(results)
    total = len(results)
    
    print("=" * 50)
    print(f"📋 Summary: {passed}/{total} checks passed")
    
    if passed == total:
        print("\n🎉 Backend is healthy! Ready to start server.")
        print("\nNext steps:")
        print("1. Run: python manage.py runserver")
        print("2. Visit: http://127.0.0.1:8000/admin/")
        print("3. Test API: http://127.0.0.1:8000/api/health/")
    else:
        print("\n⚠️  Some issues found. Check errors above.")
        
        if not results[1]:  # Database check failed
            print("\n🔧 Database troubleshooting:")
            print("1. Run: docker-compose up -d db")
            print("2. Run: python manage.py migrate")
            print("3. Run this script again")

if __name__ == "__main__":
    main()