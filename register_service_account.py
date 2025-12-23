"""
Register service account with Earth Engine using Python
"""
import os
import ee

def register_service_account():
    """Register service account with Earth Engine"""
    
    print("🔧 Registering Service Account with Earth Engine")
    print("=" * 60)
    
    # Read credentials from .env
    with open('.env', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Parse manually
    lines = content.split('\n')
    env_vars = {}
    
    for line in lines:
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        if '=' in line:
            key, value = line.split('=', 1)
            env_vars[key.strip()] = value.strip()
    
    project_id = env_vars.get('GEE_PROJECT_ID', '')
    client_email = env_vars.get('GEE_CLIENT_EMAIL', '')
    private_key = env_vars.get('GEE_PRIVATE_KEY', '').replace('\\n', '\n')
    
    print(f"📋 Project ID: {project_id}")
    print(f"📧 Service Account: {client_email}")
    print()
    
    try:
        # Initialize with service account
        print("🔄 Initializing Earth Engine...")
        credentials = ee.ServiceAccountCredentials(client_email, key_data=private_key)
        ee.Initialize(credentials, project=project_id)
        
        print("✅ SUCCESS! Earth Engine initialized!")
        print()
        print("🎉 Your service account is now registered and working!")
        print()
        print("Next steps:")
        print("1. Restart your backend server")
        print("2. You should see: '✅ Earth Engine initialized - Real satellite imagery enabled!'")
        print("3. Your timeline will show real historical imagery!")
        print()
        
        # Test with a simple query
        print("🧪 Testing with a sample query...")
        image = ee.Image('LANDSAT/LC08/C02/T1_L2/LC08_044034_20140318')
        info = image.getInfo()
        print(f"✅ Test successful! Retrieved image: {info['id']}")
        print()
        print("=" * 60)
        print("🎉 EVERYTHING IS WORKING!")
        print("=" * 60)
        
        return True
        
    except Exception as e:
        error_msg = str(e)
        print(f"❌ Error: {error_msg}")
        print()
        
        if "does not have earthengine" in error_msg.lower():
            print("⚠️  Service account needs Earth Engine permissions")
            print()
            print("Please do this:")
            print("1. Go to: https://console.cloud.google.com/iam-admin/iam?project=" + project_id)
            print("2. Find: " + client_email)
            print("3. Click the pencil icon to edit")
            print("4. Add role: 'Earth Engine Resource Admin'")
            print("5. Save")
            print("6. Wait 5 minutes")
            print("7. Run this script again")
        elif "invalid_grant" in error_msg.lower():
            print("⚠️  Service account needs to be registered")
            print()
            print("The IAM permissions might not have propagated yet.")
            print("Please wait 5 minutes and try again.")
        else:
            print("⚠️  Unexpected error")
            print()
            print("Please check:")
            print("1. Service account has 'Earth Engine Resource Admin' role in IAM")
            print("2. Credentials in .env file are correct")
            print("3. Wait a few minutes for permissions to propagate")
        
        return False

if __name__ == "__main__":
    print()
    success = register_service_account()
    print()
    
    if success:
        print("✅ You're all set! Restart your backend to enable Earth Engine.")
    else:
        print("❌ Registration failed. Follow the instructions above.")
    print()
