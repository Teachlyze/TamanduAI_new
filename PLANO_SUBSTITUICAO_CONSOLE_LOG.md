# 📝 Plano de Substituição de console.log por Sistema de Log do Banco

## 🎯 Objetivo

Substituir todos os `console.log`, `console.error`, `console.warn` por chamadas ao `logService` que grava no banco de dados (tabela `logger`).

## 📊 Status Atual

### Estatísticas
- **Total de console.* encontrados:** ~390 ocorrências
- **Arquivos afetados:** ~55 arquivos em `/src/services`
- **Tabela logger:** ✅ Migration criada (`20250119110000_create_logger_table.sql`)
- **LogService:** ✅ Criado (`src/services/logService.js`)

### Top 10 Arquivos com Mais console.*

1. `backupManager.js` - 24 ocorrências
2. `classService.js` - 23 ocorrências
3. `apiSupabase.js` - 18 ocorrências
4. `authEdge.js` - 14 ocorrências
5. `chatbotEdge.js` - 14 ocorrências
6. `schoolService.js` - 13 ocorrências
7. `submissionService.js` - 12 ocorrências
8. `agoraClassroomAPI.js` - 11 ocorrências
9. `analyticsMLService.js` - 11 ocorrências
10. `apiSupabaseWithCache.js` - 11 ocorrências

---

## 🔧 Migration Criada

**Arquivo:** `supabase/migrations/20250119110000_create_logger_table.sql`

**Schema da tabela `logger`:**
```sql
CREATE TABLE public.logger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level TEXT NOT NULL CHECK (level IN ('info', 'warn', 'error', 'debug')),
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  error_stack TEXT,
  error_name TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Políticas RLS:**
- ✅ Admins podem ler todos os logs
- ✅ Usuários podem ler seus próprios logs
- ✅ Todos (autenticados e anônimos) podem inserir logs
- ✅ Apenas admins podem deletar logs

**Função de Limpeza:**
- `clean_old_logs()` - Remove logs com mais de 90 dias

---

## 🛠️ Como Usar o LogService

### 1. Import

```javascript
import logService from '@/services/logService';
```

### 2. Substituições

#### Antes (console.log):
```javascript
console.log('Turma criada:', classData);
```

#### Depois (logService):
```javascript
await logService.info('Turma criada', { 
  classId: classData.id,
  className: classData.name 
});
```

#### Antes (console.error):
```javascript
console.error('Erro ao criar turma:', error);
```

#### Depois (logService):
```javascript
await logService.error('Erro ao criar turma', {
  classData
}, error);
```

#### Antes (console.warn):
```javascript
console.warn('Atenção: capacidade da turma excedida');
```

#### Depois (logService):
```javascript
await logService.warn('Capacidade da turma excedida', {
  currentSize: students.length,
  capacity: classData.capacity
});
```

### 3. Logs com Contexto

```javascript
// Em vez de:
console.log('Processando atividade', activity.id);

// Use:
await logService.info('Processando atividade', {
  activityId: activity.id,
  activityType: activity.type,
  classId: activity.class_id,
  teacherId: activity.created_by
});
```

---

## 📋 Prioridades de Substituição

### Prioridade 1 (CRÍTICO) - Funções de Autenticação e Autorização
- [x] `CreateClassroomForm.jsx` - FEITO
- [ ] `authEdge.js`
- [ ] `schoolService.js`
- [ ] `classService.js`
- [ ] `userService.js`

### Prioridade 2 (ALTO) - Operações Principais
- [ ] `submissionService.js`
- [ ] `gradingService.js`
- [ ] `gamificationService.js`
- [ ] `questionBankService.js`
- [ ] `analyticsMLService.js`

### Prioridade 3 (MÉDIO) - Integrações
- [ ] `chatbotEdge.js`
- [ ] `notificationEdge.js`
- [ ] `plagiarismEdge.js`
- [ ] `agoraClassroomAPI.js`
- [ ] `meetingService.js`

### Prioridade 4 (BAIXO) - Utilitários
- [ ] `backupManager.js`
- [ ] `apiSupabase.js`
- [ ] `cacheService.js`
- [ ] `performanceOptimizer.jsx`
- [ ] `rateLimiter.js`

---

## ✅ Benefícios

### 1. Rastreabilidade
- ✅ Todos os logs gravados no banco
- ✅ Associados ao usuário que executou a ação
- ✅ Timestamp preciso
- ✅ Metadata estruturada (JSON)

### 2. Debugging
- ✅ Buscar logs por nível (`info`, `warn`, `error`, `debug`)
- ✅ Buscar logs por usuário
- ✅ Buscar logs por período
- ✅ Stack trace completo em erros

### 3. Monitoramento
- ✅ Dashboard de logs (a criar)
- ✅ Alertas automáticos em erros críticos (a implementar)
- ✅ Estatísticas de erros por módulo
- ✅ Histórico completo de ações

### 4. Segurança
- ✅ Dados sensíveis sanitizados automaticamente
- ✅ RLS garante privacidade dos logs
- ✅ Auditoria completa de ações

---

## 🚀 Aplicar Migration

```bash
cd c:\Users\Pedro\Documents\Programacao\tamanduai-new
npx supabase db push --include-all
```

---

## 📊 Exemplo Completo - schoolService.js

### Antes

```javascript
export const getSchoolData = async (schoolId) => {
  try {
    const { data, error } = await supabase
      .from('schools')
      .select('*')
      .eq('id', schoolId)
      .single();
    
    if (error) {
      console.error('Erro ao buscar escola:', error);
      throw error;
    }
    
    console.log('Escola encontrada:', data.name);
    return data;
  } catch (error) {
    console.error('Erro crítico:', error);
    throw error;
  }
};
```

### Depois

```javascript
import logService from '@/services/logService';

export const getSchoolData = async (schoolId) => {
  try {
    await logService.debug('Buscando dados da escola', { schoolId });
    
    const { data, error } = await supabase
      .from('schools')
      .select('*')
      .eq('id', schoolId)
      .single();
    
    if (error) {
      await logService.error('Erro ao buscar escola', { schoolId }, error);
      throw error;
    }
    
    await logService.info('Escola encontrada', { 
      schoolId,
      schoolName: data.name 
    });
    
    return data;
  } catch (error) {
    await logService.error('Erro crítico ao buscar escola', { schoolId }, error);
    throw error;
  }
};
```

---

## 📝 Checklist de Implementação

### Fase 1: Infraestrutura ✅
- [x] Criar migration da tabela logger
- [x] Criar LogService
- [x] Configurar RLS policies
- [x] Testar logService básico

### Fase 2: Substituição (EM ANDAMENTO)
- [x] CreateClassroomForm.jsx
- [ ] schoolService.js (0/13)
- [ ] classService.js (0/23)
- [ ] authEdge.js (0/14)
- [ ] userService.js (0/10)
- [ ] Demais arquivos (~330 ocorrências)

### Fase 3: Dashboard de Logs (FUTURO)
- [ ] Criar página de visualização de logs
- [ ] Filtros por nível, usuário, data
- [ ] Gráficos de erros por módulo
- [ ] Export de logs (CSV/JSON)

### Fase 4: Alertas (FUTURO)
- [ ] Notificação para admins em erros críticos
- [ ] Email diário com resumo de erros
- [ ] Webhook para Slack/Discord

---

## 📊 Progresso Atual

**Arquivos Migrados:** 1/55 (2%)  
**Console.* Substituídos:** ~3/390 (1%)  
**Migration Aplicada:** ⚠️ **PENDENTE**

---

## 🎯 Próximos Passos

1. ✅ Aplicar migration do logger
2. ⏳ Substituir schoolService.js
3. ⏳ Substituir classService.js
4. ⏳ Substituir authEdge.js
5. ⏳ Continuar demais services

---

**Data:** 19/01/2025  
**Status:** 🟡 EM ANDAMENTO (2% completo)  
**Próxima Ação:** Aplicar migration e começar substituições em massa
