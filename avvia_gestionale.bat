@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo   Avvio T-Shirt Gestionale (Self-Hosted)
echo ==========================================
echo.

cd /d "%~dp0"

echo [1/2] Sincronizzazione Frontend...
cd frontend
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo Errore durante la build del frontend!
    pause
    exit /b %ERRORLEVEL%
)
cd ..

echo.
echo [2/2] Avvio del server unificato (Porta 3001)
echo.
echo Il sistema sara accessibile a:
echo - Locale:   http://localhost:3001
echo - Rete:     http://192.168.1.234:3001
echo - Pubblico: https://lellofratm.duckdns.org
echo.
echo Assicurati che Caddy sia in esecuzione con il Caddyfile fornito.
echo.

cd backend
node server.js

pause
