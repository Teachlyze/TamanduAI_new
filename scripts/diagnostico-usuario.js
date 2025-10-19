// Script de Diagnóstico - Executar no Console do Navegador (F12)
// Copie e cole este código no console quando estiver logado

console.log('🔍 INICIANDO DIAGNÓSTICO...\n');

// 1. Verificar Supabase Client
console.log('1️⃣ VERIFICANDO SUPABASE CLIENT:');
if (typeof supabase === 'undefined') {
  console.error('❌ Supabase client não encontrado!');
  console.log('📝 Solução: Recarregue a página');
} else {
  console.log('✅ Supabase client disponível');
}

// 2. Verificar sessão atual
console.log('\n2️⃣ VERIFICANDO SESSÃO:');
const checkSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Erro ao obter sessão:', error);
      return;
    }
    
    if (!session) {
      console.warn('⚠️ Nenhuma sessão ativa - Usuário não está logado');
      return;
    }
    
    console.log('✅ Sessão ativa encontrada');
    console.log('📧 Email:', session.user.email);
    console.log('🆔 ID:', session.user.id);
    
    // 3. Verificar role
    console.log('\n3️⃣ VERIFICANDO ROLE:');
    const role = session.user.user_metadata?.role;
    const roleFromAppData = session.user.app_metadata?.role;
    
    if (!role && !roleFromAppData) {
      console.error('❌ ROLE NÃO DEFINIDO!');
      console.log('📝 Solução: Executar SQL abaixo no Supabase Dashboard:\n');
      console.log(`UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"student"'
)
WHERE id = '${session.user.id}';`);
    } else {
      console.log('✅ Role definido:', role || roleFromAppData);
      
      // 4. Verificar rota esperada
      console.log('\n4️⃣ VERIFICANDO ROTA:');
      const currentPath = window.location.pathname;
      const expectedPaths = {
        student: ['/students', '/students/activities', '/students/gamification', '/students/performance'],
        teacher: ['/dashboard', '/dashboard/classes', '/dashboard/activities'],
        school: ['/school', '/school/teachers', '/school/classes']
      };
      
      const userRole = role || roleFromAppData;
      const isCorrectPath = expectedPaths[userRole]?.some(path => currentPath.startsWith(path));
      
      console.log('📍 Rota atual:', currentPath);
      console.log('📍 Role do usuário:', userRole);
      console.log('📍 Rotas esperadas:', expectedPaths[userRole]);
      
      if (isCorrectPath) {
        console.log('✅ Rota CORRETA para o role');
      } else {
        console.error('❌ ROTA INCORRETA!');
        console.log('📝 Deveria estar em:', expectedPaths[userRole][0]);
        console.log('📝 Solução: Redirecionar manualmente:');
        console.log(`   window.location.href = '${expectedPaths[userRole][0]}';`);
      }
    }
    
    // 5. Verificar localStorage
    console.log('\n5️⃣ VERIFICANDO LOCALSTORAGE:');
    const keys = Object.keys(localStorage);
    console.log('📦 Chaves no localStorage:', keys.length);
    
    const supabaseKeys = keys.filter(k => k.includes('supabase'));
    if (supabaseKeys.length > 0) {
      console.log('✅ Dados do Supabase encontrados:', supabaseKeys.length, 'chaves');
    }
    
    // 6. Testar queries básicas
    console.log('\n6️⃣ TESTANDO QUERIES BÁSICAS:');
    
    // Teste 1: Classes
    console.log('\n   📚 Testando query de classes...');
    const { data: classes, error: classesError } = await supabase
      .from('classes')
      .select('id, name')
      .limit(1);
    
    if (classesError) {
      console.error('   ❌ Erro ao buscar classes:', classesError.message);
      if (classesError.code === '42P01') {
        console.log('   📝 Tabela "classes" não existe! Execute a migração SQL.');
      } else if (classesError.code === 'PGRST301') {
        console.log('   📝 RLS bloqueou a query. Verifique políticas de segurança.');
      }
    } else {
      console.log('   ✅ Query de classes OK:', classes?.length || 0, 'resultados');
    }
    
    // Teste 2: Activities
    console.log('\n   📝 Testando query de activities...');
    const { data: activities, error: activitiesError } = await supabase
      .from('activities')
      .select('id, title')
      .limit(1);
    
    if (activitiesError) {
      console.error('   ❌ Erro ao buscar activities:', activitiesError.message);
      if (activitiesError.code === '42P01') {
        console.log('   📝 Tabela "activities" não existe! Execute a migração SQL.');
      }
    } else {
      console.log('   ✅ Query de activities OK:', activities?.length || 0, 'resultados');
    }
    
    // Teste 3: Class Members
    console.log('\n   👥 Testando query de class_members...');
    const { data: members, error: membersError } = await supabase
      .from('class_members')
      .select('id')
      .limit(1);
    
    if (membersError) {
      console.error('   ❌ Erro ao buscar class_members:', membersError.message);
      if (membersError.code === '42P01') {
        console.log('   📝 Tabela "class_members" não existe! Execute a migração SQL.');
      }
    } else {
      console.log('   ✅ Query de class_members OK:', members?.length || 0, 'resultados');
    }
    
    // Teste 4: Submissions
    console.log('\n   📊 Testando query de submissions...');
    const { data: submissions, error: submissionsError } = await supabase
      .from('submissions')
      .select('id')
      .limit(1);
    
    if (submissionsError) {
      console.error('   ❌ Erro ao buscar submissions:', submissionsError.message);
      if (submissionsError.code === '42P01') {
        console.log('   📝 Tabela "submissions" não existe! Execute a migração SQL.');
      }
    } else {
      console.log('   ✅ Query de submissions OK:', submissions?.length || 0, 'resultados');
    }
    
    // RESULTADO FINAL
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESULTADO DO DIAGNÓSTICO:');
    console.log('='.repeat(60));
    
    const hasSession = !!session;
    const hasRole = !!(role || roleFromAppData);
    const hasCorrectPath = isCorrectPath;
    const tablesOk = !classesError && !activitiesError && !membersError && !submissionsError;
    
    console.log('✅ Sessão ativa:', hasSession ? 'SIM' : 'NÃO');
    console.log('✅ Role definido:', hasRole ? 'SIM' : 'NÃO');
    console.log('✅ Rota correta:', hasCorrectPath ? 'SIM' : 'NÃO');
    console.log('✅ Tabelas OK:', tablesOk ? 'SIM' : 'NÃO');
    
    if (hasSession && hasRole && hasCorrectPath && tablesOk) {
      console.log('\n🎉 TUDO OK! Sistema funcionando corretamente.');
    } else {
      console.log('\n⚠️ PROBLEMAS ENCONTRADOS - Veja as soluções acima.');
      
      if (!hasSession) {
        console.log('\n🔧 PRÓXIMO PASSO: Fazer login novamente');
      } else if (!hasRole) {
        console.log('\n🔧 PRÓXIMO PASSO: Definir role no Supabase (ver SQL acima)');
      } else if (!hasCorrectPath) {
        console.log('\n🔧 PRÓXIMO PASSO: Redirecionar para rota correta (ver comando acima)');
      } else if (!tablesOk) {
        console.log('\n🔧 PRÓXIMO PASSO: Executar migração SQL (supabase/migrations/fix_all_tables.sql)');
      }
    }
    
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Erro durante diagnóstico:', error);
  }
};

// Executar diagnóstico
checkSession();

// Fornecer função de atalho para redirecionamento rápido
window.redirectToCorrectPath = function() {
  const role = localStorage.getItem('userRole'); // ou buscar do user
  const paths = {
    student: '/students',
    teacher: '/dashboard',
    school: '/school'
  };
  
  const targetPath = paths[role] || paths.student;
  console.log('🔄 Redirecionando para:', targetPath);
  window.location.href = targetPath;
};

console.log('\n💡 DICA: Se precisar redirecionar manualmente, execute:');
console.log('   redirectToCorrectPath()');
