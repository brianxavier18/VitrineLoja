@echo off
title Deploy Aurora Atelie
echo ==========================================
echo   DEPLOY - AURORA ATELIE
echo ==========================================
echo.

echo [1/2] Publicando Backend (API)...
cd backend
call npx wrangler deploy
if %errorlevel% neq 0 (
    echo Erro no deploy do backend.
    pause
    exit /b
)

echo.
echo ========================================================
echo  IMPORTANTE: Copie a URL da API exibida acima!
echo  (Ex: https://aurora-atelie-backend.seu-usuario.workers.dev)
echo.
echo  Voce deve atualizar o arquivo 'frontend/js/script.js'
echo  com essa nova URL antes de continuar.
echo ========================================================
pause

cd ..

echo.
echo [2/2] Publicando Frontend (Pages)...
echo Sera criado um novo projeto 'aurora-atelie-web' no Cloudflare Pages.
call npx wrangler pages deploy frontend --project-name=aurora-atelie-web

echo.
echo ==========================================
echo   DEPLOY CONCLUIDO COM SUCESSO!
echo ==========================================
pause
