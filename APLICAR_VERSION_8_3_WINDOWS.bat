@echo off
cd /d "%~dp0"
py -3 APLICAR_VERSION_8_3.py "%~1"
if errorlevel 1 python APLICAR_VERSION_8_3.py "%~1"
pause
