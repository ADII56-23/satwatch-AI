# ⚠️ SECURITY INSTRUCTIONS FOR GOOGLE API KEY
# 
# You shared: AIzaSyASCcbL_ersbRI06xm986p_jVmhml5Dbd4
#
# IMMEDIATE ACTIONS REQUIRED:
#
# 1. RESTRICT THIS API KEY NOW:
#    - Go to: https://console.cloud.google.com/apis/credentials?project=serious-ascent-471515-t8
#    - Find this API key
#    - Click EDIT
#    - Under "Application restrictions":
#      * Select "HTTP referrers (web sites)"
#      * Add: http://localhost:5173/*
#      * Add: http://localhost:8000/*
#      * Add your production domain when deployed
#    - Under "API restrictions":
#      * Select "Restrict key"
#      * Enable ONLY the APIs you need:
#        - Maps JavaScript API
#        - Geocoding API
#        - Places API
#    - Click SAVE
#
# 2. ADD TO YOUR .env FILE:
#    Create/edit: c:\Users\adity\Desktop\satellite\web-app\.env.local
#    Add this line:
#    VITE_GOOGLE_API_KEY=AIzaSyASCcbL_ersbRI06xm986p_jVmhml5Dbd4
#
# 3. NEVER SHARE API KEYS PUBLICLY AGAIN!
#    - Don't paste them in chat
#    - Don't commit them to git
#    - Don't share screenshots with keys visible
#
# This file is safe to keep as a reference since it's in .gitignore
