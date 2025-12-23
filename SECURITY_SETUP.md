# 🔒 SECURITY SETUP - Google Earth Engine Integration

## ⚠️ CRITICAL SECURITY NOTICE

**YOU MUST REVOKE THE EXPOSED SERVICE ACCOUNT KEY IMMEDIATELY!**

The private key you shared publicly has been compromised. Follow these steps NOW:

### 1. REVOKE THE COMPROMISED KEY (DO THIS FIRST!)

1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts?project=serious-ascent-471515-t8
2. Click on: `google-earth@serious-ascent-471515-t8.iam.gserviceaccount.com`
3. Go to **KEYS** tab
4. Find key ID: `5d1cd952618b4ef17d458aa707e81d8934e74eca`
5. Click the **3 dots** → **DELETE**
6. Confirm deletion

### 2. CREATE A NEW SERVICE ACCOUNT KEY

1. Still in the same service account page
2. Click **ADD KEY** → **Create new key**
3. Choose **JSON** format
4. Click **CREATE**
5. Save the downloaded JSON file securely

### 3. CONFIGURE THE APPLICATION

1. Open the `.env` file in the project root
2. Replace the placeholder values with your NEW credentials:

```env
GEE_PROJECT_ID=serious-ascent-471515-t8
GEE_CLIENT_EMAIL=google-earth@serious-ascent-471515-t8.iam.gserviceaccount.com
GEE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
YOUR_NEW_PRIVATE_KEY_HERE
-----END PRIVATE KEY-----"
```

**IMPORTANT**: Keep the quotes around the private key and include the BEGIN/END markers!

### 4. INSTALL DEPENDENCIES

```bash
pip install earthengine-api python-dotenv
```

### 5. TEST THE INTEGRATION

The API will automatically try to use Google Earth Engine if credentials are available.
If not, it will fall back to ESRI imagery.

Test the endpoint:
```bash
curl http://localhost:8000/timeline/40.7128/-74.0060
```

## 🛡️ SECURITY BEST PRACTICES

✅ **DO**:
- Store credentials in `.env` file (already in .gitignore)
- Use environment variables for sensitive data
- Revoke keys immediately if exposed
- Rotate keys regularly

❌ **DON'T**:
- Share private keys publicly
- Commit `.env` file to git
- Hard-code credentials in source code
- Share service account JSON files

## 📚 API USAGE

### Get Timeline Images

**Endpoint**: `GET /timeline/{lat}/{lon}`

**Example**:
```
GET http://localhost:8000/timeline/40.7128/-74.0060
```

**Response**:
```json
{
  "status": "success",
  "source": "Google Earth Engine",
  "timeline": {
    "2020": "https://...",
    "2021": "https://...",
    ...
  }
}
```

## 🔧 TROUBLESHOOTING

If Google Earth Engine doesn't work:
1. Check `.env` file has correct credentials
2. Verify service account has Earth Engine permissions
3. Check console for error messages
4. The app will automatically fall back to ESRI imagery

## 📞 SUPPORT

If you need help:
1. Check the error logs in the terminal
2. Verify your Google Cloud project has Earth Engine API enabled
3. Ensure the service account has the correct permissions
