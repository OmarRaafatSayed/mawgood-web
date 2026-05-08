"""
Test connection to Medusa backend
"""

import requests
import json

BACKEND_URL = "http://localhost:9000"

def test_health():
    """Test backend health endpoint"""
    print("Testing backend health...")
    try:
        response = requests.get(f"{BACKEND_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✓ Backend is running!")
            return True
        else:
            print(f"✗ Backend returned status: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("✗ Cannot connect to backend. Is it running?")
        return False
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        return False

def test_admin_endpoint():
    """Test admin products endpoint"""
    print("\nTesting admin products endpoint...")
    try:
        response = requests.get(f"{BACKEND_URL}/admin/products?limit=1", timeout=5)
        print(f"Status: {response.status_code}")
        if response.status_code == 401:
            print("✓ Endpoint exists (requires authentication)")
            return True
        elif response.status_code == 200:
            data = response.json()
            count = len(data.get("products", []))
            print(f"✓ Endpoint accessible! Found {count} products")
            return True
        else:
            print(f"⚠ Unexpected status: {response.status_code}")
            print(f"Response: {response.text[:200]}")
            return False
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        return False

def check_excel_files():
    """Check if Excel files exist"""
    import os
    
    print("\nChecking Excel files...")
    data_dir = r"C:\Users\EXPRESS\Downloads\coding\MawgoodWep\data-products"
    
    files = [
        "H-I-X.xlsx",
        "H&S.xlsx",
        "Rehab Lafy.xlsx",
        "مصنع E-S-H.xlsx"
    ]
    
    all_exist = True
    for file in files:
        path = os.path.join(data_dir, file)
        if os.path.exists(path):
            size = os.path.getsize(path)
            print(f"✓ {file} ({size:,} bytes)")
        else:
            print(f"✗ {file} NOT FOUND")
            all_exist = False
    
    return all_exist

def main():
    print("="*80)
    print("MAWGOOD BACKEND CONNECTION TEST")
    print("="*80)
    
    # Test 1: Backend health
    health_ok = test_health()
    
    # Test 2: Admin endpoint
    admin_ok = test_admin_endpoint()
    
    # Test 3: Excel files
    files_ok = check_excel_files()
    
    # Summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    print(f"Backend Health: {'✓ PASS' if health_ok else '✗ FAIL'}")
    print(f"Admin Endpoint: {'✓ PASS' if admin_ok else '✗ FAIL'}")
    print(f"Excel Files: {'✓ PASS' if files_ok else '✗ FAIL'}")
    
    if health_ok and admin_ok and files_ok:
        print("\n✓ All tests passed! Ready to upload products.")
        print("\nRun: python scripts/upload_products_v2.py")
    else:
        print("\n✗ Some tests failed. Please fix the issues above.")
    
    print("="*80)

if __name__ == "__main__":
    main()
