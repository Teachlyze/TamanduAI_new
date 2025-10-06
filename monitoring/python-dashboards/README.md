# 🐍 Python Dashboards - Sistema de Monitoramento Customizado

Este documento explica o sistema de dashboards Python desenvolvido para a plataforma TamanduAI, substituindo o Grafana por uma solução mais flexível e personalizável.

## 📊 Visão Geral

Os dashboards Python utilizam:
- **Dash**: Framework web Python para criação de dashboards interativos
- **Plotly**: Biblioteca de visualização de dados avançada
- **Pandas**: Manipulação e análise de dados
- **Redis**: Cache e métricas em tempo real
- **PostgreSQL**: Dados históricos e análises

## 🚀 Funcionalidades

### ✅ Recursos Implementados

#### **Métricas em Tempo Real**
- Atualização automática a cada 30 segundos
- Dados de performance da API
- Estatísticas de usuários ativos
- Taxa de sucesso das operações

#### **Visualizações Interativas**
- Gráficos com zoom e navegação
- Filtros dinâmicos
- Múltiplas séries temporais
- Indicadores visuais de status

#### **Monitoramento de Saúde**
- Health checks automáticos
- Status de todos os serviços
- Logs em tempo real
- Alertas configuráveis

## 🏗️ Arquitetura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Dash App      │───▶│   Plotly        │───▶│   Frontend      │
│   (Python)      │    │   Charts        │    │   (React)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Redis         │    │  PostgreSQL     │    │   Prometheus    │
│   (Cache)       │    │   (Dados)       │    │   (Métricas)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 Estrutura de Arquivos

```
monitoring/python-dashboards/
├── Dockerfile              # Container configuration
├── requirements.txt        # Python dependencies
├── app.py                  # Main Dash application
└── README.md              # This file
```

## 🔧 Configuração

### Variáveis de Ambiente

```bash
# Conexões de banco de dados
POSTGRES_HOST=your-postgres-host
POSTGRES_PORT=5432
POSTGRES_DB=your-database
POSTGRES_USER=your-user
POSTGRES_PASSWORD=your-password

# Redis para métricas
REDIS_HOST=redis
REDIS_PASSWORD=your-redis-password

# Configurações do dashboard
DASHBOARD_PORT=8050
```

### Instalação de Dependências

```bash
cd monitoring/python-dashboards
pip install -r requirements.txt
```

## 🚀 Executando Localmente

### Desenvolvimento
```bash
cd monitoring/python-dashboards
python app.py
```

### Produção (Docker)
```bash
docker-compose up python-dashboards -d
```

## 📊 Dashboards Disponíveis

### 1. **Visão Geral da Plataforma**
- **URL**: `/`
- **Métricas**:
  - Usuários ativos
  - Taxa de sucesso
  - Tempo médio de resposta
  - Status do sistema

### 2. **Performance da API**
- **URL**: `/performance`
- **Gráficos**:
  - Tempo de resposta (última hora)
  - Throughput de requests
  - Taxa de erro por endpoint
  - Latência P95/P99

### 3. **Banco de Dados**
- **URL**: `/database`
- **Métricas**:
  - Conexões ativas
  - Queries lentas
  - Uso de índices
  - Tamanho das tabelas

### 4. **Logs e Erros**
- **URL**: `/logs`
- **Funcionalidades**:
  - Logs em tempo real
  - Filtros por nível (ERROR, WARN, INFO)
  - Busca por texto
  - Exportação de logs

## 🔧 Personalização

### Adicionando Novos Gráficos

```python
# Exemplo de novo gráfico
fig = go.Figure()
fig.add_trace(go.Scatter(
    x=df['timestamp'],
    y=df['metric_value'],
    mode='lines+markers',
    name='Nova Métrica'
))

app.layout.children.append(dcc.Graph(figure=fig))
```

### Conectando Novas Fontes de Dados

```python
# Conexão com API externa
def get_external_metrics():
    response = requests.get('https://api.externa.com/metrics')
    return response.json()

# Integração no callback
@app.callback(
    Output('external-metrics-graph', 'figure'),
    [Input('interval-component', 'n_intervals')]
)
def update_external_metrics(n):
    data = get_external_metrics()
    # Processar e visualizar dados
    return create_figure(data)
```

### Configurando Alertas

```python
# Sistema de alertas personalizado
def check_alerts():
    if error_rate > 5:
        send_notification("Erro rate alto detectado!")
    if response_time > 1000:
        send_notification("Performance degradada!")

# Integrar com callback
@app.callback(
    Output('alerts-panel', 'children'),
    [Input('interval-component', 'n_intervals')]
)
def update_alerts(n):
    alerts = check_alerts()
    return display_alerts(alerts)
```

## 🔗 Integrações

### Prometheus
```python
from prometheus_client.parser import text_string_to_metric_families

def get_prometheus_metrics():
    # Coletar métricas do Prometheus
    response = requests.get('http://prometheus:9090/metrics')
    return text_string_to_metric_families(response.text)
```

### Redis
```python
import redis

redis_client = redis.Redis(host='redis', password='password')

# Coletar métricas do Redis
active_users = redis_client.scard('active_users')
cache_hits = redis_client.get('cache:hits')
```

### PostgreSQL
```python
import psycopg2

conn = psycopg2.connect("connection_string")
cursor = conn.cursor()

# Queries para métricas
cursor.execute("SELECT COUNT(*) FROM users WHERE active = true")
active_users = cursor.fetchone()[0]
```

## 📈 Melhores Práticas

### Performance
- Use cache para dados que não mudam frequentemente
- Implemente paginação para grandes conjuntos de dados
- Otimize queries de banco de dados
- Use WebSockets para atualizações em tempo real

### Segurança
- Sanitização de dados de entrada
- Validação de tipos de dados
- Tratamento de erros seguro
- Logs sem exposição de dados sensíveis

### UX/UI
- Design responsivo para mobile e desktop
- Feedback visual para ações do usuário
- Loading states para operações assíncronas
- Navegação intuitiva entre dashboards

## 🚨 Troubleshooting

### Problemas Comuns

**Dashboard não carrega:**
```bash
# Verificar logs
docker-compose logs python-dashboards

# Testar conectividade
curl http://localhost:8050/health
```

**Dados não atualizam:**
```bash
# Verificar intervalos de atualização
# Ajustar n_intervals no código se necessário

# Verificar conexões de banco
docker-compose exec python-dashboards python -c "import redis; print('Redis OK')"
```

**Gráficos com erro:**
```bash
# Verificar formato dos dados
# Usar try/except nos callbacks
# Implementar fallbacks para dados vazios
```

## 🔮 Próximos Passos

### Funcionalidades Planejadas
- [ ] Sistema de alertas via email/Slack
- [ ] Dashboards específicos por usuário (admin/teacher/student)
- [ ] Exportação de relatórios em PDF
- [ ] Machine learning para detecção de anomalias
- [ ] Integração com ferramentas de BI externas

### Melhorias de Performance
- [ ] Cache inteligente com Redis
- [ ] Compressão de dados históricos
- [ ] Otimização de queries complexas
- [ ] Load balancing para múltiplas instâncias

---

*Este sistema oferece flexibilidade total para criar dashboards personalizados que atendam exatamente às necessidades da plataforma TamanduAI.*
