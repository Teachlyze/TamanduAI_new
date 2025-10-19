/**
 * Script de Verificação do Sistema de Gamificação
 * 
 * Verifica se todas as tabelas, policies e seeds foram aplicados corretamente.
 * 
 * Como usar:
 * node scripts/verify-gamification.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

const REQUIRED_TABLES = [
  // Gamificação
  'gamification_profiles',
  'xp_log',
  'badges_catalog',
  'user_badges',
  'achievements_catalog',
  'user_achievements',
  'missions_catalog',
  'user_missions',
  'focus_sessions',
  'class_rank_snapshots',
  
  // Quiz
  'quizzes',
  'quiz_questions',
  'quiz_attempts',
  'quiz_assignments',
  
  // Escola
  'schools',
  'school_admins',
  'school_teachers',
  'school_classes',
  'school_announcements',
  
  // Eventos
  'events_competitions',
  'event_participants',
];

const REQUIRED_BADGES = 17;
const REQUIRED_ACHIEVEMENTS = 14;
const REQUIRED_MISSIONS = 13;

async function verifyTables() {
  console.log('🔍 Verificando tabelas...\n');
  
  let allTablesExist = true;
  
  for (const table of REQUIRED_TABLES) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1);
    
    if (error) {
      console.log(`❌ Tabela "${table}" não encontrada ou sem permissão`);
      console.log(`   Erro: ${error.message}\n`);
      allTablesExist = false;
    } else {
      console.log(`✅ Tabela "${table}" OK`);
    }
  }
  
  return allTablesExist;
}

async function verifyCatalogs() {
  console.log('\n🔍 Verificando catálogos (seeds)...\n');
  
  let allCatalogsOK = true;
  
  // Badges
  const { data: badges, error: badgesError } = await supabase
    .from('badges_catalog')
    .select('*');
  
  if (badgesError) {
    console.log(`❌ Erro ao buscar badges: ${badgesError.message}`);
    allCatalogsOK = false;
  } else if (!badges || badges.length < REQUIRED_BADGES) {
    console.log(`⚠️  Badges: ${badges?.length || 0}/${REQUIRED_BADGES} (faltam ${REQUIRED_BADGES - (badges?.length || 0)})`);
    allCatalogsOK = false;
  } else {
    console.log(`✅ Badges: ${badges.length}/${REQUIRED_BADGES}`);
  }
  
  // Achievements
  const { data: achievements, error: achievementsError } = await supabase
    .from('achievements_catalog')
    .select('*');
  
  if (achievementsError) {
    console.log(`❌ Erro ao buscar achievements: ${achievementsError.message}`);
    allCatalogsOK = false;
  } else if (!achievements || achievements.length < REQUIRED_ACHIEVEMENTS) {
    console.log(`⚠️  Achievements: ${achievements?.length || 0}/${REQUIRED_ACHIEVEMENTS} (faltam ${REQUIRED_ACHIEVEMENTS - (achievements?.length || 0)})`);
    allCatalogsOK = false;
  } else {
    console.log(`✅ Achievements: ${achievements.length}/${REQUIRED_ACHIEVEMENTS}`);
  }
  
  // Missions
  const { data: missions, error: missionsError } = await supabase
    .from('missions_catalog')
    .select('*');
  
  if (missionsError) {
    console.log(`❌ Erro ao buscar missions: ${missionsError.message}`);
    allCatalogsOK = false;
  } else if (!missions || missions.length < REQUIRED_MISSIONS) {
    console.log(`⚠️  Missions: ${missions?.length || 0}/${REQUIRED_MISSIONS} (faltam ${REQUIRED_MISSIONS - (missions?.length || 0)})`);
    allCatalogsOK = false;
  } else {
    console.log(`✅ Missions: ${missions.length}/${REQUIRED_MISSIONS}`);
  }
  
  return allCatalogsOK;
}

async function verifyRLS() {
  console.log('\n🔍 Verificando RLS (Row Level Security)...\n');
  
  // Tentar acessar tabela sem auth (deve falhar por RLS)
  const { data, error } = await supabase
    .from('gamification_profiles')
    .select('*')
    .limit(1);
  
  // Se conseguiu acessar sem auth e não está vazio, RLS pode estar desabilitado
  if (!error && data && data.length > 0) {
    console.log('⚠️  RLS pode estar desabilitado em gamification_profiles');
    console.log('   (Ou você está usando service_role_key)');
    return false;
  }
  
  console.log('✅ RLS parece estar ativo (acesso negado sem auth)');
  return true;
}

async function verifyEnums() {
  console.log('\n🔍 Verificando tipos enum...\n');
  
  const enums = [
    'mission_type',
    'period_type',
    'quiz_question_type',
    'school_admin_role',
    'school_teacher_status',
  ];
  
  // Note: Verificar enums via API é complexo, então apenas reportamos
  console.log('ℹ️  Tipos enum esperados:');
  enums.forEach(e => console.log(`   - ${e}`));
  console.log('   (Verifique manualmente no Supabase se necessário)');
  
  return true;
}

async function showSampleData() {
  console.log('\n📊 Dados de exemplo dos catálogos:\n');
  
  // Badges
  const { data: badges } = await supabase
    .from('badges_catalog')
    .select('code, name')
    .limit(5);
  
  if (badges && badges.length > 0) {
    console.log('🏆 Badges (primeiros 5):');
    badges.forEach(b => console.log(`   - ${b.name} (${b.code})`));
  }
  
  // Achievements
  const { data: achievements } = await supabase
    .from('achievements_catalog')
    .select('code, name, reward_xp')
    .limit(5);
  
  if (achievements && achievements.length > 0) {
    console.log('\n🎯 Achievements (primeiros 5):');
    achievements.forEach(a => console.log(`   - ${a.name} (+${a.reward_xp} XP)`));
  }
  
  // Missions
  const { data: missions } = await supabase
    .from('missions_catalog')
    .select('type, name, reward_xp')
    .limit(5);
  
  if (missions && missions.length > 0) {
    console.log('\n📋 Missions (primeiras 5):');
    missions.forEach(m => console.log(`   - [${m.type}] ${m.name} (+${m.reward_xp} XP)`));
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('🎮 Verificação do Sistema de Gamificação');
  console.log('═══════════════════════════════════════════════════\n');
  
  if (!process.env.VITE_SUPABASE_URL && !process.env.SUPABASE_URL) {
    console.log('❌ ERRO: Variáveis de ambiente não configuradas!');
    console.log('   Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY\n');
    process.exit(1);
  }
  
  const tablesOK = await verifyTables();
  const catalogsOK = await verifyCatalogs();
  const rlsOK = await verifyRLS();
  const enumsOK = await verifyEnums();
  
  await showSampleData();
  
  console.log('\n═══════════════════════════════════════════════════');
  console.log('📊 RESULTADO DA VERIFICAÇÃO');
  console.log('═══════════════════════════════════════════════════\n');
  
  console.log(`Tabelas:   ${tablesOK ? '✅ OK' : '❌ ERRO'}`);
  console.log(`Catálogos: ${catalogsOK ? '✅ OK' : '⚠️  INCOMPLETO'}`);
  console.log(`RLS:       ${rlsOK ? '✅ OK' : '⚠️  VERIFICAR'}`);
  console.log(`Enums:     ${enumsOK ? 'ℹ️  VERIFICAR MANUAL' : ''}`);
  
  const allOK = tablesOK && catalogsOK;
  
  if (allOK) {
    console.log('\n🎉 Sistema de gamificação está pronto para uso!\n');
  } else {
    console.log('\n⚠️  Alguns itens precisam de atenção.\n');
    console.log('📝 Para corrigir:');
    console.log('   1. Certifique-se de ter executado as migrations:');
    console.log('      - 20251012231000_gamification_quiz_school.sql');
    console.log('      - 20251012232000_seed_gamification_catalogs.sql');
    console.log('   2. Execute via Supabase Dashboard > SQL Editor');
    console.log('   3. Execute este script novamente para verificar\n');
  }
  
  process.exit(allOK ? 0 : 1);
}

main().catch(error => {
  console.error('\n❌ Erro fatal:', error.message);
  console.error(error);
  process.exit(1);
});
