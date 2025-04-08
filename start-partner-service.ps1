# Start partner service
Write-Host "Starting Partner Service..." -ForegroundColor Green
Set-Location -Path "$PSScriptRoot\service\partner-service"
npm run dev 