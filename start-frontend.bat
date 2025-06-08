@echo off
echo ========================================
echo  INICIANDO RECITAPP FRONTEND
echo ========================================

echo.
echo Verificando dependencias...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Fallo en la instalacion de dependencias
    pause
    exit /b 1
)

echo.
echo Iniciando aplicacion Angular...
echo URL: http://localhost:4200
echo Configuracion de notificaciones: http://localhost:4200/notifications/settings
echo.

call ng serve --open

pause 