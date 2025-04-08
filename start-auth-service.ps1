# Start authentication service
Write-Host "Starting Authentication Service..." -ForegroundColor Green
Set-Location -Path "$PSScriptRoot\service\authentication-service"
npm run dev 