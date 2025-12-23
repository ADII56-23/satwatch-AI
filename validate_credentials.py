"""
Helper script to validate and test Earth Engine credentials
"""
import os
import sys

def test_env_file():
    """Test if .env file is properly formatted"""
    print("=" * 60)
    print("🔍 Earth Engine Credentials Validator")
    print("=" * 60)
    
    # Try to read .env file directly
    env_path = ".env"
    if not os.path.exists(env_path):
        print("❌ .env file not found!")
        print(f"   Expected location: {os.path.abspath(env_path)}")
        return False
    
    print(f"✅ Found .env file at: {os.path.abspath(env_path)}")
    print()
    
    # Read and validate
    with open(env_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    print(f"📄 File has {len(lines)} lines")
    print()
    
    # Check for required variables
    required_vars = ['GEE_PROJECT_ID', 'GEE_CLIENT_EMAIL', 'GEE_PRIVATE_KEY']
    found_vars = {}
    
    for i, line in enumerate(lines, 1):
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        
        if '=' in line:
            key = line.split('=', 1)[0].strip()
            value = line.split('=', 1)[1].strip() if len(line.split('=', 1)) > 1 else ''
            
            if key in required_vars:
                found_vars[key] = {
                    'line': i,
                    'length': len(value),
                    'has_value': len(value) > 0
                }
    
    print("📋 Credential Check:")
    print("-" * 60)
    
    all_good = True
    for var in required_vars:
        if var in found_vars:
            info = found_vars[var]
            status = "✅" if info['has_value'] else "❌"
            print(f"{status} {var}")
            print(f"   Line {info['line']}, Length: {info['length']} chars")
            
            if var == 'GEE_PRIVATE_KEY' and info['has_value']:
                # Check if it looks like a valid private key
                with open(env_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    if 'BEGIN PRIVATE KEY' in content:
                        print(f"   ✅ Contains BEGIN PRIVATE KEY marker")
                    else:
                        print(f"   ❌ Missing BEGIN PRIVATE KEY marker")
                        all_good = False
            
            if not info['has_value']:
                all_good = False
        else:
            print(f"❌ {var}")
            print(f"   NOT FOUND in .env file")
            all_good = False
        print()
    
    return all_good

def test_earth_engine():
    """Test Earth Engine initialization"""
    print("=" * 60)
    print("🌍 Testing Earth Engine Connection")
    print("=" * 60)
    
    try:
        # Set environment variables manually from .env
        with open('.env', 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('#') or '=' not in line:
                    continue
                key, value = line.split('=', 1)
                key = key.strip()
                value = value.strip()
                
                # Remove quotes if present
                if value.startswith('"') and value.endswith('"'):
                    value = value[1:-1]
                if value.startswith("'") and value.endswith("'"):
                    value = value[1:-1]
                
                os.environ[key] = value
        
        project_id = os.environ.get('GEE_PROJECT_ID')
        client_email = os.environ.get('GEE_CLIENT_EMAIL')
        private_key = os.environ.get('GEE_PRIVATE_KEY', '')
        
        print(f"📋 Project ID: {project_id}")
        print(f"📧 Client Email: {client_email}")
        print(f"🔑 Private Key Length: {len(private_key)} chars")
        print()
        
        if not all([project_id, client_email, private_key]):
            print("❌ Missing required credentials!")
            return False
        
        # Fix escaped newlines
        private_key = private_key.replace('\\n', '\n')
        
        print(f"🔧 Fixed Private Key Lines: {len(private_key.splitlines())}")
        print()
        
        # Try to initialize Earth Engine
        import ee
        
        print("🔄 Initializing Earth Engine...")
        credentials = ee.ServiceAccountCredentials(client_email, key_data=private_key)
        ee.Initialize(credentials, project=project_id)
        
        print("✅ SUCCESS! Earth Engine initialized!")
        print()
        
        # Test a simple query
        print("🧪 Testing with a simple query...")
        image = ee.Image('LANDSAT/LC08/C02/T1_L2/LC08_044034_20140318')
        info = image.getInfo()
        print(f"✅ Query successful! Image ID: {info['id']}")
        print()
        
        return True
        
    except Exception as e:
        print(f"❌ FAILED: {e}")
        print()
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print()
    
    # Step 1: Validate .env file
    env_valid = test_env_file()
    print()
    
    if not env_valid:
        print("⚠️  Please fix the .env file issues above before proceeding.")
        print()
        print("💡 Tips:")
        print("   1. Make sure all 3 variables are present")
        print("   2. GEE_PRIVATE_KEY should include -----BEGIN PRIVATE KEY-----")
        print("   3. Use \\n (backslash-n) for newlines in the private key")
        print("   4. Don't use quotes around values")
        print()
        sys.exit(1)
    
    # Step 2: Test Earth Engine
    print()
    ee_works = test_earth_engine()
    
    if ee_works:
        print("=" * 60)
        print("🎉 ALL TESTS PASSED!")
        print("=" * 60)
        print()
        print("Your Earth Engine credentials are working correctly!")
        print("The backend will now use real satellite imagery.")
        print()
    else:
        print("=" * 60)
        print("❌ EARTH ENGINE TEST FAILED")
        print("=" * 60)
        print()
        print("Please check:")
        print("1. Service account is registered at code.earthengine.google.com")
        print("2. Private key format is correct")
        print("3. Project ID matches your Google Cloud project")
        print()
        sys.exit(1)
