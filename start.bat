@echo off
echo ============================================
echo  IPR BlockDMS - Startup Script
echo ============================================

echo.
echo [1/2] Starting Backend Server (port 5000)...
start "BlockDMS Backend" cmd /k "cd /d %~dp0server && npm run dev"

timeout /t 2 /nobreak >nul

echo [2/2] Starting Frontend (port 5173)...
start "BlockDMS Frontend" cmd /k "cd /d %~dp0client && npm run dev"

echo.
echo ============================================
echo  System starting...
echo  Backend:  http://localhost:5000/health
echo  Frontend: http://localhost:5173
echo ============================================
echo.
echo Press any key to exit this launcher...
pause >nul
