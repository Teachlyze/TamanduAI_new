/**
 * NOVOS COMPONENTES DE IDIOMA - TamanduAI
 *
 * Este arquivo demonstra como usar os novos componentes de idioma
 * que foram criados para substituir o seletor antigo.
 */

import React from 'react';
import LanguageSelector, { LanguageSelectorSelect } from './components/LanguageSelector';
import LanguageSettings from './components/LanguageSettings';

/**
 * EXEMPLO 1: Uso básico do LanguageSelector (recomendado para header/navbar)
 *
 * Este componente é mais compacto e elegante para uso em barras de navegação.
 */
const HeaderWithLanguageSelector = () => {
  return (
    <header className="flex justify-between items-center p-4 bg-white dark:bg-gray-900">
      <h1 className="text-xl font-bold">TamanduAI</h1>
      <LanguageSelector />
    </header>
  );
};

/**
 * EXEMPLO 2: Uso do LanguageSelectorSelect (versão com Radix UI)
 *
 * Este componente usa o sistema de Select nativo do projeto e é mais acessível.
 */
const HeaderWithSelectVersion = () => {
  return (
    <header className="flex justify-between items-center p-4 bg-white dark:bg-gray-900">
      <h1 className="text-xl font-bold">TamanduAI</h1>
      <LanguageSelectorSelect />
    </header>
  );
};

/**
 * EXEMPLO 3: Uso em página de configurações
 *
 * Para configurações mais detalhadas, use o componente LanguageSettings.
 */
const SettingsPage = () => {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Configurações</h2>

      {/* Outras configurações... */}

      <LanguageSettings />

      {/* Mais configurações... */}
    </div>
  );
};

/**
 * FUNCIONALIDADES DOS NOVOS COMPONENTES:
 *
 * ✅ Detecção automática de idioma baseada no navegador
 * ✅ Persistência da escolha do usuário no localStorage
 * ✅ Interface mais bonita e intuitiva
 * ✅ Suporte a tema escuro
 * ✅ Acessibilidade melhorada
 * ✅ Animações suaves
 * ✅ Compatibilidade com todos os idiomas suportados (PT, EN, ES)
 *
 * 📱 RESPONSIVO:
 * - Em telas pequenas, mostra apenas a bandeira
 * - Em telas maiores, mostra bandeira + nome nativo do idioma
 *
 * 🎨 TEMAS:
 * - Suporte completo a modo escuro
 * - Cores consistentes com o design system
 *
 * 🔄 FUNCIONAMENTO:
 * 1. Detecta automaticamente o idioma do navegador na primeira visita
 * 2. Permite ao usuário alterar o idioma
 * 3. Salva a preferência no localStorage
 * 4. Aplica a mudança em tempo real
 *
 * 📋 IDIOMAS SUPORTADOS:
 * - 🇧🇷 Português (BR) - Padrão
 * - 🇺🇸 English
 * - 🇪🇸 Español
 */

export {
  HeaderWithLanguageSelector,
  HeaderWithSelectVersion,
  SettingsPage,
  LanguageSelector,
  LanguageSelectorSelect,
  LanguageSettings
};
