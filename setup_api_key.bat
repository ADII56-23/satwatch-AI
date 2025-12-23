@echo off
echo ========================================
echo   Google API Key Setup
echo ========================================
echo.
echo This will create your .env.local file with the Google API key
echo.
echo IMPORTANT: Make sure you've restricted this key in Google Cloud Console!
echo See GOOGLE_API_KEY_SETUP.md for instructions
echo.
pause

cd web-app

echo Creating .env.local file...
(
echo # Google API Key
echo # This file is automatically ignored by git
echo VITE_GOOGLE_API_KEY=AIzaSyASCcbL_ersbRI06xm986p_jVmhml5Dbd4
) > .env.local

echo.
echo ✅ .env.local file created successfully!
echo.
echo Next steps:
echo 1. Restrict your API key in Google Cloud Console
echo 2. Restart your dev server: npm run dev
echo.
pause
