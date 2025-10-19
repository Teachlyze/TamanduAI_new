import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const TermsOfUse = () => {
  const navigate = useNavigate();

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  };

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
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
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                    Termos de Uso
                  </h1>
                  <p className="mt-2 text-blue-100">Última atualização: 23 de Julho de 2025</p>
                </div>
                <div className="mt-4 md:mt-0">
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
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
                  <span className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mr-3 text-sm font-medium">1</span>
                  Aceitação dos Termos
                </h2>
                <div className="pl-11">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    Ao acessar e usar a plataforma TamanduAI, você concorda com estes termos de uso. A utilização dos nossos serviços pressupõe a aceitação plena e sem reservas dos termos aqui estabelecidos.
                  </p>
                </div>
              </motion.section>

              <motion.section 
                className="mb-12"
                variants={fadeInUp}
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 pb-3 border-b border-gray-200 dark:border-gray-700 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mr-3 text-sm font-medium">2</span>
                  Uso da Plataforma
                </h2>
                <div className="pl-11">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    A plataforma TamanduAI deve ser utilizada exclusivamente para fins educacionais e de aprendizado. Ao utilizar nossos serviços, você concorda em:
                  </p>
                  <ul className="list-disc pl-6 mt-3 space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="leading-relaxed">Não compartilhar conteúdo inadequado, ofensivo ou ilegal</li>
                    <li className="leading-relaxed">Respeitar os direitos autorais e de propriedade intelectual</li>
                    <li className="leading-relaxed">Manter a confidencialidade de suas credenciais de acesso</li>
                    <li className="leading-relaxed">Não realizar atividades que possam comprometer a segurança da plataforma</li>
                    <li className="leading-relaxed">Utilizar os recursos de forma ética e responsável</li>
                  </ul>
                </div>
              </motion.section>

              <motion.section 
                className="mb-12"
                variants={fadeInUp}
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 pb-3 border-b border-gray-200 dark:border-gray-700 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mr-3 text-sm font-medium">3</span>
                  Responsabilidades
                </h2>
                <div className="pl-11">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    Como usuário da plataforma, você é integralmente responsável por:
                  </p>
                  <ul className="list-disc pl-6 mt-3 space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="leading-relaxed">Manter suas informações de cadastro atualizadas e precisas</li>
                    <li className="leading-relaxed">Garantir a segurança e confidencialidade de sua conta</li>
                    <li className="leading-relaxed">Respeitar as diretrizes e políticas da plataforma</li>
                    <li className="leading-relaxed">Pelo conteúdo que você compartilha ou publica através da plataforma</li>
                    <li className="leading-relaxed">Por todas as atividades que ocorram em sua conta</li>
                  </ul>
                </div>
              </motion.section>

              <motion.section 
                className="mb-12"
                variants={fadeInUp}
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 pb-3 border-b border-gray-200 dark:border-gray-700 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mr-3 text-sm font-medium">4</span>
                  Alterações nos Termos
                </h2>
                <div className="pl-11">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    Reservamo-nos o direito de modificar estes termos a qualquer momento. Notificaremos os usuários sobre mudanças significativas através do e-mail cadastrado ou por meio de notificações na plataforma. O uso contínuo dos nossos serviços após tais alterações constitui sua aceitação dos novos termos.
                  </p>
                </div>
              </motion.section>

              <motion.section 
                className="mb-12"
                variants={fadeInUp}
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 pb-3 border-b border-gray-200 dark:border-gray-700 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mr-3 text-sm font-medium">5</span>
                  Contato
                </h2>
                <div className="pl-11">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    Em caso de dúvidas sobre estes Termos de Uso, entre em contato conosco:
                  </p>
                  
                  <div className="bg-blue-50 dark:bg-muted/30 rounded-xl p-6 max-w-lg">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900/50 rounded-lg p-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Suporte por E-mail</h3>
                        <a 
                          href="mailto:contato@tamanduai.com" 
                          className="mt-1 text-blue-600 hover:underline dark:text-blue-400 text-base"
                        >
                          contato@tamanduai.com
                        </a>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          Nossa equipe está pronta para ajudar de segunda a sexta, das 9h às 18h.
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
                  © {new Date().getFullYear()} TamanduAI. Todos os direitos reservados.
                </p>
                <div className="mt-4 flex justify-center space-x-6">
                  <Link to="/privacy" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors text-sm">
                    Política de Privacidade
                  </Link>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                  <Link to="/terms" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors text-sm">
                    Termos de Uso
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsOfUse;

