import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, ExternalLink, TrendingUp, Users, DollarSign, BookOpen, Brain, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const StrategicPlanPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Link
            to="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao início
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🦙 TamanduAI - Plano Estratégico Completo e Consolidado
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Versão: 5.0 Final | Data: Outubro 2025 | Status: Documento Executivo Completo
          </p>
          <div className="mt-6 flex justify-center space-x-4">
            <Button variant="outline" className="bg-white dark:bg-slate-900 text-foreground border-border flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Baixar PDF
            </Button>
            <Button variant="outline" className="bg-white dark:bg-slate-900 text-foreground border-border flex items-center">
              <ExternalLink className="w-4 h-4 mr-2" />
              Ver Original
            </Button>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Sumário Executivo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                1. Sumário Executivo
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p><strong>O Problema:</strong> Professores brasileiros gastam 40-50% do tempo em tarefas administrativas (correção manual, organização, comunicação com alunos), resultando em tecnoestresse docente crescente, baixa qualidade de feedback aos alunos e desmotivação e evasão de professores da profissão.</p>
              <p><strong>A Solução:</strong> TamanduAI é uma plataforma EdTech SaaS que reduz em 50-60% o tempo administrativo dos professores através de IA com RAG contextual por turma, gamificação completa, automação de correção e analytics preditivos com Machine Learning.</p>
              <p><strong>Diferenciais Competitivos:</strong> Foco no Professor (não no aluno) - resolvemos a dor de quem paga. Modelo Multi-Vínculo - Professor em 3 escolas = 3x receita. Estratégia B2G Pioneira - Parceria com Secretaria de IA do Piauí. Crescimento Exponencial - Network effects + embaixadores + flywheel. Programa de Descontos Inovador - Professor contribui questões, ganha até 20% OFF.</p>
              <p><strong>Tração Projetada:</strong></p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left">Ano</th>
                      <th className="text-left">ARR</th>
                      <th className="text-left">MRR Final</th>
                      <th className="text-left">Clientes</th>
                      <th className="text-left">Crescimento</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>1</td><td>R$ 400k</td><td>R$ 85k</td><td>60 escolas + 80 prof + 600 alunos</td><td>-</td></tr>
                    <tr><td>2</td><td>R$ 7.320k</td><td>R$ 610k</td><td>250 escolas + 400 prof + 5k alunos</td><td>18.3x</td></tr>
                    <tr><td>3</td><td>R$ 21.720k</td><td>R$ 1.810k</td><td>600 escolas + 1.2k prof + 15k alunos</td><td>3x</td></tr>
                    <tr><td>5</td><td>R$ 80M+</td><td>R$ 6.670k</td><td>3k escolas + 10k prof + 100k alunos</td><td>3.7x</td></tr>
                  </tbody>
                </table>
              </div>
              <p><strong>Métricas-Chave:</strong> LTV:CAC: 8:1 a 39:1, Payback: 2-8 meses, Churn anual: 7-18%, NRR: 115%, Margem bruta: 70-75%, Breakeven: Ano 2 (Q4).</p>
            </CardContent>
          </Card>

          {/* Visão e Proposta de Valor */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                2. Visão e Proposta de Valor
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p><strong>Visão (10 anos):</strong> "Ser a plataforma educacional que empodera 1 milhão de professores na América Latina, devolvendo-lhes tempo e alegria de ensinar através de tecnologia brasileira."</p>
              <p><strong>Missão:</strong> Reduzir drasticamente o tecnoestresse docente através de IA, automação e gamificação, permitindo que professores foquem no que realmente importa: ensinar.</p>
              <p><strong>Valores:</strong> Professor em Primeiro Lugar - Sempre; Simplicidade Obsessiva - UX 10x melhor que concorrentes; Transparência Radical - Com professores, alunos, escolas e investidores; Inovação Responsável - IA como ferramenta, não substituta; Brasilidade - Tecnologia feita para a realidade brasileira.</p>
              <p><strong>Proposta de Valor por Persona:</strong></p>
              <ul>
                <li><strong>Para Professores 👨‍🏫:</strong> Economize 12-15h/semana, Chatbot IA 24/7, Correção automática, Gamificação aumenta engajamento 40-60%, Desconto até 20% por contribuições.</li>
                <li><strong>Para Escolas 🏫:</strong> Gestão centralizada, Dashboard executivo, Analytics preditivos, ROI 30-40% em custos, Compliance LGPD built-in.</li>
                <li><strong>Para Alunos 👩‍🎓:</strong> Gamificação completa, Chatbot tutor 24/7, Banco de questões, Feedback instantâneo, Modo Pomodoro.</li>
                <li><strong>Para Governos 🏛️:</strong> Solução escalável, ROI comprovado, Case no Piauí, Compliance total, Tecnologia brasileira no Nordeste.</li>
              </ul>
            </CardContent>
          </Card>

          {/* Modelo de Negócio */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                3. Modelo de Negócio
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p><strong>Modelo Tri-Modal:</strong> B2B (50-55%), B2C Professores (15-20%), B2C Alunos (10-15%), B2G (20-30%).</p>
              <p><strong>Modelo Multi-Vínculo (DIFERENCIAL CHAVE):</strong> Exemplo: Professor João em 3 escolas gera R$ 2.086,05/mês. Razões: 40-50% professores em 2+ escolas, CAC = R$ 0, LTV adicional = lucro puro, Network effects.</p>
            </CardContent>
          </Card>

          {/* Estratégia de Precificação */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                4. Estratégia de Precificação
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p><strong>B2B:</strong> Plano Escola = (Professores × R$ 74,90) + (Alunos × R$ 4,99). Exemplos: Cursinho Pequeno R$ 1.597,20/mês.</p>
              <p><strong>B2C Professores:</strong> Planos R$ 49,90-109,90 com descontos por contribuição (até 20%).</p>
              <p><strong>B2C Alunos:</strong> R$ 9,90 ou R$ 4,99 para escolares.</p>
              <p><strong>B2G:</strong> Descontos especiais (R$ 50/prof, R$ 3,50/aluno).</p>
              <p><strong>Programa de Descontos:</strong> Até 20% OFF por questões contribuídas, criando flywheel.</p>
            </CardContent>
          </Card>

          {/* Funcionalidades da Plataforma */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                5. Funcionalidades da Plataforma
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p><strong>Para Escolas:</strong> Gestão, analytics, rankings, banco de questões.</p>
              <p><strong>Para Professores:</strong> Gestão de turmas, atividades, chatbot, agenda, ferramentas.</p>
              <p><strong>Para Alunos:</strong> Participação, chatbot, gamificação com missões, Pomodoro, desempenho.</p>
              <p><strong>Banco de Questões:</strong> Estrutura, criação, estatísticas e integração com chatbot.</p>
            </CardContent>
          </Card>

          {/* Go-to-Market Strategy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                6. Go-to-Market Strategy
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p><strong>Canais:</strong> B2B (50-55%), B2C Professores (15-20%), B2C Alunos (10-15%), B2G (20-30%).</p>
              <p><strong>B2B:</strong> Segmentação por tiers, processos de vendas, canais de aquisição.</p>
              <p><strong>B2C:</strong> Funis de conversão, canais pagos/orgânicos, viralidade.</p>
            </CardContent>
          </Card>

          {/* Estratégia de Embaixadores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-600" />
                7. Estratégia de Embaixadores
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p><strong>3 Tiers:</strong> Macro, Micro, Champions com comissões e benefícios.</p>
              <p><strong>Impacto Financeiro:</strong> ARR adicional crescente.</p>
              <p><strong>Programa de Incentivos:</strong> Dashboards, gamificação, materiais.</p>
            </CardContent>
          </Card>

          {/* Projeções Financeiras */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                9. Projeções Financeiras
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p><strong>Premissas:</strong> Crescimento conservador, retenção, pricing.</p>
              <p><strong>Receita e Custos:</strong> Detalhados por ano, com break-even no Q4 Ano 2.</p>
              <p><strong>Ano 5:</strong> Expansão LatAm para R$ 56M+ ARR.</p>
            </CardContent>
          </Card>

          {/* Unit Economics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                10. Unit Economics
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p><strong>Custos Unitários:</strong> Detalhados por aluno/professor.</p>
              <p><strong>Margem Bruta:</strong> Por canal e plano, com percentuais altos.</p>
            </CardContent>
          </Card>

          {/* Additional Sections if needed */}
          <Card>
            <CardHeader>
              <CardTitle>Próximos Passos</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Este documento serve como base para execução estratégica. Para mais detalhes, entre em contato conosco.</p>
            </CardContent>
          </Card>
        </div>

        {/* Footer Link */}
        <div className="text-center mt-12">
          <p className="text-gray-600">
            © 2025 TamanduAI. Todos os direitos reservados. |
            <Link to="/privacy" className="text-blue-600 hover:underline ml-1">Política de Privacidade</Link> |
            <Link to="/terms" className="text-blue-600 hover:underline ml-1">Termos de Uso</Link> |
            <Link to="/strategic-plan" className="text-blue-600 hover:underline ml-1">Plano Estratégico</Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default StrategicPlanPage;
