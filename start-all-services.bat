@echo off
echo Starting all ShipUp services...

REM Start User Service
start "User Service" cmd /k "cd %~dp0service\user-service && npm run dev"

REM Wait a moment to ensure user-service starts first
timeout /t 3 /nobreak > nul

REM Start Authentication Service
start "Authentication Service" cmd /k "cd %~dp0service\authentication-service && npm run dev"

REM Wait a moment to ensure auth-service starts
timeout /t 3 /nobreak > nul

REM Start Partner Service
start "Partner Service" cmd /k "cd %~dp0service\partner-service && npm run dev"

REM Wait a moment to ensure partner-service starts
timeout /t 3 /nobreak > nul

REM Start Frontend
start "Frontend" cmd /k "cd %~dp0frontend && npm run dev"

echo All services started in separate windows.
echo Press any key to exit this window...
pause > nul 