@echo off
echo Starting TrekTales Application...

echo.
echo Starting Backend Server...
cd backend
start "Backend Server" cmd /k "echo Backend starting... && node index.js"
timeout /t 3

echo.
echo Starting Frontend Server...
cd ..\frontend
start "Frontend Server" cmd /k "echo Frontend starting... && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Press any key to continue...
pause
