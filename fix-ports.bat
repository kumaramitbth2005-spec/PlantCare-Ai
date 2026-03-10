@echo off
echo [CLEANUP] Killing processes on ports 3000, 5000, and 8000...

:: Kill port 3000 (Frontend)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do taskkill /f /pid %%a

:: Kill port 8000 (Backend)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do taskkill /f /pid %%a

:: Kill port 5000 (AI Service)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING') do taskkill /f /pid %%a

echo [SUCCESS] Ports are cleared.
echo.
pause
