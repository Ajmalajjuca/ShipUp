# Start user service
Write-Host "Starting User Service..." -ForegroundColor Green
Set-Location -Path "$PSScriptRoot\service\user-service"
npm run dev 