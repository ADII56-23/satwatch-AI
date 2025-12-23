"""
Simple diagnostic to check .env file format
"""
import os

print("🔍 Checking .env file...")
print()

if not os.path.exists('.env'):
    print("❌ .env file not found!")
    exit(1)

with open('.env', 'r', encoding='utf-8') as f:
    content = f.read()

print("📄 .env file contents (first 500 chars):")
print("-" * 60)
print(content[:500])
print("-" * 60)
print()

# Check for common issues
issues = []

if 'GEE_PROJECT_ID=' not in content:
    issues.append("❌ GEE_PROJECT_ID not found")
else:
    print("✅ GEE_PROJECT_ID found")

if 'GEE_CLIENT_EMAIL=' not in content:
    issues.append("❌ GEE_CLIENT_EMAIL not found")
else:
    print("✅ GEE_CLIENT_EMAIL found")

if 'GEE_PRIVATE_KEY=' not in content:
    issues.append("❌ GEE_PRIVATE_KEY not found")
else:
    print("✅ GEE_PRIVATE_KEY found")
    if 'BEGIN PRIVATE KEY' not in content:
        issues.append("⚠️  Private key might be missing BEGIN marker")
    else:
        print("✅ Private key has BEGIN marker")

print()

if issues:
    print("Issues found:")
    for issue in issues:
        print(f"  {issue}")
    print()
    print("💡 Your .env file should look like:")
    print()
    print("GEE_PROJECT_ID=your-project-id")
    print("GEE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com")
    print("GEE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\\nMIIE...\\n-----END PRIVATE KEY-----\\n")
    print()
    print("Note: Use \\n (backslash-n) for newlines in the private key")
else:
    print("✅ .env file looks good!")
    print()
    print("Now testing Earth Engine connection...")
    print()
    
    # Try to parse and test
    try:
        # Manual parsing to avoid dotenv issues
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
        
        print(f"Project ID: {project_id}")
        print(f"Client Email: {client_email}")
        print(f"Private Key Length: {len(private_key)} chars")
        print()
        
        if not all([project_id, client_email, private_key]):
            print("❌ Some credentials are empty!")
            exit(1)
        
        # Test Earth Engine
        import ee
        
        print("Attempting to initialize Earth Engine...")
        credentials = ee.ServiceAccountCredentials(client_email, key_data=private_key)
        ee.Initialize(credentials, project=project_id)
        
        print("✅ SUCCESS! Earth Engine is working!")
        print()
        print("🎉 Your credentials are valid and Earth Engine is ready to use!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print()
        print("Common issues:")
        print("1. Service account not registered at code.earthengine.google.com")
        print("2. Private key format incorrect (should have \\n not actual newlines)")
        print("3. Wrong project ID or client email")
        print()
        print("Please double-check your credentials in the .env file.")
