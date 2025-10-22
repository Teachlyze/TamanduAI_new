import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Database, User, Mail, Settings as SettingsIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  };

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="group inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" />
            Voltar
          </button>
          
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700/50">
            <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 p-8 text-white">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-100">
                    Política de Privacidade
                  </h1>
                  <p className="mt-2 text-purple-100">Última atualização: 23 de Julho de 2025</p>
                </div>
                <div className="mt-4 md:mt-0">
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Shield className="h-8 w-8 text-slate-900 dark:text-white" />
                  </div>
                </div>
              </div>
            </div>
            
            <motion.div 
              className="p-8 md:p-10 max-w-none"
              variants={container}
              initial="hidden"
              animate="visible"
            >
              <motion.section 
                className="mb-12"
                variants={fadeInUp}
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 pb-3 border-b border-gray-200 dark:border-gray-700 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center mr-3 text-sm font-medium">
                    <Shield className="w-4 h-4" />
                  </span>
                  Introdução
                </h2>
                <div className="pl-11">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    A sua privacidade é importante para nós. Esta Política de Privacidade explica como a TamanduAI coleta, usa, armazena e protege as informações pessoais dos usuários da nossa plataforma de ensino baseada em IA.
                  </p>
                </div>
              </motion.section>

              <motion.section 
                className="mb-12"
                variants={fadeInUp}
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 pb-3 border-b border-gray-200 dark:border-gray-700 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mr-3 text-sm font-medium">
                    <Database className="w-4 h-4" />
                  </span>
                  Coleta de Dados
                </h2>
                <div className="pl-11">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    Coletamos diferentes tipos de informações para fornecer e melhorar nossos serviços, incluindo:
                  </p>
                  <ul className="list-disc pl-6 mt-3 space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="leading-relaxed">Informações de cadastro (nome, e-mail, etc.)</li>
                    <li className="leading-relaxed">Dados de uso da plataforma</li>
                    <li className="leading-relaxed">Informações de pagamento (processadas de forma segura por processadores de pagamento terceirizados)</li>
                    <li className="leading-relaxed">Dados de navegação e cookies</li>
                  </ul>
                </div>
              </motion.section>

              <motion.section 
                className="mb-12"
                variants={fadeInUp}
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 pb-3 border-b border-gray-200 dark:border-gray-700 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 flex items-center justify-center mr-3 text-sm font-medium">
                    <SettingsIcon className="w-4 h-4" />
                  </span>
                  Uso dos Dados
                </h2>
                <div className="pl-11">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    Seus dados são utilizados exclusivamente para:
                  </p>
                  <ul className="list-disc pl-6 mt-3 space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="leading-relaxed">Fornecer acesso à plataforma e seus recursos</li>
                    <li className="leading-relaxed">Personalizar sua experiência de aprendizado</li>
                    <li className="leading-relaxed">Melhorar continuamente nossos serviços</li>
                    <li className="leading-relaxed">Enviar comunicações importantes sobre sua conta</li>
                    <li className="leading-relaxed">Garantir a segurança e integridade da plataforma</li>
                  </ul>
                </div>
              </motion.section>

              <motion.section 
                className="mb-12"
                variants={fadeInUp}
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 pb-3 border-b border-gray-200 dark:border-gray-700 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mr-3 text-sm font-medium">
                    <User className="w-4 h-4" />
                  </span>
                  Seus Direitos
                </h2>
                <div className="pl-11">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    De acordo com a LGPD, você tem direito a:
                  </p>
                  <ul className="list-disc pl-6 mt-3 space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="leading-relaxed"><strong>Acesso</strong>: Solicitar cópia dos seus dados pessoais</li>
                    <li className="leading-relaxed"><strong>Correção</strong>: Atualizar ou corrigir informações desatualizadas</li>
                    <li className="leading-relaxed"><strong>Exclusão</strong>: Solicitar a exclusão dos seus dados</li>
                    <li className="leading-relaxed"><strong>Portabilidade</strong>: Receber seus dados em formato estruturado</li>
                    <li className="leading-relaxed"><strong>Revogação de consentimento</strong>: A qualquer momento</li>
                  </ul>
                </div>
              </motion.section>

              <motion.section 
                className="mb-12"
                variants={fadeInUp}
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 pb-3 border-b border-gray-200 dark:border-gray-700 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400 flex items-center justify-center mr-3 text-sm font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  Compartilhamento de Dados
                </h2>
                <div className="pl-11">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    Seus dados pessoais não são comercializados ou compartilhados com terceiros, exceto quando necessário para:
                  </p>
                  <ul className="list-disc pl-6 mt-3 space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="leading-relaxed">Fornecedores de serviços que nos auxiliam na operação da plataforma</li>
                    <li className="leading-relaxed">Cumprimento de obrigações legais ou regulatórias</li>
                    <li className="leading-relaxed">Proteção de direitos, propriedade ou segurança da TamanduAI, nossos usuários ou terceiros</li>
                  </ul>
                </div>
              </motion.section>

              <motion.section 
                className="mb-12"
                variants={fadeInUp}
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 pb-3 border-b border-gray-200 dark:border-gray-700 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 flex items-center justify-center mr-3 text-sm font-medium">
                    <Lock className="w-4 h-4" />
                  </span>
                  Segurança dos Dados
                </h2>
                <div className="pl-11">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    Implementamos medidas de segurança técnicas e organizacionais para proteger seus dados contra:
                  </p>
                  <ul className="list-disc pl-6 mt-3 space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="leading-relaxed">Acesso não autorizado</li>
                    <li className="leading-relaxed">Alteração não autorizada</li>
                    <li className="leading-relaxed">Divulgação não autorizada</li>
                    <li className="leading-relaxed">Destruição ou perda acidental</li>
                  </ul>
                </div>
              </motion.section>

              <motion.section 
                className="mb-12"
                variants={fadeInUp}
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 pb-3 border-b border-gray-200 dark:border-gray-700 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mr-3 text-sm font-medium">
                    <Mail className="w-4 h-4" />
                  </span>
                  Contato
                </h2>
                <div className="pl-11">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    Para exercer seus direitos ou tirar dúvidas sobre privacidade, entre em contato conosco:
                  </p>
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-6 max-w-lg">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg p-3">
                        <Mail className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Fale com nossa equipe</h3>
                        <a 
                          href="mailto:privacy@tamanduai.com" 
                          className="mt-1 text-indigo-600 hover:underline dark:text-indigo-400 text-base"
                        >
                          privacy@tamanduai.com
                        </a>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          Horário de atendimento: Segunda a Sexta, das 9h às 18h
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.section>

              <motion.div 
                className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center"
                variants={fadeInUp}
              >
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {new Date().getFullYear()} TamanduAI. Todos os direitos reservados.
                </p>
                <div className="mt-4 flex justify-center space-x-6">
                  <Link to="/privacy" className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors text-sm">
                    Política de Privacidade
                  </Link>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                  <Link to="/terms" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors text-sm">
                    Termos de Uso
                  </Link>
                </div>
              </motion.div>
              
              <div className="mt-8 text-center">
                <Link 
                  to="/"
                  className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" /> Voltar para a Página Inicial
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

