@echo off
echo 🚀 Iniciando TamanduAI Platform (Desenvolvimento)
echo ================================================

echo.
echo 📋 Verificando Docker Compose...
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose não encontrado. Instale o Docker Desktop.
    pause
    exit /b 1
)

echo.
echo ⚙️  Arquivo .env configurado...
echo 📝 Configure as variáveis no arquivo .env antes de continuar:
echo    - SUPABASE_URL e SUPABASE_ANON_KEY
echo    - UPSTASH_REDIS_URL (opcional para desenvolvimento)
echo.

echo 🚀 Iniciando serviços essenciais...
echo   - Frontend (React/Vite)
echo   - Nginx (proxy reverso)
echo   - Python Dashboards (monitoramento)
echo   - Prometheus (métricas)
echo.

docker-compose up -d

if errorlevel 1 (
    echo ❌ Erro ao iniciar serviços
    echo 📝 Verifique se todas as variáveis obrigatórias estão configuradas no .env
    pause
    exit /b 1
)

echo.
echo ✅ Serviços iniciados com sucesso!
echo.
echo 🌐 URLs disponíveis:
echo   - Aplicação: http://localhost:3000
echo   - Dashboards: http://localhost:8050
echo   - Prometheus: http://localhost:9090
echo.
echo 📊 Configure .env com suas credenciais reais para funcionalidade completa
echo 🛑 Para parar: docker-compose down
echo.

timeout /t 5
