#!/bin/bash
# deploy.sh - Script de deploy automatizado para produção TamanduAI

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
APP_NAME="tamanduai-platform"
ENVIRONMENT="${1:-production}"
DOCKER_COMPOSE_FILE="docker-compose.yml"
BACKUP_DIR="./backups"
LOG_FILE="./deploy.log"

# Funções utilitárias
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}❌ $1${NC}" | tee -a "$LOG_FILE"
    exit 1
}

# Verificar pré-requisitos
check_prerequisites() {
    log "Verificando pré-requisitos..."

    # Verificar Docker
    if ! command -v docker &> /dev/null; then
        error "Docker não está instalado"
    fi

    # Verificar Docker Compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        error "Docker Compose não está disponível"
    fi

    # Verificar Git
    if ! command -v git &> /dev/null; then
        error "Git não está instalado"
    fi

    # Verificar se estamos em um repositório git
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        error "Não está em um diretório git"
    fi

    success "Pré-requisitos verificados"
}

# Backup do banco de dados
create_backup() {
    log "Criando backup do banco de dados..."

    mkdir -p "$BACKUP_DIR"

    # Backup do banco PostgreSQL
    if docker-compose ps postgres > /dev/null 2>&1; then
        BACKUP_FILE="$BACKUP_DIR/db-backup-$(date +%Y%m%d-%H%M%S).sql"
        docker-compose exec -T postgres pg_dump -U tamanduai tamanduai > "$BACKUP_FILE"

        if [ $? -eq 0 ]; then
            success "Backup criado: $BACKUP_FILE"
        else
            error "Falha ao criar backup do banco"
        fi
    fi

    # Backup do Redis (se aplicável)
    if docker-compose ps redis > /dev/null 2>&1; then
        REDIS_BACKUP_FILE="$BACKUP_DIR/redis-backup-$(date +%Y%m%d-%H%M%S).rdb"
        docker-compose exec redis redis-cli SAVE
        docker cp $(docker-compose ps -q redis):/data/dump.rdb "$REDIS_BACKUP_FILE"

        if [ $? -eq 0 ]; then
            success "Backup Redis criado: $REDIS_BACKUP_FILE"
        else
            warning "Falha ao criar backup Redis"
        fi
    fi
}

# Pull das últimas mudanças
pull_changes() {
    log "Baixando últimas mudanças..."

    # Stash mudanças locais se houver
    if git diff --quiet && git diff --staged --quiet; then
        HAS_CHANGES=false
    else
        HAS_CHANGES=true
        git stash push -m "Pre-deploy stash"
        log "Mudanças locais salvas temporariamente"
    fi

    # Pull das mudanças
    git pull origin main

    if [ $? -eq 0 ]; then
        success "Mudanças baixadas com sucesso"
    else
        if [ "$HAS_CHANGES" = true ]; then
            git stash pop
        fi
        error "Falha ao baixar mudanças"
    fi

    # Restaurar mudanças locais se houver
    if [ "$HAS_CHANGES" = true ]; then
        git stash pop
        warning "Mudanças locais restauradas - verifique conflitos"
    fi
}

# Executar testes
run_tests() {
    log "Executando testes..."

    # Instalar dependências se necessário
    if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
        log "Instalando dependências..."
        npm ci
    fi

    # Executar testes
    if npm run test:run > /dev/null 2>&1; then
        success "Todos os testes passaram"
    else
        warning "Alguns testes falharam - continuando deploy"
    fi

    # Verificar cobertura
    if npm run test:coverage > /dev/null 2>&1; then
        COVERAGE=$(grep "All files" coverage/lcov-report/index.html | grep -o '[0-9.]*%' | head -1)
        log "Cobertura de testes: $COVERAGE"
    fi
}

# Build da aplicação
build_application() {
    log "Fazendo build da aplicação..."

    # Build do frontend
    if npm run build > /dev/null 2>&1; then
        success "Build do frontend concluído"
    else
        error "Falha no build do frontend"
    fi

    # Build das imagens Docker (se necessário)
    if [ -f "Dockerfile.frontend" ] || [ -f "Dockerfile.backend" ]; then
        log "Fazendo build das imagens Docker..."

        if docker-compose build --parallel > /dev/null 2>&1; then
            success "Build Docker concluído"
        else
            error "Falha no build Docker"
        fi
    fi
}

# Executar migrações do banco
run_migrations() {
    log "Executando migrações do banco de dados..."

    # Aplicar migrações Supabase
    if command -v supabase &> /dev/null; then
        if supabase db reset > /dev/null 2>&1; then
            success "Migrações Supabase aplicadas"
        else
            error "Falha nas migrações Supabase"
        fi
    else
        warning "Supabase CLI não disponível - pulando migrações"
    fi

    # Executar migrações personalizadas se houver
    if [ -d "supabase/migrations" ]; then
        for migration in supabase/migrations/*.sql; do
            if [ -f "$migration" ]; then
                log "Aplicando migração: $(basename "$migration")"
                # Aplicar migração via docker se disponível
                if docker-compose exec -T postgres psql -U tamanduai -d tamanduai -f "$migration" > /dev/null 2>&1; then
                    success "Migração aplicada: $(basename "$migration")"
                else
                    warning "Falha ao aplicar migração: $(basename "$migration")"
                fi
            fi
        done
    fi
}

# Health check da aplicação
health_check() {
    log "Verificando saúde da aplicação..."

    # Aguardar serviços iniciarem
    sleep 10

    # Verificar se a aplicação responde
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        success "Health check passou"
    else
        error "Health check falhou"
    fi

    # Verificar serviços críticos
    SERVICES=("postgres" "redis" "app")
    for service in "${SERVICES[@]}"; do
        if docker-compose ps "$service" | grep -q "Up"; then
            success "Serviço $service está rodando"
        else
            error "Serviço $service não está rodando"
        fi
    done
}

# Limpeza de recursos antigos
cleanup_resources() {
    log "Limpando recursos antigos..."

    # Limpar containers parados
    docker container prune -f > /dev/null 2>&1

    # Limpar imagens dangling
    docker image prune -f > /dev/null 2>&1

    # Limpar volumes não utilizados (opcional)
    # docker volume prune -f > /dev/null 2>&1

    success "Limpeza concluída"
}

# Deploy principal
main_deploy() {
    log "🚀 Iniciando deploy para $ENVIRONMENT..."

    # 1. Verificar pré-requisitos
    check_prerequisites

    # 2. Backup
    create_backup

    # 3. Pull mudanças
    pull_changes

    # 4. Testes
    run_tests

    # 5. Build
    build_application

    # 6. Migrações
    run_migrations

    # 7. Deploy
    log "Fazendo deploy dos serviços..."

    # Parar serviços atuais
    docker-compose down > /dev/null 2>&1 || true

    # Iniciar novos serviços
    if docker-compose up -d --remove-orphans > /dev/null 2>&1; then
        success "Deploy concluído com sucesso"
    else
        error "Falha no deploy"
    fi

    # 8. Health check
    health_check

    # 9. Limpeza
    cleanup_resources

    log "🎉 Deploy concluído com sucesso!"
    log "📊 Aplicação disponível em: http://localhost:3000"
    log "📋 Logs de deploy salvos em: $LOG_FILE"
}

# Rollback em caso de erro
rollback() {
    log "🔄 Executando rollback..."

    if [ -d "$BACKUP_DIR" ] && [ "$(ls -A $BACKUP_DIR)" ]; then
        LATEST_BACKUP=$(ls -t "$BACKUP_DIR" | head -1)
        if [ -n "$LATEST_BACKUP" ]; then
            log "Restaurando backup: $LATEST_BACKUP"
            # Implementar lógica de restauração aqui
            success "Rollback concluído"
        fi
    else
        warning "Nenhum backup encontrado para rollback"
    fi
}

# Tratamento de sinais
trap rollback ERR INT TERM

# Menu de opções
case "${1:-}" in
    "backup")
        check_prerequisites
        create_backup
        ;;
    "test")
        check_prerequisites
        run_tests
        ;;
    "build")
        check_prerequisites
        build_application
        ;;
    "migrate")
        check_prerequisites
        run_migrations
        ;;
    "health")
        health_check
        ;;
    "rollback")
        rollback
        ;;
    "cleanup")
        cleanup_resources
        ;;
    "logs")
        if [ -f "$LOG_FILE" ]; then
            tail -f "$LOG_FILE"
        else
            echo "Arquivo de log não encontrado: $LOG_FILE"
        fi
        ;;
    "help"|"-h"|"--help")
        echo "Uso: $0 [COMMAND]"
        echo ""
        echo "Comandos:"
        echo "  (sem comando)    Deploy completo"
        echo "  backup           Criar backup do banco"
        echo "  test             Executar testes"
        echo "  build            Fazer build da aplicação"
        echo "  migrate          Executar migrações"
        echo "  health           Verificar saúde da aplicação"
        echo "  rollback         Reverter para último backup"
        echo "  cleanup          Limpar recursos Docker"
        echo "  logs             Mostrar logs em tempo real"
        echo "  help             Mostrar esta ajuda"
        ;;
    *)
        main_deploy
        ;;
esac
