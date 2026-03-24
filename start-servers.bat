@echo off
echo Starting TrekTales servers...
echo.

echo Checking port 8000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
	echo Port 8000 in use by PID %%a. Stopping it...
	taskkill /F /PID %%a >nul 2>&1
)
echo.

echo Starting Backend Server...
start "Backend Server" cmd /c "cd backend && npm start"

timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
start "Frontend Server" cmd /c "cd frontend && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173 (or next available port)
echo.
pause
