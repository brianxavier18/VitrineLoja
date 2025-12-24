@echo off
title Setup Aurora Atelie
echo ==========================================
echo   CONFIGURACAO INICIAL - AURORA ATELIE
echo ==========================================
echo.

cd backend

echo [1/5] Instalando dependencias...
call npm install
if %errorlevel% neq 0 (
    echo Erro ao instalar dependencias. Verifique se o Node.js esta instalado.
    pause
    exit /b
)

echo.
echo [2/5] Verificando login Cloudflare...
call npx wrangler whoami
if %errorlevel% neq 0 (
    echo.
    echo Voce nao esta logado. O navegador sera aberto para autenticacao.
    call npx wrangler login
)

echo.
echo [3/5] Criando Banco de Dados D1 (aurora-db)...
call npx wrangler d1 create aurora-db
echo.
echo ========================================================
echo  ATENCAO: Copie o 'database_id' exibido acima!
echo  1. Abra o arquivo 'backend/wrangler.toml'
echo  2. Cole o ID no campo 'database_id'
echo  3. Salve o arquivo e volte aqui.
echo ========================================================
pause

echo.
echo [4/5] Criando Bucket R2 (aurora-images)...
call npx wrangler r2 bucket create aurora-images

echo.
echo [5/5] Criando tabelas no banco de dados...
call npx wrangler d1 execute aurora-db --file=schema.sql --remote

echo.
echo ==========================================
echo   CONFIGURACAO CONCLUIDA!
echo ==========================================
echo Agora execute o arquivo 'deploy_project.bat' para colocar o site no ar.
pause
