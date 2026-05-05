@echo off
cd /d "%~dp0"
echo Starting AI Career OS...
echo.
npm.cmd run dev -- --host 0.0.0.0 --port 5176 --strictPort
echo.
echo Server stopped. Press any key to close this window.
pause >nul
