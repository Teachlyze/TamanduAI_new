import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircleIcon,
  ArrowRightIcon,
  UserIcon,
  AcademicCapIcon,
  ClockIcon,
  ServerIcon,
  ChatBubbleLeftRightIcon,
  ArrowLeftCircleIcon as ArrowLeftIcon
} from '@heroicons/react/24/outline';

const PricingCard = ({ title, price, period, popular = false, children }) => (
  <div className={`relative flex flex-col p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border ${popular ? 'border-blue-500 dark:border-blue-600' : 'border-gray-200 dark:border-gray-700'}`}>
    {popular && (
      <div className="absolute top-0 left-1/2 transform -translate-y-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-4 py-1 rounded-full whitespace-nowrap">
        Mais Popular
      </div>
    )}
    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
    <div className="mb-4">
      <span className="text-4xl font-extrabold text-gray-900 dark:text-white">{price}</span>
      <span className="text-gray-500 dark:text-gray-400">/{period}</span>
    </div>
    <div className="space-y-3 mb-6">
      {children}
    </div>
    <Link 
      to="/register" 
      className={`mt-auto w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors ${
        popular 
          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700' 
          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
      }`}
    >
      Começar agora
      <ArrowRightIcon className="w-4 h-4 ml-2" />
    </Link>
  </div>
);

const FeatureItem = ({ children }) => (
  <div className="flex items-start">
    <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
    <span className="text-gray-700 dark:text-gray-300">{children}</span>
  </div>
);

const PricingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors mb-8">
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Voltar para a página inicial
          </Link>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl mb-4">
            Planos e Preços
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Escolha o plano perfeito para suas necessidades educacionais
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Plano Individual */}
          <PricingCard 
            title="Professor Autônomo" 
            price="R$ 39" 
            period="mês"
            popular={false}
          >
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">ou R$ 399/ano (economize 15%)</p>
            <div className="space-y-3">
              <FeatureItem>1 turma</FeatureItem>
              <FeatureItem>Até 50 alunos</FeatureItem>
              <FeatureItem>Chatbot IA (100K tokens/mês)</FeatureItem>
              <FeatureItem>Editor de atividades</FeatureItem>
              <FeatureItem>Submissões e correções</FeatureItem>
              <FeatureItem>500 MB de armazenamento</FeatureItem>
            </div>
          </PricingCard>

          {/* Plano Escola Essencial */}
          <PricingCard 
            title="Escola Essencial" 
            price="R$ 299" 
            period="mês"
            popular={true}
          >
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">por escola</p>
            <div className="space-y-3">
              <FeatureItem>Até 10 professores</FeatureItem>
              <FeatureItem>Até 300 alunos</FeatureItem>
              <FeatureItem>Chatbot IA (1M tokens/mês)</FeatureItem>
              <FeatureItem>Atividades + dashboards por turma</FeatureItem>
              <FeatureItem>Acompanhamento de desempenho</FeatureItem>
              <FeatureItem>5 GB de armazenamento</FeatureItem>
              <FeatureItem>Reuniões até 1h</FeatureItem>
              <FeatureItem>Suporte por e-mail</FeatureItem>
            </div>
          </PricingCard>

          {/* Plano Escola Pro */}
          <PricingCard 
            title="Escola Pro" 
            price="R$ 699" 
            period="mês"
            popular={false}
          >
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">por escola</p>
            <div className="space-y-3">
              <FeatureItem>Até 30 professores</FeatureItem>
              <FeatureItem>Até 900 alunos</FeatureItem>
              <FeatureItem>Chatbot IA (3M tokens/mês)</FeatureItem>
              <FeatureItem>Gravação de aulas</FeatureItem>
              <FeatureItem>Integração com sistemas externos (LTI)</FeatureItem>
              <FeatureItem>Analytics avançado</FeatureItem>
              <FeatureItem>20 GB de armazenamento</FeatureItem>
              <FeatureItem>Reuniões até 2h com gravação</FeatureItem>
              <FeatureItem>Suporte prioritário</FeatureItem>
            </div>
          </PricingCard>
        </div>

        {/* Add-ons Section */}
        <div className="mt-16 max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Add-ons Disponíveis</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">+10 professores</h3>
              <p className="text-gray-600 dark:text-gray-300">Adicione mais 10 professores à sua conta</p>
              <p className="text-blue-600 dark:text-blue-400 font-bold mt-2">R$ 150/mês</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">+5 GB de armazenamento</h3>
              <p className="text-gray-600 dark:text-gray-300">Espaço adicional para seus arquivos</p>
              <p className="text-blue-600 dark:text-blue-400 font-bold mt-2">R$ 20/mês</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">+1M tokens IA</h3>
              <p className="text-gray-600 dark:text-gray-300">Adicione mais 1 milhão de tokens ao seu plano</p>
              <p className="text-blue-600 dark:text-blue-400 font-bold mt-2">R$ 50/mês</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Gravação de aulas</h3>
              <p className="text-gray-600 dark:text-gray-300">Adicione gravação de aulas ao seu plano</p>
              <p className="text-blue-600 dark:text-blue-400 font-bold mt-2">R$ 50/mês</p>
            </div>
          </div>
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Versão White-label</h3>
            <p className="text-blue-700 dark:text-blue-300">Personalize a plataforma com a marca da sua instituição</p>
            <p className="text-blue-600 dark:text-blue-400 font-bold mt-2">Sob consulta</p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Dúvidas sobre qual plano escolher?</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Nossa equipe está pronta para ajudar você a encontrar a melhor solução para suas necessidades.</p>
          <Link 
            to="/contato" 
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Fale com nossa equipe
            <ArrowRightIcon className="ml-2 -mr-1 w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
