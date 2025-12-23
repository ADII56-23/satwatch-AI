# 🔐 COMPLETE API KEY SETUP GUIDE

## ⚠️ CRITICAL SECURITY ALERT

You've shared a Google API key publicly: `AIzaSyASCcbL_ersbRI06xm986p_jVmhml5Dbd4`

This key is now **compromised** and anyone can use it. Follow these steps IMMEDIATELY:

---

## 🚨 STEP 1: RESTRICT THE API KEY (DO THIS NOW!)

### Option A: Quick Restriction (Recommended)
1. Go to: https://console.cloud.google.com/apis/credentials?project=serious-ascent-471515-t8
2. Find your API key in the list
3. Click the **EDIT** (pencil) icon
4. Under **Application restrictions**:
   - Select **"HTTP referrers (web sites)"**
   - Click **"ADD AN ITEM"**
   - Add: `http://localhost:5173/*`
   - Add: `http://localhost:8000/*`
   - Add: `http://127.0.0.1:5173/*`
5. Under **API restrictions**:
   - Select **"Restrict key"**
   - Check only these APIs:
     - ✅ Maps JavaScript API
     - ✅ Geocoding API  
     - ✅ Places API
     - ✅ Static Maps API
6. Click **SAVE**

### Option B: Create a New Key (More Secure)
1. Go to the same credentials page
2. Click **"CREATE CREDENTIALS"** → **"API key"**
3. A new key will be created
4. **IMMEDIATELY** click **"RESTRICT KEY"**
5. Follow the restriction steps above
6. **DELETE** the old key: `AIzaSyASCcbL_ersbRI06xm986p_jVmhml5Dbd4`

---

## 📝 STEP 2: ADD KEY TO YOUR PROJECT

### Automatic Setup (Easy Way)

**Run this command in your project folder:**
```bash
cd c:\Users\adity\Desktop\satellite
setup_api_key.bat
```

This will automatically create the `.env.local` file with your API key.

### Manual Setup (If script doesn't work)

1. **Create the file**: `c:\Users\adity\Desktop\satellite\web-app\.env.local`

2. **Add this content**:
```env
VITE_GOOGLE_API_KEY=AIzaSyASCcbL_ersbRI06xm986p_jVmhml5Dbd4
```

3. **Save the file**

---

## 🔄 STEP 3: RESTART YOUR APPLICATION

1. **Stop the dev server** (Ctrl+C in the terminal running `npm run dev`)
2. **Restart it**:
```bash
cd c:\Users\adity\Desktop\satellite\web-app
npm run dev
```

The API key will now be available as `import.meta.env.VITE_GOOGLE_API_KEY`

---

## ✅ STEP 4: VERIFY IT'S WORKING

1. Open your browser console (F12)
2. Check if there are any API key errors
3. The satellite imagery should load properly

---

## 🛡️ SECURITY BEST PRACTICES

### ✅ DO:
- ✅ Restrict API keys to specific domains
- ✅ Restrict API keys to specific APIs
- ✅ Store keys in `.env.local` files (git-ignored)
- ✅ Use environment variables
- ✅ Rotate keys regularly
- ✅ Monitor API usage in Google Cloud Console

### ❌ DON'T:
- ❌ Share API keys in chat/email/screenshots
- ❌ Commit `.env` files to git
- ❌ Use unrestricted API keys
- ❌ Hard-code keys in source code
- ❌ Share service account JSON files
- ❌ Leave keys in public repositories

---

## 📊 MONITORING YOUR API USAGE

Check your API usage to detect unauthorized access:
1. Go to: https://console.cloud.google.com/apis/dashboard?project=serious-ascent-471515-t8
2. Monitor for unusual spikes in requests
3. If you see suspicious activity, **regenerate your key immediately**

---

## 🔧 USING THE API KEY IN YOUR CODE

The key is automatically available in your Vite app:

```javascript
// Access the API key
const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

// Example: Use with Google Maps
const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lon}&zoom=13&size=600x300&key=${apiKey}`;
```

---

## 🆘 TROUBLESHOOTING

### Key not working?
- Make sure you've restarted the dev server
- Check the `.env.local` file exists in `web-app/` folder
- Verify the key starts with `VITE_` (required for Vite)

### Still seeing errors?
- Check Google Cloud Console for API restrictions
- Verify the APIs you need are enabled
- Check the browser console for specific error messages

---

## 📞 NEED HELP?

If you're still having issues:
1. Check the browser console for errors
2. Verify your Google Cloud project has billing enabled
3. Make sure the required APIs are enabled in your project

---

## ⚡ QUICK CHECKLIST

- [ ] Restricted the API key in Google Cloud Console
- [ ] Created `.env.local` file with the key
- [ ] Restarted the dev server
- [ ] Verified no console errors
- [ ] Satellite images are loading

**Once all boxes are checked, you're good to go!** 🎉
