# backend/setup_windows.py
import os
import sys
import subprocess

def set_environment_variables():
    """Set environment variables for Windows PostgreSQL connection"""
    env_vars = {
        'PGCLIENTENCODING': 'UTF8',
        'PYTHONIOENCODING': 'utf-8',
        'LC_ALL': 'en_US.UTF-8',
        'LANG': 'en_US.UTF-8',
        'DJANGO_SETTINGS_MODULE': 'core.settings.development'
    }
    
    print("🔧 Setting environment variables for PostgreSQL...")
    for key, value in env_vars.items():
        os.environ[key] = value
        print(f"   {key}={value}")

def test_postgresql_connection():
    """Test PostgreSQL connection with URI"""
    print("\n🔍 Testing PostgreSQL connection...")
    
    try:
        import psycopg2
        
        # Use URI connection string to avoid path encoding issues
        connection_uri = "postgresql://nextcrm_user:nextcrm_password_2024@127.0.0.1:5432/nextcrm?client_encoding=utf8"
        
        # Test connection
        conn = psycopg2.connect(connection_uri)
        cursor = conn.cursor()
        cursor.execute('SELECT version();')
        version = cursor.fetchone()[0]
        print(f"✅ PostgreSQL connection successful!")
        print(f"   Version: {version}")
        
        cursor.close()
        conn.close()
        return True
        
    except psycopg2.OperationalError as e:
        if "could not connect to server" in str(e):
            print(f"❌ PostgreSQL server not running or not accessible")
            print(f"   Error: {e}")
            print("   💡 Make sure Docker PostgreSQL is running: docker-compose up -d db")
        else:
            print(f"❌ PostgreSQL connection failed: {e}")
        return False
    except psycopg2.Error as e:
        print(f"❌ PostgreSQL error: {e}")
        return False
    except ImportError:
        print("❌ psycopg2 not installed. Run: pip install psycopg2-binary")
        return False
    except UnicodeDecodeError as e:
        print(f"❌ Unicode encoding error: {e}")
        print("   💡 This is a Windows path encoding issue")
        return False

def run_django_checks():
    """Run Django system checks"""
    print("\n🧪 Running Django checks...")
    
    try:
        import django
        from django.conf import settings
        from django.core.management import execute_from_command_line
        
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.development')
        django.setup()
        
        print("✅ Django setup successful!")
        print(f"   Database: {settings.DATABASES['default']['ENGINE']}")
        print(f"   Host: {settings.DATABASES['default']['HOST']}")
        print(f"   Database name: {settings.DATABASES['default']['NAME']}")
        
        return True
        
    except Exception as e:
        print(f"❌ Django setup failed: {e}")
        return False

def main():
    """Main setup function"""
    print("🚀 NextCRM Windows Setup")
    print("=" * 40)
    
    # Set environment variables
    set_environment_variables()
    
    # Test PostgreSQL connection
    pg_ok = test_postgresql_connection()
    
    # Test Django setup
    django_ok = run_django_checks()
    
    print("\n" + "=" * 40)
    print("📋 Setup Summary:")
    print(f"   PostgreSQL: {'✅' if pg_ok else '❌'}")
    print(f"   Django: {'✅' if django_ok else '❌'}")
    
    if pg_ok and django_ok:
        print("\n🎉 Setup completed successfully!")
        print("\nNext steps:")
        print("   1. Run: python manage.py migrate")
        print("   2. Run: python manage.py createsuperuser")
        print("   3. Run: python manage.py runserver")
    else:
        print("\n⚠️ Setup incomplete. Check errors above.")
        
        if not pg_ok:
            print("\n🔧 PostgreSQL troubleshooting:")
            print("   1. Make sure Docker is running")
            print("   2. Run: docker-compose up -d db")
            print("   3. Wait 30 seconds for database to start")
            print("   4. Run this script again")

if __name__ == "__main__":
    main()
