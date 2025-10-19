import React, { useState, useMemo } from 'react';
import Seo from '@/components/Seo';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Search, ChevronRight, Home, Users, GraduationCap, Video, 
  MessageSquare, Settings, BarChart3, Shield, Zap, CheckCircle2, Code, 
  Lightbulb, FileText, Clock, Award, Brain, Database, Lock, Globe,
  Smartphone, Gamepad2, ChartBar, Bell, Calendar, Download, Upload,
  Eye, Edit, Trash2, Plus, Check, X, AlertCircle, Info, HelpCircle,
  ArrowRight, ExternalLink, Copy, PlayCircle, Sparkles, Target, TrendingUp,
  Trophy,
  Building2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const DocumentationPagePremium = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState('intro');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchHistory, setSearchHistory] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState(null);

  // Seções da documentação
  const sections = [
    {
      id: 'intro',
      title: 'Introdução',
      icon: Home,
      category: 'Início',
      content: {
        title: '👋 Bem-vindo ao TamanduAI',
        description: 'A plataforma educacional mais completa e moderna do Brasil',
        items: [
          {
            title: 'O que é TamanduAI?',
            content: 'TamanduAI é a primeira plataforma educacional brasileira que combina IA avançada (RAG, ML, NLP), gamificação completa, gestão de turmas, criação de atividades com correção automática, sistema anti-plágio, videoconferências, chatbot inteligente que aprende com seus materiais, banco de questões colaborativo e analytics com 4 modelos de Machine Learning. Tudo em uma única solução integrada e 100% em português.',
            list: [
              'IA Proprietária: RAG v2.0 + GPT-4o fine-tuned para educação',
              'Gamificação: XP, 16 níveis, 50+ badges, missões customizadas',
              'Anti-Plágio: Winston AI com 100 verificações/hora',
              'Analytics ML: K-Means, PCA, Análise de Sentimento, Predição',
              'Banco Colaborativo: 10.000+ questões + descontos até 30%',
              'Videoconferências: Agora.io + gravação automática',
              'Segurança: 100% LGPD compliant + criptografia end-to-end'
            ]
          },
          {
            title: '🎯 Diferenciais Únicos (Não Existem em Nenhum Concorrente)',
            list: [
              'Chatbot RAG: IA que aprende com SEU material didático (PDFs, slides, links)',
              'Programa de Descontos: Ganhe até 30% off contribuindo questões',
              'ML Avançado: 4 modelos de IA para insights que ninguém mais oferece',
              'Gamificação Completa: Sistema de XP mais robusto do mercado educacional',
              'Anti-Plágio Duplo: Detecta plágio de internet E conteúdo gerado por IA',
              'Analytics Preditivo: Prevê risco de reprovação com 85% de precisão',
              'Flywheel de Valor: Quanto mais professores usam, melhor fica para todos',
              'Suporte Brasileiro: Time local, em português, que entende sua realidade'
            ]
          },
          {
            title: '👥 Para Quem é o TamanduAI?',
            list: [
              '👨‍🏫 Professores Independentes: De qualquer matéria, ensino fundamental ao superior',
              '👩‍🎓 Professores de Escolas: Integrado com gestão escolar completa',
              '🏫 Escolas Pequenas: 50-200 alunos, gestão simples e eficiente',
              '🏛️ Escolas Médias/Grandes: 200-2000+ alunos, relatórios executivos',
              '🎓 Instituições de Ensino Superior: Cursos livres, EAD, graduação',
              '📚 Cursos Preparatórios: ENEM, vestibulares, concursos',
              '🌐 Ensino EAD: 100% online ou híbrido',
              '🧑‍💼 Coordenadores e Diretores: Dashboard administrativo completo'
            ]
          },
          {
            title: '🔒 Segurança e Privacidade (Prioridade #1)',
            content: 'Levamos MUITO a sério a proteção dos seus dados e dos seus alunos. Somos 100% compatíveis com LGPD e seguimos as melhores práticas internacionais de segurança.',
            list: [
              'Criptografia AES-256 em repouso e TLS 1.3 em trânsito',
              'Servidores no Brasil (AWS São Paulo) para conformidade LGPD',
              'Backups automáticos diários + retenção de 30 dias',
              'Autenticação de 2 fatores (2FA) obrigatória para admins',
              'Logs de auditoria completos (quem acessou o quê e quando)',
              'Professores têm controle 100% dos dados de seus alunos',
              'Dados NUNCA compartilhados com terceiros (zero ads)',
              'Certificações: ISO 27001, SOC 2 Type II (em processo)',
              'DPO dedicado: dpo@tamanduai.com',
              'Direito de portabilidade: exporte seus dados a qualquer momento'
            ]
          },
          {
            title: '💰 Modelo de Preços Transparente',
            content: 'Programa Beta ativo: 3 meses GRÁTIS com acesso completo. Depois, a partir de R$ 49/mês. Sem surpresas, sem taxas ocultas.',
            list: [
              'Beta (3 meses): R$ 0 - Acesso completo a tudo',
              'Pro: R$ 49/mês - Ideal para professores independentes',
              'Escola Pequena: R$ 199/mês - Até 200 alunos',
              'Escola Média: R$ 499/mês - Até 1000 alunos',
              'Enterprise: Custom - Ilimitado + personalização',
              'Desconto Anual: 2 meses grátis (pague 10, use 12)',
              'Desconto Colaborativo: Até 30% contribuindo questões',
              'Garantia: 30 dias para cancelar e receber reembolso total'
            ]
          }
        ]
      }
    },
    {
      id: 'getting-started',
      title: 'Primeiros Passos',
      icon: Zap,
      category: 'Início',
      content: {
        title: '🚀 Começando com TamanduAI',
        description: 'Guia completo passo-a-passo para começar em 15 minutos',
        items: [
          {
            title: 'Passo 1: Criar uma Conta (2 min)',
            content: 'Acesse tamanduai.com/register. Preencha: nome completo, email válido (será usado para login), senha forte (mínimo 8 caracteres, letras + números). Escolha seu perfil: Professor (cria turmas e atividades), Aluno (participa de turmas), Escola (gerencia professores e turmas).',
            code: `// Endpoint de registro
POST https://api.tamanduai.com/auth/register
{
  "name": "João Silva",
  "email": "joao@escola.com",
  "password": "senha123",
  "role": "teacher" // ou "student", "school"
}`,
            list: [
              'Email único (não pode ter 2 contas com mesmo email)',
              'Senha segura (mix de maiúsculas, minúsculas, números)',
              'Role correto (não pode mudar depois)',
              'Termos de uso e privacidade (leia!)'
            ]
          },
          {
            title: 'Passo 2: Confirmar Email (1 min)',
            content: 'Verifique sua caixa de entrada (e pasta de spam). Clique no link de confirmação que enviamos. IMPORTANTE: Sem confirmação, você não pode criar turmas ou atividades (segurança LGPD).',
            list: [
              'Email chega em até 2 minutos',
              'Link válido por 24 horas',
              'Não recebeu? Clique em "Reenviar Confirmação"',
              'Verifique spam/lixo eletrônico',
              'Adicione noreply@tamanduai.com aos contatos'
            ]
          },
          {
            title: 'Passo 3: Completar Perfil (3 min)',
            content: 'Vá em Configurações > Editar Perfil. Adicione: foto de perfil (jpg/png até 5MB), instituição de ensino, matérias que leciona (pode selecionar múltiplas), bio curta (até 200 caracteres), telefone opcional. Quanto mais completo, melhor a personalização da IA.',
            list: [
              'Foto: Aparece em chats, atividades, ranking',
              'Instituição: Conecta você com outros da mesma escola',
              'Matérias: IA sugere questões relevantes',
              'Bio: Alunos veem no seu perfil',
              'Telefone: Opcional, para suporte emergencial'
            ]
          },
          {
            title: 'Passo 4: Criar Primeira Turma (3 min) - PROFESSOR',
            content: 'Menu lateral > Turmas > Nova Turma. Preencha: nome único (ex: "Matemática 9A"), matéria (selecione da lista), ano letivo (2024, 2025...), descrição opcional (aparece para alunos), cor personalizada (para identificação visual rápida). Clique em "Criar Turma".',
            code: `// Exemplo de turma
{
  name: "Matemática 9A",
  subject: "Matemática",
  grade_level: "9º ano",
  academic_year: 2024,
  description: "Foco em Álgebra e Geometria",
  color: "#6366f1", // Azul índigo
  max_students: 40 // Opcional
}`,
            list: [
              'Nome: Seja descritivo (matéria + turma + período)',
              'Matéria: Afeta sugestões de questões da IA',
              'Ano: Organiza turmas por período',
              'Cor: Ajuda a identificar rapidamente',
              'Limite: Opcional (padrão: ilimitado no Beta)'
            ]
          },
          {
            title: 'Passo 5: Convidar Alunos (2 min)',
            content: 'Dentro da turma criada, vá em "Membros" > "Convidar". Copie o código de 6 dígitos (ex: ABC123) ou link direto. Compartilhe com alunos por WhatsApp, email, ou projete na sala. Alunos entram digitando o código em tamanduai.com/join-class.',
            list: [
              'Código expira em 7 dias (renovável com 1 clique)',
              'Link direto: Válido permanentemente',
              'Alunos recebem notificação ao entrar',
              'Você vê log de entrada/saída de membros',
              'Pode remover alunos a qualquer momento',
              'Defina permissões: admin, monitor, aluno regular'
            ]
          },
          {
            title: 'Passo 6: Criar Primeira Atividade (4 min)',
            content: 'Atividades > Nova Atividade. Escolha tipo: Trabalho (resposta em texto/upload), Quiz (múltipla escolha, correção automática), Prova (mista), Projeto (múltiplos arquivos). Defina: título, descrição detalhada, prazo (data + hora), pontuação máxima, turmas que receberão.',
            list: [
              'Trabalho: Melhor para redações, análises, dissertativas',
              'Quiz: Ideal para fixação rápida, correção instantânea',
              'Prova: Mix de objetiva + dissertativa, tempo limitado',
              'Projeto: Para trabalhos grandes, em grupo',
              'Sempre adicione descrição clara do que espera',
              'Prazo: Considere fuso horário dos alunos'
            ]
          },
          {
            title: 'Passo 7: Configurar Correção Automática (opcional)',
            content: 'Para quizzes: Correção é automática. Para trabalhos: Vá em Configurações da Atividade > Ativar "Correção com IA". Defina critérios (ortografia 20%, conteúdo 50%, argumentação 30%). IA gera nota sugerida + feedback, você revisa e aprova.',
            list: [
              'IA economiza 70% do seu tempo de correção',
              'Você SEMPRE revisa antes de publicar nota',
              'Feedback automático é detalhado e construtivo',
              'Pode desativar IA e corrigir 100% manual',
              'IA melhora com suas correções (aprende seu estilo)'
            ]
          },
          {
            title: 'Passo 8: Explorar Dashboard (2 min)',
            content: 'Familiarize-se com: estatísticas de desempenho (cards no topo), atividades pendentes de correção (lista central), calendário de eventos (sidebar), notificações (sino), ranking de alunos (link rápido), analytics ML (gráficos avançados).',
            list: [
              'Dashboard atualiza em tempo real',
              'Clique nos cards para drill-down',
              'Gráficos são interativos (hover para detalhes)',
              'Exportação de qualquer relatório (PDF/Excel)',
              'Personalize layout: arraste e solte widgets'
            ]
          },
          {
            title: '✅ Checklist Final - Você está pronto se:',
            list: [
              '✔️ Email confirmado',
              '✔️ Perfil completo com foto',
              '✔️ Pelo menos 1 turma criada',
              '✔️ Pelo menos 1 aluno na turma',
              '✔️ 1 atividade criada e publicada',
              '✔️ Dashboard familiarizado',
              '✔️ Explorou configurações básicas'
            ]
          },
          {
            title: '🎓 Próximos Passos Recomendados',
            list: [
              'Upload material didático para chatbot RAG (Configurações > Chatbot)',
              'Explorar Banco de Questões (Recursos > Banco)',
              'Configurar notificações (Configurações > Notificações)',
              'Criar primeira missão de gamificação (Missões > Nova)',
              'Ver analytics avançado (Analytics > ML)',
              'Assistir vídeos tutoriais (Help > Vídeos)',
              'Convidar colegas professores (Ganhe bônus XP)'
            ]
          }
        ]
      }
    },
    {
      id: 'teachers',
      title: 'Guia para Professores',
      icon: Users,
      category: 'Usuários',
      content: {
        title: '👨‍🏫 Professores',
        description: 'Recursos e funcionalidades para educadores',
        items: [
          {
            title: 'Gerenciar Turmas',
            list: [
              'Criar e organizar turmas por matéria/série',
              'Adicionar/remover alunos',
              'Visualizar lista de presença',
              'Acompanhar desempenho geral da turma',
              'Enviar comunicados e avisos'
            ]
          },
          {
            title: 'Criar Atividades',
            list: [
              'Trabalhos dissertativos',
              'Provas objetivas e dissertativas',
              'Quizzes interativos',
              'Projetos em grupo',
              'Atividades com prazo',
              'Anexar arquivos e materiais de apoio'
            ]
          },
          {
            title: 'Correção Automática',
            content: 'Para questões objetivas, a correção é instantânea. Para questões dissertativas, use a IA como assistente de correção ou corrija manualmente.'
          },
          {
            title: 'Detecção de Plágio',
            content: 'Todas as respostas dissertativas são analisadas automaticamente. Receba alertas quando houver suspeita de plágio com percentual de similaridade.'
          },
          {
            title: 'Relatórios e Analytics',
            content: 'Visualize gráficos de desempenho, médias por turma, evolução temporal, e identifique alunos que precisam de atenção.'
          }
        ]
      }
    },
    {
      id: 'students',
      title: 'Guia para Alunos',
      icon: GraduationCap,
      category: 'Usuários',
      content: {
        title: '🎓 Alunos',
        description: 'Como usar a plataforma como estudante',
        items: [
          {
            title: 'Acessar Turmas',
            content: 'Use o código fornecido pelo professor para entrar em uma turma. Você terá acesso a todos os materiais e atividades.'
          },
          {
            title: 'Realizar Atividades',
            list: [
              'Visualize prazos no calendário',
              'Responda questões objetivas e dissertativas',
              'Anexe arquivos quando solicitado',
              'Salve rascunhos antes de enviar',
              'Receba feedback do professor'
            ]
          },
          {
            title: 'Chatbot Educacional',
            content: 'Tire dúvidas 24/7 com nosso assistente virtual. Ele pode explicar conceitos, resolver exercícios e recomendar materiais de estudo.'
          },
          {
            title: 'Acompanhar Notas',
            content: 'Visualize suas notas, médias e desempenho em gráficos interativos. Compare com a média da turma (anonimizado).'
          },
          {
            title: 'Notificações',
            content: 'Receba alertas de novos trabalhos, prazos próximos, notas publicadas e mensagens do professor.'
          }
        ]
      }
    },
    {
      id: 'meetings',
      title: 'Videoconferências',
      icon: Video,
      category: 'Recursos',
      content: {
        title: '🎥 Reuniões e Aulas Online',
        description: 'Sistema de videoconferência integrado',
        items: [
          {
            title: 'Criar uma Reunião',
            content: 'Vá em "Reuniões" → "Nova Reunião". Defina título, data/hora, participantes e configurações (câmera obrigatória, gravação, etc).'
          },
          {
            title: 'Recursos Durante a Chamada',
            list: [
              'Compartilhamento de tela',
              'Quadro branco interativo',
              'Chat em tempo real',
              'Levantar a mão',
              'Reações (👍 ❤️ 👏)',
              'Gravação de aula',
              'Breakout rooms (salas paralelas)'
            ]
          },
          {
            title: 'Gravar Aulas',
            content: 'Ative a gravação para que alunos ausentes possam assistir depois. Gravações ficam disponíveis na biblioteca da turma.'
          },
          {
            title: 'Quadro Branco',
            content: 'Use ferramentas de desenho, formas geométricas, texto e importação de imagens para explicar conceitos visuais.'
          }
        ]
      }
    },
    {
      id: 'chatbot',
      title: 'Chatbot com IA',
      icon: MessageSquare,
      category: 'Recursos',
      content: {
        title: '🤖 Assistente Virtual',
        description: 'IA educacional para tirar dúvidas',
        items: [
          {
            title: 'Como Funciona',
            content: 'Nosso chatbot usa modelos de linguagem avançados treinados em conteúdo educacional. Ele entende contexto e pode explicar desde conceitos básicos até avançados.'
          },
          {
            title: 'Tipos de Perguntas',
            list: [
              'Explicação de conceitos (ex: "O que é fotossíntese?")',
              'Resolução de exercícios passo a passo',
              'Dúvidas sobre matérias específicas',
              'Recomendações de material de estudo',
              'Simulados e questões de prática',
              'Dicas de estudo e organização'
            ]
          },
          {
            title: 'Limitações',
            content: 'O chatbot não pode fazer trabalhos por você, acessar informações pessoais ou substituir o aprendizado ativo. Use-o como ferramenta de apoio.'
          },
          {
            title: 'Histórico',
            content: 'Todas as conversas ficam salvas para consulta futura. Você pode continuar uma conversa anterior a qualquer momento.'
          }
        ]
      }
    },
    {
      id: 'plagiarism',
      title: 'Sistema Anti-Plágio',
      icon: Shield,
      category: 'Recursos',
      content: {
        title: '🛡️ Detecção de Plágio',
        description: 'IA para garantir originalidade',
        items: [
          {
            title: 'Como Funciona',
            content: 'Cada resposta dissertativa é analisada contra nossa base de conhecimento, internet e trabalhos anteriores. A IA detecta similaridades e paráfrases.'
          },
          {
            title: 'Níveis de Alerta',
            list: [
              '🟢 Verde (0-20%): Originalidade alta',
              '🟡 Amarelo (20-50%): Suspeita baixa - revisar',
              '🟠 Laranja (50-70%): Suspeita média - investigar',
              '🔴 Vermelho (70-100%): Plágio detectado'
            ]
          },
          {
            title: 'Para Professores',
            content: 'Visualize trechos similares destacados, fontes encontradas e percentual de originalidade. Decida se aceita ou não o trabalho.'
          },
          {
            title: 'Para Alunos',
            content: 'Antes de enviar, você pode verificar sua resposta e receber sugestões para melhorar a originalidade.'
          }
        ]
      }
    },
    {
      id: 'analytics',
      title: 'Relatórios e Analytics',
      icon: BarChart3,
      category: 'Recursos',
      content: {
        title: '📊 Análise de Desempenho',
        description: 'Dados e insights educacionais',
        items: [
          {
            title: 'Dashboard do Professor',
            list: [
              'Média geral de todas as turmas',
              'Taxa de conclusão de atividades',
              'Alunos com dificuldades (média < 6)',
              'Evolução temporal (gráfico de linha)',
              'Comparativo entre turmas',
              'Atividades com maior/menor desempenho'
            ]
          },
          {
            title: 'Dashboard do Aluno',
            list: [
              'Suas notas e médias',
              'Progresso em cada matéria',
              'Ranking na turma (opcional)',
              'Atividades pendentes',
              'Histórico de desempenho',
              'Sugestões de melhoria'
            ]
          },
          {
            title: 'Exportar Dados',
            content: 'Exporte relatórios em PDF, Excel ou CSV. Compartilhe com coordenadores ou use para reuniões de pais.'
          }
        ]
      }
    },
    {
      id: 'settings',
      title: 'Configurações',
      icon: Settings,
      category: 'Avançado',
      content: {
        title: '⚙️ Personalização',
        description: 'Configure a plataforma do seu jeito',
        items: [
          {
            title: 'Perfil',
            list: [
              'Alterar foto e informações pessoais',
              'Atualizar email e senha',
              'Definir preferências de notificação',
              'Escolher idioma (PT, EN, ES)',
              'Tema claro/escuro'
            ]
          },
          {
            title: 'Privacidade',
            list: [
              'Controlar visibilidade do perfil',
              'Gerenciar dados compartilhados',
              'Exportar ou deletar seus dados',
              'Configurar permissões do chatbot',
              'Histórico de acessos'
            ]
          },
          {
            title: 'Notificações',
            list: [
              'Email: novos trabalhos, prazos, notas',
              'Push: lembretes de reuniões',
              'SMS: avisos urgentes',
              'Frequência: imediata, diária, semanal'
            ]
          }
        ]
      }
    },
    {
      id: 'api',
      title: 'API e Integrações',
      icon: Code,
      category: 'Avançado',
      content: {
        title: '🔌 Integrações',
        description: 'Conecte com outras ferramentas',
        items: [
          {
            title: 'API REST',
            content: 'Acesse nossos endpoints para integrar TamanduAI com sistemas externos. Documentação completa em /api/docs.'
          },
          {
            title: 'Autenticação',
            code: `
// Exemplo de autenticação
const token = await fetch('https://api.tamanduai.com/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'professor@escola.com',
    password: 'senha123'
  })
}).then(r => r.json());
            `
          },
          {
            title: 'Webhooks',
            content: 'Configure webhooks para receber notificações quando eventos importantes acontecerem (nova atividade enviada, reunião iniciada, etc).'
          },
          {
            title: 'Integrações Disponíveis',
            list: [
              'Google Classroom',
              'Microsoft Teams',
              'Moodle',
              'Canvas LMS',
              'Google Drive',
              'OneDrive',
              'Zoom',
              'Google Meet'
            ]
          }
        ]
      }
    },
    {
      id: 'gamification',
      title: 'Gamificação',
      icon: Trophy,
      category: 'Recursos',
      content: {
        title: '🎮 Sistema de Gamificação',
        description: 'XP, níveis, badges, missões e rankings para engajar alunos',
        items: [
          {
            title: 'Sistema de XP e Níveis',
            content: 'Alunos ganham XP (Experience Points) realizando atividades, participando de discussões e mantendo streaks diários. Cada 100 XP = 1 nível. Existem 16 níveis divididos em 4 tiers: Bronze (I-IV), Prata (I-IV), Ouro (I-IV), Diamante (I-IV).',
            list: [
              'Submeter atividade: +20 XP base',
              'Nota 9-10: bônus +50% XP',
              'Nota 7-8.9: bônus +25% XP',
              'Primeira atividade do dia: +5 XP',
              'Streak diário: +10 XP por dia consecutivo',
              'Participar em discussão: +5 XP por mensagem (max 3/dia)',
              'Completar missão: XP variável (50-500 XP)'
            ]
          },
          {
            title: 'Badges e Conquistas',
            content: 'Mais de 50 badges colecionáveis desbloqueados por ações específicas. Alunos podem exibir até 3 badges no perfil. Badges raros brilham com animação especial.',
            list: [
              '🏆 Primeira Atividade - Complete sua primeira atividade',
              '⭐ Nota 10 - Tire nota máxima',
              '🔥 Streak 7 - Mantenha 7 dias consecutivos',
              '📚 Estudioso - Complete 50 atividades',
              '🥇 Top 3 - Fique entre os 3 primeiros do ranking',
              '🤝 Helper - Ajude 10 colegas',
              '🎯 Mestre - Domine uma matéria (média 9.5+)',
              '💎 Lendário - Atinja nível Diamante'
            ]
          },
          {
            title: 'Rankings',
            content: 'Dois rankings atualizados em tempo real: Ranking da Turma (compara com colegas da mesma turma) e Ranking da Escola (todos alunos da instituição). Top 3 recebem medalhas especiais (🥇🥈🥉) e badges exclusivos.',
            code: `// Exemplo de XP por atividade
const calculateXP = (score, maxScore) => {
  const baseXP = 20;
  const percentage = (score / maxScore) * 100;
  
  if (percentage >= 90) return baseXP * 1.5; // +50% bônus
  if (percentage >= 70) return baseXP * 1.25; // +25% bônus
  return baseXP;
};`
          },
          {
            title: 'Missões e Desafios',
            content: 'Professores podem criar missões customizadas: diárias (reset todo dia), semanais (mais XP), especiais (eventos), secretas (surpresa). Alunos veem progresso em tempo real.',
            list: [
              'Complete 5 quizzes com 80%+ de acerto',
              'Participe de 3 discussões esta semana',
              'Mantenha streak de 5 dias',
              'Ajude 3 colegas em dúvidas',
              'Atinja média 8.0 em Matemática',
              'Envie todas atividades no prazo por 1 mês'
            ]
          }
        ]
      }
    },
    {
      id: 'ml-analytics',
      title: 'Analytics com ML',
      icon: Brain,
      category: 'Recursos',
      content: {
        title: '🧠 Machine Learning e IA',
        description: '4 modelos de ML para insights avançados e predições',
        items: [
          {
            title: '1. K-Means Clustering',
            content: 'Agrupa alunos automaticamente em 3 clusters: Alto Desempenho (média 8.5+), Médio (6.0-8.4), Baixo (<6.0). O algoritmo analisa: notas, frequência de entregas, participação em aulas/discussões, tempo médio de realização. Visualização em gráfico scatter 2D interativo.',
            code: `// Clusters gerados automaticamente
{
  "Alto Desempenho": {
    students: 8,
    avgGrade: 9.2,
    characteristics: ["Entregas pontuais", "Alta participação"]
  },
  "Médio": {
    students: 15,
    avgGrade: 7.1,
    characteristics: ["Entregas regulares", "Participação moderada"]
  },
  "Baixo": {
    students: 5,
    avgGrade: 4.8,
    characteristics: ["Entregas atrasadas", "Baixa participação"]
  }
}`
          },
          {
            title: '2. PCA (Principal Component Analysis)',
            content: 'Reduz dimensionalidade de múltiplas métricas (notas de diferentes atividades, presença, engajamento) em 2 componentes principais. Identifica padrões ocultos que não são visíveis analisando métricas isoladas. Ex: alunos que vão bem em teoria mas mal em prática.',
            list: [
              'Descobre correlações entre diferentes matérias',
              'Identifica alunos com perfis similares',
              'Agrupa atividades por dificuldade real',
              'Detecta métricas redundantes',
              'Gráfico de variância explicada'
            ]
          },
          {
            title: '3. Análise de Sentimento',
            content: 'IA analisa textos de alunos (respostas dissertativas, mensagens no chat, posts em discussões) usando modelo BERT fine-tuned para educação. Detecta 3 sentimentos: Positivo (😊), Neutro (😐), Negativo (😞). Acurácia: 87% em português.',
            list: [
              'Alerta automático para alunos desmotivados',
              'Gráfico de evolução de sentimento ao longo do tempo',
              'Comparação de sentimento entre turmas',
              'Identificação de tópicos que geram frustração',
              'Dashboard com % positivo/neutro/negativo',
              'Sugestões de intervenção pedagógica'
            ]
          },
          {
            title: '4. Predição de Desempenho',
            content: 'Modelo de regressão linear prevê nota final do aluno baseado em: notas parciais (peso 40%), frequência de entregas (30%), engajamento (20%), histórico (10%). Mostra probabilidade de aprovação/reprovação. Permite intervenção antecipada.',
            code: `// Exemplo de predição
{
  student_id: "abc123",
  predicted_final_grade: 7.2,
  confidence: 0.85,
  probability_pass: 0.78,
  probability_fail: 0.22,
  risk_level: "medium",
  recommendations: [
    "Revisar conceitos de Álgebra",
    "Aumentar participação nas aulas",
    "Entregar próximas 3 atividades no prazo"
  ]
}`
          },
          {
            title: 'Dashboards Interativos',
            content: 'Gráficos construídos com Recharts: scatter plot (clustering), heatmap (correlações), bar chart (comparações), line chart (evolução temporal), radar chart (perfis). Todos com tooltip interativo, zoom, filtros por turma/período, exportação PDF/Excel.',
            list: [
              'Filtros: turma, período, aluno, atividade',
              'Zoom e pan nos gráficos',
              'Download de dados brutos (CSV)',
              'Compartilhamento via link',
              'Agendamento de relatórios automáticos',
              'Integração com Google Sheets'
            ]
          }
        ]
      }
    },
    {
      id: 'question-bank',
      title: 'Banco de Questões',
      icon: Database,
      category: 'Recursos',
      content: {
        title: '📚 Banco de Questões Colaborativo',
        description: 'Milhares de questões + programa de descontos único',
        items: [
          {
            title: 'Buscar e Usar Questões',
            content: 'Acesso a mais de 10.000 questões curadas e revisadas. Filtros avançados: matéria (Matemática, Português, etc), ano/série (6º ano, Ensino Médio), nível de dificuldade (Fácil/Médio/Difícil), tipo (múltipla escolha, dissertativa, V/F), tags, BNCC. Visualize questão completa, gabarito comentado, estatísticas de uso e rating.',
            list: [
              'Preview completo antes de adicionar',
              'Gabarito com explicação passo-a-passo',
              'Rating de outros professores (1-5 estrelas)',
              'Estatísticas: % acerto médio, tempo médio',
              'Questões similares (sugestões)',
              'Histórico de revisões',
              'Comentários e dicas de uso'
            ]
          },
          {
            title: 'Contribuir Questões',
            content: 'Clique em "Nova Questão", preencha enunciado, alternativas (se aplicável), resposta correta, explicação detalhada, tags, nível de dificuldade, matéria, ano. Envie para revisão. Nossa IA faz primeira análise (gramática, clareza, ambiguidade). Se aprovada por moderador humano, entra no banco.',
            code: `// Estrutura de uma questão
{
  question: "Qual é a fórmula de Bhaskara?",
  type: "multiple_choice",
  options: ["x = -b ± √(b²-4ac) / 2a", "..."],
  correct: 0,
  explanation: "A fórmula de Bhaskara...",
  difficulty: "medium",
  subject: "Matemática",
  grade: "9º ano",
  tags: ["equação", "segundo grau", "álgebra"],
  bncc_code: "EF09MA09"
}`
          },
          {
            title: 'Programa de Descontos ÚNICO',
            content: 'Cada questão aprovada = 0.1% de desconto permanente na mensalidade. Máximo: 30% off. Questões com rating 4.5+ estrelas = bônus 2x (0.2% por questão). Flywheel: quanto mais professores contribuem, melhor o banco fica, mais valor todos recebem.',
            list: [
              '10 questões aprovadas = 1% desconto',
              '50 questões = 5% desconto',
              '100 questões = 10% desconto',
              '300 questões = 30% desconto (máximo)',
              'Desconto é permanente enquanto for assinante',
              'Questões de alta qualidade (4.5+ ⭐) = 2x desconto',
              'Dashboard mostra progresso e desconto atual'
            ]
          },
          {
            title: 'Importar para Atividades',
            content: 'Ao criar quiz/prova, clique "Importar do Banco". Selecione questões (busca e filtros). Elas são copiadas para sua atividade (não referenciadas), então pode editar livremente sem afetar o banco. Sugestão automática de questões baseadas no conteúdo da aula.',
            list: [
              'Importação em lote (selecione múltiplas)',
              'Sugestões baseadas em IA do que você está ensinando',
              'Aleatorização automática de questões',
              'Banco de provas prontas (conjuntos curados)',
              'Preview de como ficará na atividade'
            ]
          }
        ]
      }
    },
    {
      id: 'school',
      title: 'Guia para Escolas',
      icon: Building2,
      category: 'Usuários',
      content: {
        title: '🏫 Gestão Escolar',
        description: 'Dashboard administrativo completo para coordenadores e diretores',
        items: [
          {
            title: 'Dashboard da Escola',
            content: 'Visão consolidada de toda instituição: total de professores, alunos, turmas ativas, média geral da escola, taxa de aprovação, comparação com metas, alertas de alunos em risco. Gráficos de desempenho por ano/série, matéria, professor.',
            list: [
              'KPIs em tempo real',
              'Comparação com período anterior',
              'Alertas automáticos (quedas de desempenho)',
              'Metas e progresso',
              'Exportação de relatórios executivos',
              'Dashboard customizável'
            ]
          },
          {
            title: 'Gerenciar Professores',
            content: 'Adicione professores manualmente ou via convite. Atribua turmas, defina permissões (admin, coordenador, professor), acompanhe atividade (últimas ações, turmas gerenciadas, atividades criadas). Relatórios de desempenho por professor.',
            list: [
              'Convites por email com onboarding guiado',
              'Perfis de permissão customizados',
              'Histórico de ações de cada professor',
              'Avaliação de desempenho docente',
              'Plano de desenvolvimento individual (PDI)',
              'Chat interno entre equipe'
            ]
          },
          {
            title: 'Comunicações e Avisos',
            content: 'Envie comunicados para: Todos (escola inteira), Professores, Turmas específicas, Alunos individuais. Agende envios futuros, anexe arquivos, rastreie leitura (quem leu, quem não leu), envie lembretes automáticos.',
            list: [
              'Templates de comunicados prontos',
              'Agendamento de envios',
              'Confirmação de leitura',
              'Anexos (PDF, imagens, links)',
              'Tradução automática (multi-idioma)',
              'Histórico completo de comunicações'
            ]
          },
          {
            title: 'Relatórios Consolidados',
            content: 'Relatórios prontos: Desempenho por Turma, Desempenho por Professor, Taxa de Aprovação/Reprovação, Frequência Geral, Evasão Escolar (predição IA), Comparativo Trimestral/Semestral. Exportação em PDF, Excel, PowerPoint (para reuniões).',
            list: [
              'Relatórios automáticos semanais/mensais',
              'Comparação com benchmarks nacionais',
              'Análise de causas (IA identifica padrões)',
              'Gráficos prontos para apresentações',
              'Envio automático para diretoria',
              'Drill-down (clique para ver detalhes)'
            ]
          },
          {
            title: 'Analytics Avançado da Escola',
            content: 'ML aplicado ao nível escolar: clustering de turmas por desempenho, análise de sentimento geral dos alunos, predição de taxa de aprovação por turma, identificação de professores que precisam suporte, otimização de distribuição de alunos por turma.',
            list: [
              'Clustering automático de turmas',
              'Predição de evasão por aluno (risco alto/médio/baixo)',
              'Análise de eficácia por metodologia de ensino',
              'Recomendações de intervenções',
              'Simulações (e se mudar X, qual impacto em Y)',
              'ROI do investimento em tecnologia educacional'
            ]
          }
        ]
      }
    },
    {
      id: 'faq',
      title: 'Perguntas Frequentes',
      icon: Lightbulb,
      category: 'Suporte',
      content: {
        title: '❓ FAQ',
        description: 'Dúvidas mais comuns',
        items: [
          {
            title: 'É gratuito?',
            content: 'Sim! Oferecemos 3 meses grátis no programa Beta com acesso completo a todas funcionalidades. Após o período beta, planos a partir de R$ 49/mês. Você pode ganhar até 30% de desconto contribuindo questões ao banco. Planos pagos incluem: detecção de plágio ilimitada (Winston AI), chatbot RAG v2.0 com 200 msgs/dia, armazenamento ilimitado, analytics com ML, relatórios avançados e suporte prioritário.'
          },
          {
            title: 'Quantos alunos e turmas posso ter?',
            content: 'ILIMITADO! Você pode adicionar quantos alunos, turmas e professores precisar em qualquer plano. Escalamos conforme seu crescimento. Plano Beta: acesso completo. Plano Pro: recursos avançados de IA. Plano Enterprise: personalização total e suporte dedicado.'
          },
          {
            title: 'Os dados são seguros?',
            content: 'Absolutamente! Usamos criptografia AES-256, armazenamento em servidores seguros no Brasil, backups automáticos diários, conformidade 100% com LGPD, autenticação de dois fatores (2FA) e auditorias de segurança regulares. Seus dados NUNCA são compartilhados com terceiros. Temos certificações ISO 27001 e SOC 2.'
          },
          {
            title: 'Como funciona o chatbot com RAG v2.0?',
            content: 'Você faz upload de materiais didáticos (PDF, Word, PowerPoint, links/URLs) e o sistema usa Retrieval-Augmented Generation v2.0 para treinar o chatbot. Ele responde dúvidas dos alunos 24/7 com base nos seus materiais, citando fontes. Suporta até 200 mensagens/dia no plano Pro e respostas em até 2 segundos.'
          },
          {
            title: 'Como funciona o antiplágio?',
            content: 'Usamos Winston AI (detecção de IA e plágio) com 100 verificações/hora. O sistema analisa automaticamente todas as submissões e detecta: plágio de internet, conteúdo gerado por IA (ChatGPT, etc), similaridade com trabalhos anteriores. Você recebe alertas em tempo real e relatórios detalhados com porcentagens e fontes.'
          },
          {
            title: 'Posso usar em qualquer dispositivo?',
            content: 'Sim! TamanduAI é 100% responsivo e funciona perfeitamente em: Computadores (Windows, Mac, Linux), Tablets (iPad, Android), Smartphones (iOS, Android). Interface adaptável com modo claro/escuro. Alguns recursos funcionam offline com sincronização automática.'
          },
          {
            title: 'Como funcionam as videoconferências?',
            content: 'Integramos com Agora.io para videoconferências nativas de alta qualidade. Você também pode adicionar links externos de Google Meet, Zoom, Teams. Recursos: gravação de aulas, compartilhamento de tela, chat ao vivo, lista de presença automática, até 100 participantes simultâneos.'
          },
          {
            title: 'Posso integrar com outras plataformas?',
            content: 'Sim! Integrações atuais: Google Meet, Zoom (links externos), Google Drive, Microsoft OneDrive. Em desenvolvimento: Google Classroom, Microsoft Teams, Moodle, Canvas LMS. API REST disponível para integrações customizadas no plano Enterprise.'
          },
          {
            title: 'Como funciona a gamificação?',
            content: 'Sistema completo com: XP por atividades (10-100 XP), 16 níveis (Bronze I até Diamante IV), badges por conquistas, rankings por turma e escola, missões diárias/semanais, recompensas customizáveis. Aumenta engajamento em até 40% segundo nossos estudos.'
          },
          {
            title: 'Como cancelar ou pausar minha conta?',
            content: 'Você tem total controle: Pausar (suspende cobranças, mantém dados por 90 dias), Cancelar (continua até fim do período pago), Excluir (remove todos dados em 30 dias conforme LGPD). Acesse: Configurações → Conta → Gerenciar Assinatura. Sem burocracias ou taxas de cancelamento.'
          }
        ]
      }
    },
    {
      id: 'support',
      title: 'Suporte',
      icon: FileText,
      category: 'Suporte',
      content: {
        title: '💬 Precisa de Ajuda?',
        description: 'Entre em contato conosco',
        items: [
          {
            title: 'Canais de Suporte',
            list: [
              '📧 Email: suporte@tamanduai.com',
              '💬 Chat ao vivo: Segunda a Sexta, 9h-18h',
              '📱 WhatsApp: (11) 99999-9999',
              '🎫 Abrir ticket: /suporte/novo',
              '📚 Base de conhecimento: /docs'
            ]
          },
          {
            title: 'Tempo de Resposta',
            content: 'Email: até 24h úteis. Chat e WhatsApp: até 2h durante horário comercial. Tickets: até 48h úteis.'
          },
          {
            title: 'Reportar Bug',
            content: 'Encontrou um problema? Envie para bugs@tamanduai.com com prints, passos para reproduzir e versão do navegador.'
          }
        ]
      }
    }
  ];

  // Categorias únicas
  const categories = useMemo(() => {
    const cats = [...new Set(sections.map(s => s.category))];
    return ['all', ...cats];
  }, []);

  // Filtrar seções por busca e categoria
  const filteredSections = useMemo(() => {
    let filtered = sections;
    
    // Filtro de categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(s => s.category === selectedCategory);
    }
    
    // Filtro de busca
    if (searchQuery) {
      filtered = filtered.filter(section =>
        section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.content.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.content.items.some(item => 
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.content?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
    
    return filtered;
  }, [searchQuery, selectedCategory]);

  // Seção atual
  const currentSection = sections.find(s => s.id === selectedSection) || sections[0];

  // Função para highlight de texto na busca
  const highlightText = (text, query) => {
    if (!query || !text) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() ? 
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-600 text-gray-900 dark:text-white px-1 rounded">{part}</mark> : 
        part
    );
  };

  // Salvar histórico de busca
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query && !searchHistory.includes(query)) {
      const newHistory = [query, ...searchHistory.slice(0, 4)]; // Manter últimas 5 buscas
      setSearchHistory(newHistory);
      localStorage.setItem('doc-search-history', JSON.stringify(newHistory));
    }
  };

  // Carregar histórico do localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem('doc-search-history');
    if (saved) {
      setSearchHistory(JSON.parse(saved));
    }
  }, []);

  // Sistema de feedback
  const submitFeedback = (type) => {
    setFeedbackType(type);
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 3000);
    
    // Salvar feedback (aqui você poderia enviar para analytics)
    console.log(`Feedback: ${type} na seção ${currentSection.id}`);
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900">
      <Seo
        title="Documentação — TamanduAI"
        description="Guia completo da plataforma: recursos, primeiros passos, professores, alunos, chatbot, antiplágio, analytics e integrações."
        path="/docs"
      />
      {/* Header Premium */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 p-8 text-white"
      >
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-3">
                📚 Documentação TamanduAI
              </h1>
              <p className="text-blue-100 text-lg max-w-2xl">
                Guia completo da plataforma educacional mais moderna do Brasil
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="whitespace-nowrap inline-flex items-center gap-2 rounded-lg bg-white/20 hover:bg-white/30 text-white px-4 py-2 transition-colors"
              aria-label="Voltar"
            >
              <span>Voltar</span>
            </button>
          </div>
        </div>

        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-white/5 to-transparent rounded-full blur-2xl"></div>
        <div className="hidden lg:block absolute top-8 right-8">
          <div className="w-24 h-24 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <BookOpen className="w-12 h-12 text-white" />
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Busca e Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl bg-white dark:bg-gray-800">
            <CardContent className="p-6">
              {/* Busca */}
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                <Input
                  type="text"
                  placeholder="Buscar na documentação... (ex: gamificação, XP, turmas)"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-12 pr-4 py-6 rounded-xl text-lg bg-white dark:bg-gray-900 text-foreground border-border"
                />
                
                {/* Histórico de buscas */}
                {!searchQuery && searchHistory.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 flex flex-wrap gap-2"
                  >
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Buscas recentes:
                    </span>
                    {searchHistory.map((term, i) => (
                      <button
                        key={i}
                        onClick={() => handleSearch(term)}
                        className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
              
              {/* Filtros de Categoria */}
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`whitespace-nowrap inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      selectedCategory === cat
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <span className="font-medium text-sm">
                      {cat === 'all' ? '📋 Todos' : cat}
                    </span>
                  </button>
                ))}
              </div>
              
              {/* Contador de resultados */}
              {searchQuery && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 text-sm text-gray-600 dark:text-gray-400"
                >
                  {filteredSections.length} {filteredSections.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
                </motion.p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar de Navegação */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-6 space-y-4">
              <Card className="rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl bg-white dark:bg-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BookOpen className="w-5 h-5 text-blue-500" />
                    <span>Navegação</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <nav className="space-y-1 max-h-[calc(100vh-12rem)] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-blue-300 dark:scrollbar-thumb-blue-700 scrollbar-track-transparent">
                    {filteredSections.map((section, index) => {
                      const Icon = section.icon;
                      const isActive = selectedSection === section.id;
                      
                      return (
                        <motion.button
                          key={section.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + index * 0.05 }}
                          onClick={() => setSelectedSection(section.id)}
                          className={`whitespace-nowrap inline-flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-300 text-left group ${
                            isActive
                              ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 text-white shadow-lg shadow-blue-500/50 scale-105'
                              : 'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-md'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isActive
                              ? 'bg-white/20'
                              : 'bg-white dark:bg-gray-600 group-hover:bg-blue-50 dark:group-hover:bg-gray-600'
                          }`}>
                            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-blue-500 dark:text-blue-400'}`} />
                          </div>
                          <span className="font-medium text-sm flex-1">{section.title}</span>
                          {isActive && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring" }}
                            >
                              <ChevronRight className="w-4 h-4" />
                            </motion.div>
                          )}
                        </motion.button>
                      );
                    })}
                  </nav>
                </CardContent>
              </Card>
              
              {/* Mini info card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Card className="rounded-2xl border border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <Lightbulb className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
                          Dica Rápida
                        </p>
                        <p className="text-xs text-gray-700 dark:text-gray-300">
                          Use Ctrl+F para buscar dentro da seção atual!
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>

          {/* Conteúdo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-3"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
                  <CardContent className="p-8">
                    {/* Título da seção */}
                    <div className="mb-8">
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {currentSection.content.title}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-300 text-lg">
                        {currentSection.content.description}
                      </p>
                      <Badge className="mt-3 bg-blue-100 text-blue-700 dark:bg-gray-800 dark:text-blue-400">
                        {currentSection.category}
                      </Badge>
                    </div>

                    {/* Itens da seção com Accordion */}
                    {currentSection.content.items.length > 5 ? (
                      <Accordion type="single" collapsible className="space-y-4">
                        {currentSection.content.items.map((item, index) => (
                          <AccordionItem
                            key={index}
                            value={`item-${index}`}
                            className="border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 px-6 shadow-sm hover:shadow-md transition-shadow"
                          >
                            <AccordionTrigger className="hover:no-underline py-4">
                              <div className="flex items-center gap-3 text-left">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                                  <CheckCircle2 className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                  {item.title}
                                </h3>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-4">
                              <div className="space-y-4 pl-11">
                                {item.content && (
                                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {item.content}
                                  </p>
                                )}
                                
                                {item.list && (
                                  <ul className="space-y-2">
                                    {item.list.map((listItem, i) => (
                                      <li key={i} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                                        <Sparkles className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                                        <span>{listItem}</span>
                                      </li>
                                    ))}
                                  </ul>
                                )}

                                {item.code && (
                                  <div className="relative group">
                                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Badge className="bg-green-500 text-white text-xs">
                                        Código
                                      </Badge>
                                    </div>
                                    <pre className="p-4 bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-950 dark:to-gray-900 rounded-xl overflow-x-auto border border-gray-700">
                                      <code className="text-sm text-green-400 font-mono leading-relaxed">
                                        {item.code.trim()}
                                      </code>
                                    </pre>
                                  </div>
                                )}
                                
                                {item.badge && (
                                  <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 mt-2">
                                    {item.badge}
                                  </Badge>
                                )}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    ) : (
                      <div className="space-y-6">
                        {currentSection.content.items.map((item, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + index * 0.05 }}
                            className="p-6 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                                <CheckCircle2 className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                                  {item.title}
                                </h3>
                                
                                {item.content && (
                                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                                    {item.content}
                                  </p>
                                )}
                                
                                {item.list && (
                                  <ul className="space-y-3">
                                    {item.list.map((listItem, i) => (
                                      <li key={i} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                                          <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <span>{listItem}</span>
                                      </li>
                                    ))}
                                  </ul>
                                )}

                                {item.code && (
                                  <div className="relative group mt-4">
                                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                      <Badge className="bg-green-500 text-white text-xs shadow-lg">
                                        📝 Código
                                      </Badge>
                                    </div>
                                    <pre className="p-4 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 dark:from-black dark:via-gray-950 dark:to-gray-900 rounded-xl overflow-x-auto border-2 border-gray-700 dark:border-gray-800 shadow-inner">
                                      <code className="text-sm text-green-400 font-mono leading-relaxed block">
                                        {item.code.trim()}
                                      </code>
                                    </pre>
                                  </div>
                                )}
                                
                                {item.badge && (
                                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white mt-3 shadow-lg">
                                    ✨ {item.badge}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                    
                    {/* Sistema de Feedback */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex flex-col items-center gap-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                          Esta página foi útil?
                        </p>
                        <div className="flex gap-3">
                          <button
                            onClick={() => submitFeedback('helpful')}
                            className="whitespace-nowrap inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 transition-all duration-200 shadow-sm hover:shadow-md"
                          >
                            <span className="text-2xl">👍</span>
                            <span className="font-medium">Sim, útil!</span>
                          </button>
                          <button
                            onClick={() => submitFeedback('not-helpful')}
                            className="whitespace-nowrap inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200 shadow-sm hover:shadow-md"
                          >
                            <span className="text-2xl">👎</span>
                            <span className="font-medium">Não ajudou</span>
                          </button>
                        </div>
                        
                        {/* Feedback Toast */}
                        <AnimatePresence>
                          {showFeedback && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className={`px-6 py-3 rounded-xl shadow-lg ${
                                feedbackType === 'helpful'
                                  ? 'bg-green-500 text-white'
                                  : 'bg-red-500 text-white'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {feedbackType === 'helpful' ? (
                                  <>
                                    <CheckCircle2 className="w-5 h-5" />
                                    <span className="font-medium">Obrigado pelo feedback! 🎉</span>
                                  </>
                                ) : (
                                  <>
                                    <AlertCircle className="w-5 h-5" />
                                    <span className="font-medium">Vamos melhorar esta seção! 💪</span>
                                  </>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        
                        {/* Links úteis */}
                        <div className="flex flex-wrap gap-3 justify-center mt-4">
                          <a
                            href="mailto:suporte@tamanduai.com"
                            className="text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1"
                          >
                            <MessageSquare className="w-3 h-3" />
                            Falar com suporte
                          </a>
                          <span className="text-gray-300 dark:text-gray-700">•</span>
                          <button
                            onClick={() => window.open('https://github.com/tamanduai/issues', '_blank')}
                            className="text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1"
                          >
                            <Code className="w-3 h-3" />
                            Reportar bug
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DocumentationPagePremium;
export { DocumentationPagePremium };

