import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Button from '@/components/ui/button';
import {
  FiBook,
  FiUsers,
  FiAward,
  FiMessageCircle,
  FiVideo,
  FiTrendingUp,
  FiSearch,
  FiChevronRight,
  FiHome,
  FiCheckCircle,
  FiPlayCircle,
} from 'react-icons/fi';

const DocumentationPage = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'Todos', icon: FiBook },
    { id: 'getting-started', name: 'Começando', icon: FiPlayCircle },
    { id: 'teachers', name: 'Professores', icon: FiUsers },
    { id: 'students', name: 'Alunos', icon: FiAward },
    { id: 'schools', name: 'Escolas', icon: FiHome },
  ];

  const docs = [
    {
      category: 'getting-started',
      title: 'Introdução ao TamanduAI',
      description: 'Comece aqui: visão geral da plataforma e primeiros passos',
      icon: FiBook,
      link: '#intro',
      content: `
# Introdução ao TamanduAI

Bem-vindo ao TamanduAI! Esta plataforma educacional foi desenvolvida para facilitar o processo de ensino e aprendizagem através de ferramentas modernas e inteligentes.

## O que é TamanduAI?

TamanduAI é uma plataforma completa que oferece:
- Gestão de turmas e alunos
- Criação e correção de atividades
- Sistema anti-plágio integrado
- Chatbot educacional com IA
- Videoconferências para aulas síncronas
- Analytics e relatórios de desempenho

## Primeiros Passos

1. **Criar uma conta**: Acesse a página de cadastro e preencha seus dados
2. **Configurar perfil**: Adicione informações sobre sua instituição
3. **Criar sua primeira turma**: Organize seus alunos em turmas
4. **Convidar alunos**: Use links de convite ou envie por e-mail
5. **Criar atividades**: Comece a avaliar seus alunos

## Recursos Principais

### Para Professores
- Criação ilimitada de atividades
- Correção automática de questões objetivas
- Feedback personalizado para alunos
- Relatórios de desempenho
- Detecção de plágio

### Para Alunos
- Acesso a materiais 24/7
- Chatbot para tirar dúvidas
- Acompanhamento de notas
- Calendário de entregas
- Notificações de prazos
      `,
    },
    {
      category: 'getting-started',
      title: 'Como Criar sua Primeira Turma',
      description: 'Guia passo a passo para configurar uma turma',
      icon: FiUsers,
      link: '#create-class',
      content: `
# Como Criar sua Primeira Turma

## Passo 1: Acessar o Menu de Turmas

1. Faça login na plataforma
2. No menu lateral, clique em "Turmas"
3. Clique no botão "Nova Turma"

## Passo 2: Preencher Informações Básicas

Campos obrigatórios:
- **Nome da Turma**: Ex: "Matemática 9º Ano A"
- **Disciplina**: Selecione da lista
- **Ano Letivo**: 2025
- **Período**: Matutino, Vespertino ou Noturno

Campos opcionais:
- **Descrição**: Adicione detalhes sobre a turma
- **Cor**: Escolha uma cor para identificação visual
- **Capacidade de alunos**: Limite máximo (padrão: 50)

## Passo 3: Configurações Avançadas

- **Habilitar Chatbot**: Ative o assistente IA para esta turma
- **Co-professores**: Convide outros professores para colaborar
- **Calendário**: Configure horários de aula

## Passo 4: Convidar Alunos

Três formas de adicionar alunos:
1. **Link de convite**: Gere um link e compartilhe
2. **E-mail direto**: Envie convites individuais
3. **Upload CSV**: Adicione múltiplos alunos de uma vez

## Dicas Importantes

✅ Use nomes descritivos para facilitar a organização
✅ Configure o chatbot apenas se tiver materiais de referência
✅ Defina a capacidade máxima para evitar turmas muito grandes
✅ Adicione co-professores para dividir a carga de trabalho
      `,
    },
    {
      category: 'teachers',
      title: 'Criando Atividades',
      description: 'Como criar atividades com correção automática',
      icon: FiAward,
      link: '#activities',
      content: `
# Criando Atividades

## Tipos de Questões Suportadas

1. **Resposta Curta**: Texto breve
2. **Parágrafo**: Texto longo
3. **Múltipla Escolha**: Uma opção correta
4. **Checkboxes**: Múltiplas opções corretas
5. **Número**: Resposta numérica
6. **Data**: Resposta em formato de data

## Criando uma Atividade

### Passo 1: Informações Básicas
- Título da atividade
- Descrição detalhada
- Data de entrega
- Pontuação total
- Peso (para média ponderada)

### Passo 2: Adicionar Questões

Clique em "Adicionar Questão" e escolha o tipo:

**Para Múltipla Escolha:**
- Digite o enunciado
- Adicione as opções
- Marque a resposta correta
- Defina pontos para esta questão

**Para Checkboxes:**
- Digite o enunciado
- Adicione as opções
- Marque TODAS as respostas corretas
- Defina pontos

### Passo 3: Configurações Avançadas

**Correção Automática:**
- Ative para questões objetivas
- Cadastre as respostas corretas
- Define o gabarito

**Anti-Plágio:**
- Escolha o nível de sensibilidade (20%, 35%, 50%)
- Ative notificações
- Defina ações em caso de detecção

**Atividades em Grupo:**
- Defina tamanho dos grupos
- Monte grupos manualmente ou aleatoriamente
- Um aluno entrega por todos

### Passo 4: Publicar

- Selecione as turmas
- Escolha entre rascunho ou publicar
- Configure notificações

## Boas Práticas

✅ Use pesos maiores para atividades mais importantes
✅ Ative correção automática para economizar tempo
✅ Adicione feedback personalizado
✅ Use o preview antes de publicar
✅ Configure prazos realistas
      `,
    },
    {
      category: 'teachers',
      title: 'Sistema Anti-Plágio',
      description: 'Como funciona a detecção de plágio',
      icon: FiCheckCircle,
      link: '#plagiarism',
      content: `
# Sistema Anti-Plágio

## Como Funciona

O TamanduAI usa Winston AI para detectar plágio comparando o texto do aluno com:
- Conteúdo da internet
- Bases de dados acadêmicas
- Padrões de escrita com IA

## Configuração

### Níveis de Sensibilidade

1. **Baixo (20%)**: Notifica se similaridade > 20%
2. **Médio (35%)**: Notifica se similaridade > 35% (padrão)
3. **Alto (50%)**: Notifica se similaridade > 50%

### Como Ativar

1. Ao criar uma atividade, acesse "Configurações"
2. Marque "Habilitar verificação de plágio"
3. Escolha o nível de sensibilidade
4. Salve a atividade

## Interpretando Resultados

**Resultados são privados** - apenas você (professor) vê.

### Códigos de Cor:
- 🟢 Verde (0-20%): Baixo risco
- 🟡 Amarelo (20-35%): Atenção
- 🟠 Laranja (35-50%): Alerta
- 🔴 Vermelho (>50%): Crítico

### Ações Recomendadas

**Se detectar plágio:**
1. Revise o relatório detalhado
2. Identifique as fontes
3. Decida sobre ações:
   - Devolver para revisão
   - Solicitar reenvio
   - Aplicar penalidade
   - Conversar com o aluno

## Limitações

- Não compara entre alunos da mesma turma
- Funciona melhor com textos > 100 palavras
- Pode ter falsos positivos em citações
- Requer créditos/plano Premium para uso ilimitado

## Custo

- **Gratuito**: 10 verificações/mês
- **Premium**: Ilimitado
- **Enterprise**: Ilimitado + API access
      `,
    },
    {
      category: 'teachers',
      title: 'Chatbot Educacional',
      description: 'Treine o chatbot com materiais da turma',
      icon: FiMessageCircle,
      link: '#chatbot',
      content: `
# Chatbot Educacional

## O que é?

Um assistente virtual treinado especificamente com os materiais da sua turma. Disponível 24/7 para ajudar alunos.

## Como Funciona

### RAG (Retrieval Augmented Generation)

O chatbot não "inventa" respostas. Ele:
1. Busca informações nos materiais que você forneceu
2. Gera respostas baseadas APENAS no conteúdo encontrado
3. Cita a fonte do material usado

## Configuração

### Passo 1: Preparar Materiais

Formatos suportados:
- PDF
- DOCX
- TXT
- MD (Markdown)
- PPTX (apresentações)

### Passo 2: Upload

1. Acesse Configurações da Turma
2. Clique em "Treinar Chatbot"
3. Faça upload dos arquivos
4. Aguarde processamento (1-5 min)

### Passo 3: Testar

- Use a aba "Preview" para testar
- Faça perguntas típicas dos alunos
- Verifique a qualidade das respostas
- Ajuste os materiais se necessário

## Permissões

**Por padrão, o chatbot está DESATIVADO.**

Para ativar:
1. Vá em Configurações da Turma
2. Marque "Habilitar Chatbot"
3. Selecione quais materiais usar
4. Salve

## Monitoramento

### Analytics do Chatbot

Veja relatórios sobre:
- Perguntas mais frequentes
- Tópicos com mais dúvidas
- Materiais mais referenciados
- Horários de pico de uso

### Reportes de Alunos

Alunos podem reportar respostas inadequadas:
- Você recebe notificação
- Pode revisar a conversa
- Ajustar materiais conforme necessário

## Boas Práticas

✅ Use materiais atualizados e revisados
✅ Inclua exemplos resolvidos
✅ Organize por tópicos
✅ Teste regularmente
✅ Atualize quando adicionar conteúdo novo

❌ Não use materiais com erros
❌ Não sobrecarregue com arquivos demais
❌ Não espere que responda além do conteúdo
      `,
    },
    {
      category: 'students',
      title: 'Como Usar o TamanduAI - Alunos',
      description: 'Guia completo para alunos',
      icon: FiUsers,
      link: '#student-guide',
      content: `
# Guia do Aluno

## Acessando a Plataforma

1. **Aceite o convite** do seu professor
2. **Crie sua conta** com email e senha
3. **Complete seu perfil**

## Dashboard

### Visão Geral
- Atividades pendentes
- Próximos prazos
- Notas recentes
- Calendário de entregas

### Turmas
- Lista de turmas matriculadas
- Materiais disponíveis
- Calendário de aulas
- Chat da turma

## Enviando Atividades

### Passo 1: Acessar Atividade
1. Vá em "Atividades"
2. Clique na atividade desejada
3. Leia atentamente as instruções

### Passo 2: Responder
- Preencha todas as questões
- Anexe arquivos se necessário
- Revise suas respostas

### Passo 3: Enviar
- Clique em "Enviar"
- Confirme o envio
- Aguarde confirmação

**Importante:**
- Você pode editar até o prazo
- Após o prazo, não é possível enviar
- Guarde comprovante de envio

## Chatbot

### Como Usar

1. Acesse a aba "Chatbot"
2. Digite sua dúvida
3. Receba resposta baseada nos materiais

### Dicas
- Seja específico na pergunta
- Use palavras-chave do conteúdo
- Revise o material citado
- Se não entender, reformule

### Limitações
- Responde apenas sobre conteúdo da turma
- Não faz trabalhos por você
- Orienta, mas não dá resposta pronta

## Acompanhando Notas

### Onde Ver
- Dashboard: média geral
- Por turma: notas individuais
- Por atividade: feedback detalhado

### Exportar
- Clique em "Exportar"
- Escolha PDF ou Excel
- Baixe o relatório

## Suporte

Precisa de ajuda?
- Use o chatbot da turma
- Envie mensagem ao professor
- Acesse a Central de Ajuda
- Email: suporte@tamanduai.com
      `,
    },
    {
      category: 'schools',
      title: 'TamanduAI para Escolas',
      description: 'Gestão institucional e relatórios',
      icon: FiTrendingUp,
      link: '#schools',
      content: `
# TamanduAI para Escolas

## Plano Enterprise

### O que está incluído

- **Turmas ilimitadas**
- **Professores ilimitados**
- **Alunos ilimitados**
- **White-label** (sua marca)
- **SSO/SAML** (login único)
- **API access**
- **Suporte dedicado**
- **SLA garantido**
- **Onboarding personalizado**
- **Treinamento de equipe**

## Gestão Institucional

### Dashboard Administrativo

Visão consolidada de:
- Total de turmas e alunos
- Taxa de engajamento
- Médias por disciplina
- Professores mais ativos
- Uso de recursos (anti-plágio, chatbot)

### Relatórios

**Desempenho Acadêmico:**
- Por turma
- Por disciplina
- Por período
- Comparativos históricos

**Operacional:**
- Uso da plataforma
- Atividades criadas
- Taxa de submissão
- Tempo médio de correção

### Gestão de Professores

- Convidar professores
- Atribuir turmas
- Definir permissões
- Acompanhar produtividade

### Gestão de Alunos

- Importação em massa (CSV)
- Distribuição em turmas
- Histórico completo
- Transferências entre turmas

## Integrações

### Sistemas Acadêmicos

Conecte com:
- Google Classroom
- Microsoft Teams
- Canvas LMS
- Moodle

### Autenticação

- Active Directory
- LDAP
- SAML 2.0
- OAuth 2.0

### Exportação de Dados

- API REST
- Webhooks
- Exportação agendada
- LGPD compliance

## Segurança

### Conformidade

- **LGPD**: Totalmente conforme
- **ISO 27001**: Certificado
- **Backup**: Diário automático
- **Recuperação**: RTO < 4h

### Controles

- RLS (Row Level Security)
- Auditoria de ações
- Logs completos
- Alertas de segurança

## Onboarding

### Fase 1: Planejamento (Semana 1)
- Kickoff meeting
- Mapeamento de processos
- Definição de cronograma
- Configuração inicial

### Fase 2: Migração (Semana 2-3)
- Importação de dados
- Criação de turmas
- Cadastro de professores
- Configuração de integrações

### Fase 3: Treinamento (Semana 4)
- Workshop para coordenadores
- Treinamento para professores
- Materiais de suporte
- Suporte hands-on

### Fase 4: Go-Live (Semana 5)
- Lançamento oficial
- Suporte intensivo
- Coleta de feedback
- Ajustes finais

## Suporte

### Canais Dedicados

- **Email prioritário**: enterprise@tamanduai.com
- **Telefone 24/7**: +55 11 98765-4321
- **Slack/Teams**: Canal direto
- **Gerente de conta**: Dedicado

### SLA

- **Crítico**: Resposta em 30min
- **Alto**: Resposta em 2h
- **Médio**: Resposta em 8h
- **Baixo**: Resposta em 24h

## Contato

Interessado no plano Enterprise?

📧 vendas@tamanduai.com
📞 +55 11 3000-1234
🌐 tamanduai.com/enterprise
      `,
    },
  ];

  const filteredDocs = docs.filter((doc) => {
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-surface/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Documentação</h1>
              <p className="text-muted-foreground mt-2">
                Tudo que você precisa saber sobre o TamanduAI
              </p>
            </div>
            <Link to="/">
              <Button variant="outline">
                <FiHome className="mr-2 h-4 w-4" />
                Voltar ao Início
              </Button>
            </Link>
          </div>

          {/* Search */}
          <div className="relative max-w-2xl">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar na documentação..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-surface'
                  }`}
                >
                  <category.icon className="h-5 w-5" />
                  <span className="font-medium">{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3 space-y-6">
            {filteredDocs.map((doc, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <doc.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{doc.title}</CardTitle>
                        <p className="text-muted-foreground">{doc.description}</p>
                      </div>
                      <FiChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <details className="group">
                      <summary className="cursor-pointer text-primary font-medium flex items-center gap-2">
                        Ver conteúdo completo
                        <FiChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
                      </summary>
                      <div className="mt-4 prose prose-sm max-w-none dark:prose-invert">
                        <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                          {doc.content}
                        </pre>
                      </div>
                    </details>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {filteredDocs.length === 0 && (
              <div className="text-center py-12">
                <FiSearch className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg text-muted-foreground">
                  Nenhum documento encontrado
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Tente ajustar sua busca ou categoria
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentationPage;
