
import os
from dotenv import load_dotenv
import ee

def test_auth():
    load_dotenv()
    project_id = os.getenv('GEE_PROJECT_ID')
    client_email = os.getenv('GEE_CLIENT_EMAIL')
    private_key_raw = os.getenv('GEE_PRIVATE_KEY', '')
    
    print(f"Project ID: {project_id}")
    print(f"Client Email: {client_email}")
    print(f"Private Key Length: {len(private_key_raw)}")
    print(f"Private Key Start: {private_key_raw[:30]}")
    
    # helper to fix key
    private_key = private_key_raw.replace('\\n', '\n')
    
    print(f"Fixed Key Lines: {len(private_key.splitlines())}")

    try:
        credentials = ee.ServiceAccountCredentials(client_email, key_data=private_key)
        ee.Initialize(credentials, project=project_id)
        print("SUCCESS: Authenticated with Earth Engine!")
    except Exception as e:
        print(f"FAILURE: {e}")

if __name__ == "__main__":
    test_auth()
