@echo off
echo 🔍 Iniciando servidor de desarrollo con logs de debug...
echo.

echo 🧹 Limpiando caches...
if exist ".angular\cache" (
    rmdir /s /q ".angular\cache"
    echo ✅ Cache de Angular limpiado
)

if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache"
    echo ✅ Cache de Node limpiado
)

echo.
echo 🚀 Iniciando servidor con force...
echo.
echo 📊 Para debuggear las funcionalidades, abre la consola del navegador (F12) y busca:
echo    🖼️ [DEBUG] - Para logs de imagen del evento
echo    🎁 [DEBUG] - Para logs de detección 2x1
echo    📊 [DEBUG] - Para logs del contador de procesadas
echo.

ng serve --force --port 4200 --host 0.0.0.0

pause 