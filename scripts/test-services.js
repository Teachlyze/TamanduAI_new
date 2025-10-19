#!/usr/bin/env node

/**
 * Script de Teste dos Serviços TamanduAI
 * Testa: Redis, Email, Notificações, Prometheus
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🧪 Testando Serviços TamanduAI...\n');

// ===== TESTE 1: Upstash Redis via REST =====
async function testRedis() {
  console.log('📊 [1/4] Testando Upstash Redis...');
  
  try {
    const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
    const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
    
    if (!UPSTASH_URL || !UPSTASH_TOKEN) {
      console.log('⚠️  Redis: Credenciais não configuradas');
      return false;
    }
    
    // Test PING
    const pingResponse = await fetch(UPSTASH_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${UPSTASH_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(['PING'])
    });
    
    const pingData = await pingResponse.json();
    
    if (pingData.result === 'PONG') {
      console.log('✅ Redis: Conectado com sucesso!');
      
      // Test SET/GET
      const testKey = 'test_' + Date.now();
      const testValue = 'TamanduAI_Test';
      
      await fetch(UPSTASH_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${UPSTASH_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(['SET', testKey, testValue, 'EX', '10'])
      });
      
      const getResponse = await fetch(UPSTASH_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${UPSTASH_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(['GET', testKey])
      });
      
      const getData = await getResponse.json();
      
      if (getData.result === testValue) {
        console.log('✅ Redis: SET/GET funcionando corretamente!');
        return true;
      }
    }
    
    console.log('❌ Redis: Falha no teste');
    return false;
  } catch (error) {
    console.log('❌ Redis: Erro -', error.message);
    return false;
  }
}

// ===== TESTE 2: Email Service =====
async function testEmail() {
  console.log('\n📧 [2/4] Testando Serviço de Email...');
  
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: 'test@tamanduai.com',
        subject: 'Teste TamanduAI - Verificação de Serviço',
        html: '<h1>Teste</h1><p>Este é um email de teste do sistema TamanduAI.</p>',
      }
    });
    
    if (error) {
      console.log('❌ Email: Erro -', error.message);
      return false;
    }
    
    if (data && data.success) {
      console.log('✅ Email: Edge Function funcionando!');
      console.log('   Email ID:', data.emailId);
      return true;
    }
    
    console.log('⚠️  Email: Resposta inesperada');
    return false;
  } catch (error) {
    console.log('❌ Email: Erro -', error.message);
    return false;
  }
}

// ===== TESTE 3: Prometheus =====
async function testPrometheus() {
  console.log('\n📊 [3/4] Testando Prometheus...');
  
  try {
    // Test Prometheus endpoint
    const promResponse = await fetch('http://localhost:9090/api/v1/targets');
    
    if (promResponse.ok) {
      const promData = await promResponse.json();
      console.log('✅ Prometheus: Servidor online!');
      console.log('   Targets ativos:', promData.data?.activeTargets?.length || 0);
      
      // Test Upstash Exporter
      const exporterResponse = await fetch('http://localhost:9101/metrics');
      
      if (exporterResponse.ok) {
        const metrics = await exporterResponse.text();
        const hasMetrics = metrics.includes('upstash_ping_latency_ms');
        
        if (hasMetrics) {
          console.log('✅ Upstash Exporter: Métricas disponíveis!');
          return true;
        }
      }
      
      console.log('⚠️  Upstash Exporter: Não encontrado (porta 9101)');
      return true; // Prometheus OK, mas exporter não
    }
    
    console.log('❌ Prometheus: Não acessível (porta 9090)');
    return false;
  } catch (error) {
    console.log('⚠️  Prometheus: Não está rodando (use docker-compose up -d)');
    return false;
  }
}

// ===== TESTE 4: Notificações =====
async function testNotifications() {
  console.log('\n🔔 [4/4] Testando Sistema de Notificações...');
  
  try {
    // Verificar se tabela de notificações existe
    const { data, error } = await supabase
      .from('notifications')
      .select('id')
      .limit(1);
    
    if (error) {
      if (error.code === '42P01') {
        console.log('⚠️  Notificações: Tabela não existe no banco');
        console.log('   Execute: supabase db push');
        return false;
      }
      console.log('❌ Notificações: Erro -', error.message);
      return false;
    }
    
    console.log('✅ Notificações: Tabela configurada!');
    console.log('   Sistema de notificações in-app pronto');
    return true;
  } catch (error) {
    console.log('❌ Notificações: Erro -', error.message);
    return false;
  }
}

// ===== EXECUTAR TODOS OS TESTES =====
async function runAllTests() {
  const results = {
    redis: await testRedis(),
    email: await testEmail(),
    prometheus: await testPrometheus(),
    notifications: await testNotifications(),
  };
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMO DOS TESTES');
  console.log('='.repeat(50));
  console.log(`Redis:         ${results.redis ? '✅ OK' : '❌ FALHOU'}`);
  console.log(`Email:         ${results.email ? '✅ OK' : '❌ FALHOU'}`);
  console.log(`Prometheus:    ${results.prometheus ? '✅ OK' : '❌ FALHOU'}`);
  console.log(`Notificações:  ${results.notifications ? '✅ OK' : '❌ FALHOU'}`);
  console.log('='.repeat(50));
  
  const allPassed = Object.values(results).every(r => r);
  
  if (allPassed) {
    console.log('\n🎉 Todos os serviços estão funcionando!\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  Alguns serviços precisam de atenção.\n');
    console.log('📖 Consulte SERVICES_STATUS.md para mais detalhes.\n');
    process.exit(1);
  }
}

runAllTests().catch(error => {
  console.error('\n❌ Erro fatal:', error);
  process.exit(1);
});
