# Start-services.ps1
# A PowerShell script to start all services

Write-Host "Starting ShipUp services..." -ForegroundColor Green

# Start user-service
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $PSScriptRoot/service/user-service; npm run dev"

# Wait a moment to ensure user-service starts first
Start-Sleep -Seconds 2

# Start authentication-service
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $PSScriptRoot/service/authentication-service; npm run dev"

# Wait a moment to ensure authentication-service starts
Start-Sleep -Seconds 2

# Start frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $PSScriptRoot/frontend; npm run dev"

Write-Host "All services have been started in separate windows." -ForegroundColor Green 