# Start Backend
Write-Host "Starting Backend..."
Start-Process -FilePath "python" -ArgumentList "src/api.py" -NoNewWindow

# Start Frontend
Write-Host "Starting Frontend..."
Set-Location "web-app"
npm run dev
