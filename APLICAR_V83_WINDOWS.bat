@echo off
cd /d "%~dp0"
where py >nul 2>&1 && (py -3 aplicar_atualizacao.py && goto :end)
where python >nul 2>&1 && (python aplicar_atualizacao.py && goto :end)
echo Python nao encontrado. Instale Python ou aplique manualmente conforme INSTRUCOES.txt
:end
pause
