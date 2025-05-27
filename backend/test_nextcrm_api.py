# backend/test_nextcrm_api.py
import os
import django
import requests
import json

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.development')
django.setup()

class NextCRMAPITester:
    def __init__(self, base_url="http://127.0.0.1:8000"):
        self.base_url = base_url
        self.auth_token = None
        
    def authenticate(self):
        """Authenticate and get access token"""
        print("🔐 Authenticating...")
        
        # Try to login with existing user first
        login_data = {
            "username": "admin",  # Change to your superuser
            "password": "admin"   # Change to your password
        }
        
        try:
            response = requests.post(f"{self.base_url}/api/auth/login/", json=login_data)
            if response.status_code == 200:
                data = response.json()
                self.auth_token = data['tokens']['access']
                print("✅ Authentication successful")
                return True
            else:
                print(f"❌ Login failed: {response.status_code}")
                print("Creating test user...")
                return self.create_test_user()
        except Exception as e:
            print(f"❌ Authentication error: {e}")
            return False
    
    def create_test_user(self):
        """Create test user for API testing"""
        user_data = {
            "username": "testuser_api",
            "email": "testapi@example.com",
            "first_name": "API",
            "last_name": "Tester",
            "password": "TestPassword123!",
            "password_confirm": "TestPassword123!",
            "gdpr_consent": True,
            "company": "Sovena",
            "position": "API Tester"
        }
        
        try:
            response = requests.post(f"{self.base_url}/api/auth/register/", json=user_data)
            if response.status_code == 201:
                data = response.json()
                self.auth_token = data['tokens']['access']
                print("✅ Test user created and authenticated")
                return True
            else:
                print(f"❌ User creation failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ User creation error: {e}")
            return False
    
    def get_headers(self):
        """Get headers with authentication"""
        return {
            "Authorization": f"Bearer {self.auth_token}",
            "Content-Type": "application/json"
        }
    
    def test_reference_data(self):
        """Test reference data endpoints"""
        print("\n📊 Testing Reference Data Endpoints")
        print("=" * 40)
        
        endpoints = [
            'currencies', 'icoterms', 'trade-operation-types',
            'cost-centers', 'sociedades', 'brokers',
            'delivery-formats', 'additives'
        ]
        
        results = {}
        
        for endpoint in endpoints:
            try:
                response = requests.get(
                    f"{self.base_url}/api/nextcrm/{endpoint}/",
                    headers=self.get_headers()
                )
                
                if response.status_code == 200:
                    data = response.json()
                    count = data.get('count', len(data) if isinstance(data, list) else 0)
                    print(f"✅ {endpoint}: {count} records")
                    results[endpoint] = True
                else:
                    print(f"❌ {endpoint}: {response.status_code}")
                    results[endpoint] = False
                    
            except Exception as e:
                print(f"❌ {endpoint}: Error - {e}")
                results[endpoint] = False
        
        return results
    
    def test_commodity_hierarchy(self):
        """Test commodity hierarchy endpoints"""
        print("\n🌾 Testing Commodity Hierarchy")
        print("=" * 30)
        
        endpoints = ['commodity-groups', 'commodity-types', 'commodity-subtypes', 'commodities']
        
        for endpoint in endpoints:
            try:
                response = requests.get(
                    f"{self.base_url}/api/nextcrm/{endpoint}/",
                    headers=self.get_headers()
                )
                
                if response.status_code == 200:
                    data = response.json()
                    count = data.get('count', len(data) if isinstance(data, list) else 0)
                    print(f"✅ {endpoint}: {count} records")
                else:
                    print(f"❌ {endpoint}: {response.status_code}")
                    
            except Exception as e:
                print(f"❌ {endpoint}: Error - {e}")
    
    def test_main_entities(self):
        """Test main business entities"""
        print("\n🏢 Testing Main Entities")
        print("=" * 25)
        
        entities = ['traders', 'counterparties', 'contracts']
        
        for entity in entities:
            try:
                response = requests.get(
                    f"{self.base_url}/api/nextcrm/{entity}/",
                    headers=self.get_headers()
                )
                
                if response.status_code == 200:
                    data = response.json()
                    count = data.get('count', len(data) if isinstance(data, list) else 0)
                    print(f"✅ {entity}: {count} records")
                else:
                    print(f"❌ {entity}: {response.status_code}")
                    
            except Exception as e:
                print(f"❌ {entity}: Error - {e}")
    
    def test_dashboard_stats(self):
        """Test dashboard statistics endpoint"""
        print("\n📈 Testing Dashboard Statistics")
        print("=" * 30)
        
        try:
            response = requests.get(
                f"{self.base_url}/api/nextcrm/contracts/dashboard_stats/",
                headers=self.get_headers()
            )
            
            if response.status_code == 200:
                data = response.json()
                print("✅ Dashboard stats retrieved successfully")
                print(f"   Total contracts: {data.get('total_contracts', 0)}")
                print(f"   Active contracts: {data.get('active_contracts', 0)}")
                print(f"   Total value: {data.get('total_value', 0)}")
                return True
            else:
                print(f"❌ Dashboard stats failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Dashboard stats error: {e}")
            return False
    
    def test_contract_actions(self):
        """Test contract-specific actions"""
        print("\n📄 Testing Contract Actions")
        print("=" * 25)
        
        actions = ['overdue', 'upcoming_deliveries']
        
        for action in actions:
            try:
                response = requests.get(
                    f"{self.base_url}/api/nextcrm/contracts/{action}/",
                    headers=self.get_headers()
                )
                
                if response.status_code == 200:
                    data = response.json()
                    count = len(data) if isinstance(data, list) else 0
                    print(f"✅ {action}: {count} contracts")
                else:
                    print(f"❌ {action}: {response.status_code}")
                    
            except Exception as e:
                print(f"❌ {action}: Error - {e}")
    
    def test_api_endpoints(self):
        """Test all API endpoints"""
        print("🔍 NextCRM API Comprehensive Test")
        print("=" * 50)
        
        if not self.authenticate():
            print("❌ Authentication failed. Cannot proceed with API tests.")
            return False
        
        # Test different endpoint categories
        ref_data_results = self.test_reference_data()
        self.test_commodity_hierarchy()
        self.test_main_entities()
        dashboard_ok = self.test_dashboard_stats()
        self.test_contract_actions()
        
        # Summary
        print("\n" + "=" * 50)
        print("📋 API Test Summary")
        
        ref_data_passed = sum(ref_data_results.values())
        ref_data_total = len(ref_data_results)
        
        print(f"   Reference Data: {ref_data_passed}/{ref_data_total} endpoints working")
        print(f"   Dashboard Stats: {'✅' if dashboard_ok else '❌'}")
        
        if ref_data_passed == ref_data_total and dashboard_ok:
            print("\n🎉 All core API endpoints are working!")
            return True
        else:
            print("\n⚠️ Some endpoints need attention.")
            return False

def main():
    """Main test function"""
    print("🚀 Starting NextCRM API Tests")
    print("Make sure Django server is running: python manage.py runserver")
    input("Press Enter when server is ready...")
    
    tester = NextCRMAPITester()
    success = tester.test_api_endpoints()
    
    if success:
        print("\n🎯 Next steps:")
        print("   1. ✅ API is working - start building frontend")
        print("   2. ✅ Add sample data through admin or API")
        print("   3. ✅ Test with real use cases")
        print("   4. 🚀 Deploy to production when ready")
    
    return success

if __name__ == "__main__":
    main()