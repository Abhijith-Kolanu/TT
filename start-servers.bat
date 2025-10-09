@echo off
echo Starting TrekTales servers...
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
