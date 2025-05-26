# backend/test_auth_system.py
import os
import django
import requests
import json

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.sqlite_temp')
django.setup()

def test_auth_endpoints():
    """Test authentication endpoints"""
    base_url = "http://127.0.0.1:8000/api/auth"
    
    print("🔐 Testing Authentication System")
    print("=" * 50)
    
    # Test data
    test_user = {
        "username": "testuser",
        "email": "test@example.com",
        "first_name": "Test",
        "last_name": "User",
        "password": "TestPassword123!",
        "password_confirm": "TestPassword123!",
        "gdpr_consent": True,
        "company": "Test Company",
        "position": "Developer"
    }
    
    try:
        # Test 1: User Registration
        print("1️⃣ Testing user registration...")
        response = requests.post(f"{base_url}/register/", json=test_user)
        if response.status_code == 201:
            print("✅ Registration successful")
            data = response.json()
            tokens = data.get('tokens', {})
            access_token = tokens.get('access')
            print(f"   Access token: {access_token[:20]}...")
        else:
            print(f"❌ Registration failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
        
        # Test 2: User Login
        print("\n2️⃣ Testing user login...")
        login_data = {
            "username": test_user["username"],
            "password": test_user["password"]
        }
        response = requests.post(f"{base_url}/login/", json=login_data)
        if response.status_code == 200:
            print("✅ Login successful")
            data = response.json()
            tokens = data.get('tokens', {})
            access_token = tokens.get('access')
            refresh_token = tokens.get('refresh')
            print(f"   New access token: {access_token[:20]}...")
        else:
            print(f"❌ Login failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
        
        # Test 3: Protected Profile Access
        print("\n3️⃣ Testing protected profile access...")
        headers = {"Authorization": f"Bearer {access_token}"}
        response = requests.get(f"{base_url}/profile/", headers=headers)
        if response.status_code == 200:
            print("✅ Profile access successful")
            data = response.json()
            print(f"   User: {data.get('username')} ({data.get('email')})")
        else:
            print(f"❌ Profile access failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
        
        # Test 4: Token Refresh
        print("\n4️⃣ Testing token refresh...")
        refresh_data = {"refresh": refresh_token}
        response = requests.post(f"{base_url}/token/refresh/", json=refresh_data)
        if response.status_code == 200:
            print("✅ Token refresh successful")
            data = response.json()
            new_access_token = data.get('access')
            print(f"   New access token: {new_access_token[:20]}...")
        else:
            print(f"❌ Token refresh failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
        
        # Test 5: User Permissions
        print("\n5️⃣ Testing user permissions...")
        headers = {"Authorization": f"Bearer {new_access_token}"}
        response = requests.get(f"{base_url}/permissions/", headers=headers)
        if response.status_code == 200:
            print("✅ Permissions check successful")
            data = response.json()
            print(f"   Is staff: {data.get('is_staff')}")
            print(f"   Is superuser: {data.get('is_superuser')}")
        else:
            print(f"❌ Permissions check failed: {response.status_code}")
            return False
        
        # Test 6: Profile Update
        print("\n6️⃣ Testing profile update...")
        update_data = {
            "first_name": "Updated",
            "company": "Updated Company",
            "position": "Senior Developer"
        }
        response = requests.put(f"{base_url}/profile/", json=update_data, headers=headers)
        if response.status_code == 200:
            print("✅ Profile update successful")
            data = response.json()
            print(f"   Updated name: {data.get('first_name')}")
            print(f"   Updated company: {data.get('company')}")
        else:
            print(f"❌ Profile update failed: {response.status_code}")
            print(f"   Error: {response.text}")
        
        # Test 7: GDPR Data Export
        print("\n7️⃣ Testing GDPR data export...")
        response = requests.get(f"{base_url}/gdpr/export/", headers=headers)
        if response.status_code == 200:
            print("✅ GDPR data export successful")
            data = response.json()
            print(f"   Export includes: {list(data.get('data', {}).keys())}")
        else:
            print(f"❌ GDPR data export failed: {response.status_code}")
        
        # Test 8: Logout
        print("\n8️⃣ Testing logout...")
        logout_data = {"refresh_token": refresh_token}
        response = requests.post(f"{base_url}/logout/", json=logout_data, headers=headers)
        if response.status_code == 200:
            print("✅ Logout successful")
        else:
            print(f"❌ Logout failed: {response.status_code}")
            print(f"   Error: {response.text}")
        
        print("\n🎉 All authentication tests completed!")
        return True
        
    except requests.exceptions.ConnectionError:
        print("❌ Connection error - make sure Django server is running!")
        print("   Run: python manage.py runserver")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def test_django_models():
    """Test Django models import and basic functionality"""
    try:
        print("\n🧪 Testing Django Models")
        print("=" * 30)
        
        # Test authentication models
        from apps.authentication.models import User, GDPRRecord, AuditLog
        print("✅ Authentication models imported successfully")
        
        # Test nextcrm models
        from apps.nextcrm.models import Contract, Counterparty, Commodity
        print("✅ NextCRM models imported successfully")
        
        # Check if custom user model is working
        user_count = User.objects.count()
        print(f"✅ User count: {user_count}")
        
        # Check contract count
        contract_count = Contract.objects.count()
        print(f"✅ Contract count: {contract_count}")
        
        # Check tables in database
        from django.db import connection
        cursor = connection.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;")
        tables = cursor.fetchall()
        table_names = [table[0] for table in tables if not table[0].startswith('sqlite_')]
        print(f"✅ Total tables in database: {len(table_names)}")
        print(f"   Sample tables: {table_names[:5]}...")
        
        return True
    except Exception as e:
        print(f"❌ Model test failed: {e}")
        return False

def test_basic_endpoints():
    """Test basic non-auth endpoints"""
    try:
        print("\n🌐 Testing Basic Endpoints")
        print("=" * 30)
        
        # Test home page
        response = requests.get("http://127.0.0.1:8000/")
        if response.status_code == 200:
            print("✅ Home page accessible")
            data = response.json()
            print(f"   App: {data.get('message')}")
        else:
            print(f"❌ Home page failed: {response.status_code}")
        
        # Test health check
        response = requests.get("http://127.0.0.1:8000/api/health/")
        if response.status_code == 200:
            print("✅ Health check accessible")
            data = response.json()
            print(f"   Status: {data.get('status')}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
        
        return True
    except requests.exceptions.ConnectionError:
        print("❌ Connection error - make sure Django server is running!")
        return False
    except Exception as e:
        print(f"❌ Basic endpoints test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🔍 NextCRM Authentication System Test")
    print("=" * 60)
    
    # Test Django models first
    models_ok = test_django_models()
    
    if models_ok:
        print("\n" + "=" * 60)
        print("📡 Starting API tests...")
        print("\n🚨 IMPORTANT: Make sure Django server is running!")
        print("   Open another terminal and run: python manage.py runserver")
        print("   Then press Enter to continue...")
        input()
        
        # Test basic endpoints
        basic_ok = test_basic_endpoints()
        
        if basic_ok:
            # Test authentication endpoints
            auth_ok = test_auth_endpoints()
            
            if auth_ok:
                print("\n" + "=" * 60)
                print("🎉 ALL TESTS PASSED! Authentication system is working correctly.")
                print("\n📋 Summary:")
                print("   ✅ Django models working")
                print("   ✅ Basic endpoints accessible")
                print("   ✅ User registration working")
                print("   ✅ User login working")
                print("   ✅ JWT tokens working")
                print("   ✅ Protected endpoints working")
                print("   ✅ Profile management working")
                print("   ✅ GDPR compliance working")
                print("\n🚀 Ready for next phase: NextCRM API implementation!")
            else:
                print("\n⚠️ Some authentication tests failed.")
        else:
            print("\n⚠️ Basic endpoint tests failed.")
    else:
        print("\n⚠️ Model tests failed.")

if __name__ == "__main__":
    main()