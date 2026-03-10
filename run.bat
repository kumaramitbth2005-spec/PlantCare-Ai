@echo off
TITLE PlantCare AI - Multi-Service Launcher
SETLOCAL

echo.
echo  ======================================================
echo     PLANTCARE AI - PRODUCTION-READY SAAS PLATFORM
echo  ======================================================
echo.

:: 1. Auto-Cleanup Ports
echo [CLEANUP] Ensuring ports 3000, 5000, and 8000 are free...
call fix-ports.bat

:: 2. Check for Docker
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [INFO] Docker not found. Running in Local Development Mode...
    goto :local_dev
)

:: 3. Run with Docker Compose
echo [1/3] Building and starting services with Docker...
docker-compose up --build -d

if %errorlevel% neq 0 (
    echo [ERROR] Docker Compose failed. Switching to Local Mode...
    goto :local_dev
)

echo.
echo [SUCCESS] Platform is launching!
echo ------------------------------------------------------
echo  Frontend Dashboard: http://localhost:3000
echo  Backend API:        http://localhost:8000
echo  AI Model Service:   http://localhost:5000
echo ------------------------------------------------------
echo.
pause
exit /b

:local_dev
echo [1/2] Installing dependencies (this may take a minute)...
call npm run install:all

echo [2/2] Starting all services concurrently...
npm run dev

echo.
pause
