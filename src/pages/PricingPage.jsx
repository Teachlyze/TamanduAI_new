import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Star, Zap, Crown, Users, Trophy, Bell, Calendar, Brain, Shield, DollarSign, Gift, TrendingUp, BookOpen, Sparkles, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CookieBanner from '@/components/CookieBanner';

const PricingPage = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('monthly');

  const teacherPlans = [
    {
      name: 'Gratuito',
      description: 'Para começar sua jornada',
      price: 0,
      originalPrice: null,
      popular: false,
      features: [
        { name: '1 turma', included: true },
        { name: 'Até 15 alunos/turma', included: true },
        { name: '10 mensagens chatbot/dia', included: true },
        { name: 'Antiplágio básico (20 checks/mês)', included: true },
        { name: 'Analytics básico', included: true },
        { name: 'Gamificação básica', included: true },
        { name: 'Suporte por email', included: true },
        { name: 'Banco de questões', included: false },
        { name: 'Programa de descontos', included: false },
        { name: 'Analytics avançado', included: false },
        { name: 'Videoconferências integradas', included: false },
        { name: 'Suporte prioritário', included: false }
      ]
    },
    {
      name: 'Básico',
      description: 'Para professores em crescimento',
      price: billingCycle === 'monthly' ? 49 : 39,
      originalPrice: billingCycle === 'monthly' ? 69 : 49,
      popular: false,
      badge: '15% OFF',
      features: [
        { name: 'Até 3 turmas', included: true },
        { name: 'Alunos ilimitados', included: true },
        { name: '50 mensagens chatbot/dia', included: true },
        { name: 'Antiplágio (50 checks/mês)', included: true },
        { name: 'Analytics completo', included: true },
        { name: 'Gamificação completa', included: true },
        { name: 'Banco de questões', included: true },
        { name: 'Programa de descontos (até 10%)', included: true },
        { name: 'Suporte por chat', included: true },
        { name: 'Videoconferências integradas', included: false },
        { name: 'Suporte prioritário', included: false },
        { name: 'IA proprietária avançada', included: false }
      ]
    },
    {
      name: 'Pro',
      description: 'Para profissionais sérios',
      price: billingCycle === 'monthly' ? 69 : 59,
      originalPrice: billingCycle === 'monthly' ? 99 : 79,
      popular: true,
      badge: '30% OFF',
      features: [
        { name: 'Até 10 turmas', included: true },
        { name: 'Alunos ilimitados', included: true },
        { name: '200 mensagens chatbot/dia', included: true },
        { name: 'Antiplágio (100 checks/hora)', included: true },
        { name: 'Analytics ML avançado', included: true },
        { name: 'Gamificação completa', included: true },
        { name: 'Banco de questões completo', included: true },
        { name: 'Programa de descontos (até 20%)', included: true },
        { name: 'Videoconferências integradas', included: true },
        { name: 'Suporte prioritário', included: true },
        { name: 'IA proprietária avançada', included: true },
        { name: 'Suporte por WhatsApp', included: true }
      ]
    },
    {
      name: 'Ilimitado',
      description: 'Para educadores de alta performance',
      price: billingCycle === 'monthly' ? 109 : 89,
      originalPrice: billingCycle === 'monthly' ? 149 : 119,
      popular: false,
      badge: '25% OFF',
      features: [
        { name: 'Turmas ilimitadas', included: true },
        { name: 'Alunos ilimitados', included: true },
        { name: 'Mensagens chatbot ilimitadas', included: true },
        { name: 'Antiplágio ilimitado', included: true },
        { name: 'Analytics ML premium', included: true },
        { name: 'Gamificação completa', included: true },
        { name: 'Banco de questões completo', included: true },
        { name: 'Programa de descontos (até 30%)', included: true },
        { name: 'Videoconferências integradas', included: true },
        { name: 'Suporte VIP (2h resposta)', included: true },
        { name: 'IA proprietária avançada', included: true },
        { name: 'Onboarding personalizado', included: true }
      ]
    }
  ];

  const schoolPlans = [
    {
      name: 'Escola Pequena',
      description: 'Para escolas até 500 alunos',
      teachers: 10,
      students: 300,
      price: billingCycle === 'monthly' ? 299 : 249,
      originalPrice: billingCycle === 'monthly' ? 399 : 299,
      badge: '25% OFF',
      features: [
        'Tudo do plano Pro para professores',
        'Gestão multi-professor',
        'Dashboard executivo',
        'Relatórios consolidados',
        'Analytics com ML',
        'Banco de questões coletivo',
        'Suporte dedicado',
        'Treinamento incluso'
      ]
    },
    {
      name: 'Escola Média',
      description: 'Para escolas até 1.500 alunos',
      teachers: 50,
      students: 1500,
      price: billingCycle === 'monthly' ? 999 : 849,
      originalPrice: billingCycle === 'monthly' ? 1299 : 999,
      badge: '20% OFF',
      features: [
        'Tudo do plano Escola Pequena',
        'Professores ilimitados',
        'Analytics avançado',
        'Integrações customizadas',
        'Suporte VIP',
        'Consultoria mensal',
        'SLA 99.9%'
      ]
    },
    {
      name: 'Escola Grande',
      description: 'Para redes e instituições grandes',
      teachers: '∞',
      students: '∞',
      price: 'Custom',
      originalPrice: null,
      badge: 'Personalizado',
      features: [
        'Tudo incluso',
        'Infraestrutura dedicada',
        'White label opcional',
        'SSO enterprise',
        'API completa',
        'Suporte 24/7',
        'Equipe dedicada'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Beta Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white py-3 px-4 text-center"
      >
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Sparkles className="w-5 h-5" />
          <span className="font-bold text-lg">Programa Beta Ativo!</span>
          <span className="hidden sm:inline">•</span>
          <span>3 meses GRÁTIS para os primeiros 1.000 cadastros</span>
          <Button
            size="sm"
            variant="outline"
            className="ml-4 bg-white text-green-600 hover:bg-green-50 border-white font-semibold"
            onClick={() => navigate('/register')}
          >
            Garantir Vaga <ArrowRight className="ml-1 w-4 h-4" />
          </Button>
        </div>
      </motion.div>

      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white/80 backdrop-blur-lg shadow-lg sticky top-0 z-50"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                TamanduAI
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => navigate('/')}>
                Voltar à Home
              </Button>
              <Button
                variant="default"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                onClick={() => navigate('/register')}
              >
                Começar Grátis
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 text-base">
              <Gift className="mr-2 h-5 w-5" />
              🎉 Programa Beta - Ganhe 3 Meses Grátis!
            </Badge>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Escolha o Plano Ideal para Você
            </h1>

            <p className="text-xl text-gray-600 mb-4 leading-relaxed max-w-3xl mx-auto">
              Desde professores individuais até grandes redes escolares, temos um plano que se adapta às suas necessidades.
            </p>
            <p className="text-lg text-green-600 font-semibold mb-8 max-w-3xl mx-auto">
              ✨ Cadastre-se agora e ganhe 3 meses gratuitos do plano Pro • Vagas limitadas: 847/1000
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className={billingCycle === 'monthly' ? 'font-semibold text-gray-900' : 'text-gray-600'}>
                Mensal
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  billingCycle === 'yearly' ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                    billingCycle === 'yearly' ? 'translate-x-8' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={billingCycle === 'yearly' ? 'font-semibold text-gray-900' : 'text-gray-600'}>
                Anual
              </span>
              <Badge className="bg-green-100 text-green-700 ml-2">
                <Gift className="mr-1 h-3 w-3" />
                2 meses grátis
              </Badge>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Teacher Plans */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Planos para Professores</h2>
            <p className="text-gray-600">Escolha o plano que melhor se adapta ao seu tamanho</p>
          </motion.div>

          <Tabs defaultValue="teachers" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="teachers" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Professores
              </TabsTrigger>
              <TabsTrigger value="schools" className="flex items-center gap-2">
                <Crown className="h-4 w-4" />
                Escolas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="teachers">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {teacherPlans.map((plan, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={`relative h-full ${plan.popular ? 'border-4 border-indigo-500 shadow-2xl scale-105' : ''}`}>
                      {plan.popular && (
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1">
                            Mais Popular
                          </Badge>
                        </div>
                      )}
                      {plan.badge && (
                        <div className="absolute -top-2 -right-2">
                          <Badge className="bg-red-500 text-white px-2 py-1 text-xs">
                            {plan.badge}
                          </Badge>
                        </div>
                      )}

                      <CardHeader className="text-center pb-4">
                        <CardTitle className="text-2xl">{plan.name}</CardTitle>
                        <CardDescription className="text-sm">{plan.description}</CardDescription>

                        <div className="mt-4">
                          {plan.price === 'Custom' ? (
                            <span className="text-4xl font-bold">Personalizado</span>
                          ) : (
                            <>
                              <div className="flex items-center justify-center gap-2">
                                {plan.originalPrice && (
                                  <span className="text-lg text-gray-500 line-through">
                                    R$ {plan.originalPrice}
                                  </span>
                                )}
                                <span className="text-4xl font-bold">R$ {plan.price}</span>
                              </div>
                              <span className="text-gray-600">/{billingCycle === 'monthly' ? 'mês' : 'mês'}</span>
                              {billingCycle === 'yearly' && (
                                <p className="text-sm text-green-600 mt-1">
                                  R$ {(plan.price * 10).toFixed(0)}/ano (2 meses grátis)
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-3">
                        <Button
                          className={`w-full ${
                            plan.popular
                              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                          }`}
                          onClick={() => navigate('/register')}
                        >
                          {plan.price === 0 ? 'Começar Grátis' : 'Começar Teste'}
                        </Button>

                        <div className="space-y-2">
                          {plan.features.map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-sm">
                              {feature.included ? (
                                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                              ) : (
                                <XCircle className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                              )}
                              <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                                {feature.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="schools">
              <div className="grid md:grid-cols-3 gap-6">
                {schoolPlans.map((plan, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={`relative h-full ${plan.name === 'Escola Média' ? 'border-4 border-orange-500 shadow-2xl scale-105' : ''}`}>
                      {plan.name === 'Escola Média' && (
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-1">
                            Recomendado
                          </Badge>
                        </div>
                      )}

                      <CardHeader className="text-center pb-4">
                        <CardTitle className="text-2xl">{plan.name}</CardTitle>
                        <CardDescription className="text-sm">{plan.description}</CardDescription>

                        <div className="mt-4 space-y-2">
                          <div className="flex items-center justify-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4 text-indigo-600" />
                              <span>{plan.teachers} professores</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Trophy className="h-4 w-4 text-purple-600" />
                              <span>{plan.students} alunos</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-center">
                            {plan.price === 'Custom' ? (
                              <span className="text-4xl font-bold">Personalizado</span>
                            ) : (
                              <>
                                {plan.originalPrice && (
                                  <span className="text-lg text-gray-500 line-through mr-2">
                                    R$ {plan.originalPrice}
                                  </span>
                                )}
                                <span className="text-4xl font-bold">R$ {plan.price}</span>
                                <span className="text-gray-600">/{billingCycle === 'monthly' ? 'mês' : 'mês'}</span>
                              </>
                            )}
                          </div>
                          {plan.badge && plan.badge !== 'Personalizado' && (
                            <Badge className="bg-red-500 text-white">{plan.badge}</Badge>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-3">
                        <Button
                          className={`w-full ${
                            plan.name === 'Escola Média'
                              ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white'
                              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                          }`}
                          onClick={plan.price === 'Custom' ? () => navigate('/contact') : () => navigate('/register')}
                        >
                          {plan.price === 'Custom' ? 'Falar com Vendas' : 'Começar Teste'}
                        </Button>

                        <div className="space-y-2">
                          {plan.features.map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Unique Value Props */}
      <section className="py-16 px-6 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Por que Escolher o TamanduAI?</h2>
            <p className="text-gray-600">Diferenciais que fazem toda a diferença</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4">IA Proprietária com RAG</h3>
                <p className="text-gray-600 mb-4">
                  Modelo treinado especificamente para educação brasileira, com Retrieval-Augmented Generation baseado nos materiais do professor.
                </p>
                <Badge className="bg-violet-100 text-violet-700">Único no Brasil</Badge>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <DollarSign className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4">Programa de Descontos Único</h3>
                <p className="text-gray-600 mb-4">
                  Contribua questões ao banco coletivo e ganhe até 30% de desconto. Professores ganham dinheiro compartilhando conhecimento.
                </p>
                <Badge className="bg-green-100 text-green-700">Flywheel de Valor</Badge>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4">Analytics com Machine Learning</h3>
                <p className="text-gray-600 mb-4">
                  Previsão de desempenho, clustering automático de alunos, análise de sentimento e recomendações personalizadas.
                </p>
                <Badge className="bg-orange-100 text-orange-700">4 Modelos de ML</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Perguntas Frequentes</h2>
          </motion.div>

          <div className="space-y-6">
            {[
              {
                q: "O TamanduAI é gratuito?",
                a: "Sim! Oferecemos plano gratuito com recursos básicos. Para funcionalidades avançadas como chatbot ilimitado e analytics ML, nossos planos começam em R$ 49/mês."
              },
              {
                q: "Preciso de conhecimento técnico?",
                a: "Não! Nossa interface é intuitiva e oferecemos tutoriais em vídeo, onboarding personalizado e suporte humano via WhatsApp."
              },
              {
                q: "Meus dados estão seguros?",
                a: "Absolutamente! Somos 100% LGPD compliant e usamos criptografia end-to-end. Professores controlam 100% dos dados de seus alunos."
              },
              {
                q: "Posso usar em qualquer dispositivo?",
                a: "Sim! O TamanduAI é responsivo e funciona perfeitamente em computadores, tablets e smartphones."
              },
              {
                q: "Como funciona o programa de descontos?",
                a: "Quanto mais questões você contribui para o banco coletivo, maior o desconto na mensalidade (até 30%). As questões são revisadas por IA + moderação humana."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg p-6 shadow-md"
              >
                <h3 className="font-semibold text-lg mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto text-center max-w-4xl relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="mb-6 bg-green-500 text-white px-6 py-3 text-base font-bold">
              <Sparkles className="mr-2 h-5 w-5" />
              🎉 Programa Beta - 3 Meses Grátis!
            </Badge>

            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Transforme sua Educação com IA
            </h2>
            <p className="text-xl md:text-2xl mb-8 text-indigo-100 leading-relaxed">
              Seja um dos primeiros 1.000 educadores a ganhar <strong className="text-white">3 meses de acesso gratuito</strong> ao plano Pro.
              Depois, continue por apenas <strong className="text-white">R$ 69/mês</strong>.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Button
                size="lg"
                className="bg-white text-indigo-600 hover:bg-gray-100 hover:scale-105 px-12 py-7 text-xl font-bold shadow-2xl transition-all duration-300"
                onClick={() => navigate('/register')}
              >
                <Gift className="mr-2 w-6 h-6" />
                Garantir Minha Vaga no Beta
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-2 border-white text-white hover:bg-white/20 px-10 py-7 text-xl font-semibold"
                onClick={() => navigate('/contact')}
              >
                Falar com Especialista
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 text-left">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <CheckCircle className="w-8 h-8 mb-3" />
                <h3 className="font-bold text-lg mb-2">Sem Cartão de Crédito</h3>
                <p className="text-indigo-100 text-sm">Cadastro 100% gratuito. Só adiciona cartão após os 3 meses se quiser continuar.</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <Zap className="w-8 h-8 mb-3" />
                <h3 className="font-bold text-lg mb-2">Acesso Imediato</h3>
                <p className="text-indigo-100 text-sm">Comece a usar todos os recursos do plano Pro em menos de 5 minutos.</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <Shield className="w-8 h-8 mb-3" />
                <h3 className="font-bold text-lg mb-2">Cancele Quando Quiser</h3>
                <p className="text-indigo-100 text-sm">Sem compromisso. Cancele a qualquer momento com 1 clique, sem multas.</p>
              </div>
            </div>

            <p className="mt-8 text-base text-indigo-200">
              ⏰ Vagas limitadas • 🎯 847/1000 vagas restantes • 🔒 Dados 100% seguros e LGPD compliant
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-slate-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">TamanduAI</span>
              </div>
              <p className="text-slate-400 max-w-md mb-4">
                Revolucionando a educação através da inteligência artificial.
                Plataforma completa para professores, escolas e alunos.
              </p>
              <div className="flex gap-3">
                <Badge className="bg-green-600 text-white">
                  <Sparkles className="mr-1 h-3 w-3" />
                  Beta Ativo
                </Badge>
                <Badge className="bg-indigo-600 text-white">
                  100% LGPD
                </Badge>
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-lg">Produto</h3>
              <ul className="space-y-2 text-slate-400">
                <li><Link to="/#features" className="hover:text-white transition-colors">Recursos</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">Preços</Link></li>
                <li><Link to="/docs" className="hover:text-white transition-colors">Documentação</Link></li>
                <li><a href="/#testimonials" className="hover:text-white transition-colors">Depoimentos</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-lg">Empresa</h3>
              <ul className="space-y-2 text-slate-400">
                <li><Link to="/contact" className="hover:text-white transition-colors">Contato</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacidade</Link></li>
                <li><Link to="/terms-of-use" className="hover:text-white transition-colors">Termos de Uso</Link></li>
                <li><Link to="/cookies" className="hover:text-white transition-colors">Cookies</Link></li>
                <li><Link to="/strategic-plan" className="hover:text-white transition-colors">Plano Estratégico</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center">
            <p className="text-slate-500">© 2025 TamanduAI. Todos os direitos reservados.</p>
            <p className="text-slate-600 text-sm mt-2">Feito com ❤️ para educadores brasileiros</p>
          </div>
        </div>
      </footer>

      {/* Cookie Banner */}
      <CookieBanner />
    </div>
  );
};

export default PricingPage;

