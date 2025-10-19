#!/usr/bin/env node

/**
 * Script de Verificação da Migração Premium
 * Verifica se todos os componentes premium estão sendo usados corretamente
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module equivalents for __dirname and __filename
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Verificando Migração Premium...\n');

const checks = [];

// 1. Verificar App.jsx
console.log('1️⃣ Verificando App.jsx...');
try {
  const appContent = fs.readFileSync(path.join(__dirname, '../src/App.jsx'), 'utf8');
  
  const hasPremiumToaster = appContent.includes('PremiumToaster');
  const hasCommandPalette = appContent.includes('CommandPalette');
  const hasPerformanceMonitoring = appContent.includes('monitorPerformance');
  
  checks.push({
    name: 'App.jsx - PremiumToaster',
    status: hasPremiumToaster ? '✅' : '❌',
    passed: hasPremiumToaster
  });
  
  checks.push({
    name: 'App.jsx - CommandPalette',
    status: hasCommandPalette ? '✅' : '❌',
    passed: hasCommandPalette
  });
  
  checks.push({
    name: 'App.jsx - Performance Monitoring',
    status: hasPerformanceMonitoring ? '✅' : '❌',
    passed: hasPerformanceMonitoring
  });
  
  console.log(`   ${hasPremiumToaster ? '✅' : '❌'} PremiumToaster`);
  console.log(`   ${hasCommandPalette ? '✅' : '❌'} CommandPalette`);
  console.log(`   ${hasPerformanceMonitoring ? '✅' : '❌'} Performance Monitoring\n`);
} catch (error) {
  console.log('   ❌ Erro ao ler App.jsx\n');
  checks.push({ name: 'App.jsx', status: '❌', passed: false });
}

// 2. Verificar rotas
console.log('2️⃣ Verificando Rotas...');
try {
  const routerContent = fs.readFileSync(path.join(__dirname, '../src/routes/router-wrapper.jsx'), 'utf8');
  
  const hasLoginPremium = routerContent.includes("'LoginPagePremium'");
  const hasRegisterPremium = routerContent.includes("'RegisterPagePremium'");
  const hasClassroomsPremium = routerContent.includes("'ClassroomsPagePremium'");
  
  checks.push({
    name: 'Rotas - LoginPagePremium',
    status: hasLoginPremium ? '✅' : '❌',
    passed: hasLoginPremium
  });
  
  checks.push({
    name: 'Rotas - RegisterPagePremium',
    status: hasRegisterPremium ? '✅' : '❌',
    passed: hasRegisterPremium
  });
  
  checks.push({
    name: 'Rotas - ClassroomsPagePremium',
    status: hasClassroomsPremium ? '✅' : '❌',
    passed: hasClassroomsPremium
  });
  
  console.log(`   ${hasLoginPremium ? '✅' : '❌'} LoginPagePremium`);
  console.log(`   ${hasRegisterPremium ? '✅' : '❌'} RegisterPagePremium`);
  console.log(`   ${hasClassroomsPremium ? '✅' : '❌'} ClassroomsPagePremium\n`);
} catch (error) {
  console.log('   ❌ Erro ao ler router-wrapper.jsx\n');
  checks.push({ name: 'Rotas', status: '❌', passed: false });
}

// 3. Verificar componentes premium existem
console.log('3️⃣ Verificando Componentes Premium...');
const componentsToCheck = [
  'PremiumCard.jsx',
  'PremiumButton.jsx',
  'PremiumInput.jsx',
  'PremiumModal.jsx',
  'PremiumToast.jsx',
  'PremiumTable.jsx',
  'ProgressIndicator.jsx',
  'LoadingScreen.jsx',
  'EmptyState.jsx'
];

componentsToCheck.forEach(comp => {
  const exists = fs.existsSync(path.join(__dirname, `../src/components/ui/${comp}`));
  checks.push({
    name: `Componente - ${comp}`,
    status: exists ? '✅' : '❌',
    passed: exists
  });
  console.log(`   ${exists ? '✅' : '❌'} ${comp}`);
});
console.log();

// 4. Verificar componentes avançados
console.log('4️⃣ Verificando Componentes Avançados...');
const advancedComponents = [
  '../src/components/OnboardingTour.jsx',
  '../src/components/CommandPalette.jsx',
  '../src/components/LazyImage.jsx'
];

advancedComponents.forEach(comp => {
  const compName = path.basename(comp);
  const exists = fs.existsSync(path.join(__dirname, comp));
  checks.push({
    name: `Componente Avançado - ${compName}`,
    status: exists ? '✅' : '❌',
    passed: exists
  });
  console.log(`   ${exists ? '✅' : '❌'} ${compName}`);
});
console.log();

// 5. Verificar páginas premium
console.log('5️⃣ Verificando Páginas Premium...');
const premiumPages = [
  'LoginPagePremium.jsx',
  'RegisterPagePremium.jsx',
  'ClassroomsPagePremium.jsx',
  'DashboardHome.jsx'
];

premiumPages.forEach(page => {
  const exists = fs.existsSync(path.join(__dirname, `../src/pages/${page}`));
  checks.push({
    name: `Página - ${page}`,
    status: exists ? '✅' : '❌',
    passed: exists
  });
  console.log(`   ${exists ? '✅' : '❌'} ${page}`);
});
console.log();

// 6. Verificar hooks e utils
console.log('6️⃣ Verificando Hooks e Utils...');
const hooksAndUtils = [
  { path: '../src/hooks/useKeyboardShortcuts.js', name: 'useKeyboardShortcuts.js' },
  { path: '../src/utils/performance.js', name: 'performance.js' }
];

hooksAndUtils.forEach(({ path: filePath, name }) => {
  const exists = fs.existsSync(path.join(__dirname, filePath));
  checks.push({
    name: `Hook/Util - ${name}`,
    status: exists ? '✅' : '❌',
    passed: exists
  });
  console.log(`   ${exists ? '✅' : '❌'} ${name}`);
});
console.log();

// 7. Verificar index.js exporta tudo
console.log('7️⃣ Verificando Exports...');
try {
  const indexContent = fs.readFileSync(path.join(__dirname, '../src/components/ui/index.js'), 'utf8');
  
  const exports = [
    'PremiumCard',
    'PremiumButton',
    'PremiumInput',
    'PremiumModal',
    'PremiumToaster',
    'PremiumTable',
    'ProgressBar',
    'LoadingScreen',
    'EmptyState',
    'OnboardingTour',
    'CommandPalette',
    'LazyImage'
  ];
  
  exports.forEach(exp => {
    const hasExport = indexContent.includes(exp);
    checks.push({
      name: `Export - ${exp}`,
      status: hasExport ? '✅' : '❌',
      passed: hasExport
    });
    console.log(`   ${hasExport ? '✅' : '❌'} ${exp}`);
  });
  console.log();
} catch (error) {
  console.log('   ❌ Erro ao ler index.js\n');
}

// Resumo Final
console.log('═'.repeat(60));
console.log('📊 RESUMO DA VERIFICAÇÃO\n');

const passed = checks.filter(c => c.passed).length;
const total = checks.length;
const percentage = ((passed / total) * 100).toFixed(1);

console.log(`Total de verificações: ${total}`);
console.log(`Passou: ${passed} ✅`);
console.log(`Falhou: ${total - passed} ❌`);
console.log(`Taxa de sucesso: ${percentage}%\n`);

if (percentage === '100.0') {
  console.log('🎉 MIGRAÇÃO 100% COMPLETA! 🏆');
  console.log('\nTodos os componentes premium estão instalados e configurados corretamente!');
  console.log('\n📝 Próximos passos:');
  console.log('   1. npm run dev');
  console.log('   2. Testar Command Palette (⌘K ou Ctrl+K)');
  console.log('   3. Testar toast notifications');
  console.log('   4. Navegar para /login, /register, /dashboard/classes');
  process.exit(0);
} else if (percentage >= '80.0') {
  console.log('⚠️ Migração quase completa. Algumas verificações falharam.');
  console.log('\nVerifique os itens marcados com ❌ acima.');
  process.exit(1);
} else {
  console.log('❌ Migração incompleta. Várias verificações falharam.');
  console.log('\nPor favor, revise a documentação e tente novamente.');
  process.exit(1);
}
