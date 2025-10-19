import { supabase } from '@/lib/supabaseClient';

/**
 * Serviço de gerenciamento de assinaturas de professores
 */
export const teacherSubscriptionService = {
  /**
   * Busca assinatura ativa do professor
   */
  async getSubscription(teacherId) {
    try {
      const { data, error } = await supabase
        .from('teacher_subscriptions')
        .select('*')
        .eq('user_id', teacherId)
        .eq('status', 'active')
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      // Se não tem assinatura, retornar free por padrão
      if (!data) {
        return {
          user_id: teacherId,
          plan_type: 'free',
          status: 'active',
          max_classes: 1,
          max_students_per_class: 15,
          monthly_cost: 0
        };
      }
      
      return data;
    } catch (error) {
      console.error('Erro ao buscar assinatura:', error);
      throw error;
    }
  },

  /**
   * Cria ou atualiza assinatura
   */
  async createOrUpdateSubscription(teacherId, planType) {
    try {
      const plans = {
        free: { 
          max_classes: 1, 
          max_students: 15, 
          monthly_cost: 0 
        },
        basic: { 
          max_classes: 3, 
          max_students: 30, 
          monthly_cost: 19 
        },
        pro: { 
          max_classes: 10, 
          max_students: 50, 
          monthly_cost: 49 
        },
        enterprise: { 
          max_classes: 999, 
          max_students: 100, 
          monthly_cost: 99 
        }
      };
      
      const plan = plans[planType];
      
      if (!plan) {
        throw new Error('Plano inválido');
      }

      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);
      
      const { data, error } = await supabase
        .from('teacher_subscriptions')
        .upsert({
          user_id: teacherId,
          plan_type: planType,
          status: 'active',
          max_classes: plan.max_classes,
          max_students_per_class: plan.max_students,
          monthly_cost: plan.monthly_cost,
          started_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id',
          returning: 'representation'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar/atualizar assinatura:', error);
      throw error;
    }
  },

  /**
   * Verifica se professor pode criar turma
   */
  async checkCanCreateClass(teacherId) {
    try {
      // 1) Tenta via RPC (se existir e estiver configurada)
      const { data, error } = await supabase.rpc('can_teacher_create_class', { teacher_id: teacherId });

      if (error) {
        throw error;
      }

      // Se o RPC retornar explicitamente um booleano, respeita
      if (typeof data === 'boolean') {
        return data;
      }

      // 2) Fallback: calcular localmente com base no plano e na contagem de turmas
      const subscription = await this.getSubscription(teacherId);

      const { count: classCount } = await supabase
        .from('classes')
        .select('id', { count: 'exact', head: true })
        .eq('created_by', teacherId);

      const maxClasses = subscription?.max_classes ?? 1;
      return (classCount || 0) < maxClasses;
    } catch (error) {
      console.error('Erro ao verificar limite de turmas (RPC):', error);
      // 3) Último fallback: ainda assim tenta calcular localmente; se falhar, permite (fail-safe)
      try {
        const subscription = await this.getSubscription(teacherId);
        const { count: classCount } = await supabase
          .from('classes')
          .select('id', { count: 'exact', head: true })
          .eq('created_by', teacherId);
        const maxClasses = subscription?.max_classes ?? 1;
        return (classCount || 0) < maxClasses;
      } catch (e) {
        console.error('Erro no fallback local de verificação de limite:', e);
        // Em caso de falha geral, não bloquear a criação
        return true;
      }
    }
  },

  /**
   * Busca estatísticas de uso do professor
   */
  async getUsageStats(teacherId) {
    try {
      // Turmas criadas
      const { count: classCount } = await supabase
        .from('classes')
        .select('id', { count: 'exact', head: true })
        .eq('created_by', teacherId);
      
      // Escolas vinculadas
      const { count: schoolCount } = await supabase
        .from('school_teachers')
        .select('school_id', { count: 'exact', head: true })
        .eq('user_id', teacherId)
        .eq('status', 'active');
      
      // Total de alunos (contando membros únicos)
      // Primeiro buscar IDs das turmas
      const { data: teacherClasses } = await supabase
        .from('classes')
        .select('id')
        .eq('created_by', teacherId);
      
      const classIds = (teacherClasses || []).map(c => c.id);
      
      // Depois buscar membros únicos
      let studentCount = 0;
      if (classIds.length > 0) {
        const { data: members } = await supabase
          .from('class_members')
          .select('user_id')
          .eq('role', 'student')
          .in('class_id', classIds);
        
        // Contar usuários únicos
        const uniqueStudents = new Set((members || []).map(m => m.user_id));
        studentCount = uniqueStudents.size;
      }
      
      const subscription = await this.getSubscription(teacherId);
      
      return {
        currentClasses: classCount || 0,
        maxClasses: subscription.max_classes || 1,
        linkedSchools: schoolCount || 0,
        totalStudents: studentCount || 0,
        plan: subscription.plan_type || 'free',
        canCreateMore: (classCount || 0) < (subscription.max_classes || 1),
        isSchoolLinked: (schoolCount || 0) > 0
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  },

  /**
   * Cancela assinatura
   */
  async cancelSubscription(teacherId) {
    try {
      const { data, error } = await supabase
        .from('teacher_subscriptions')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', teacherId)
        .eq('status', 'active')
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error);
      throw error;
    }
  },

  /**
   * Lista de planos disponíveis
   */
  getAvailablePlans() {
    return [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        maxClasses: 1,
        maxStudents: 15,
        features: [
          'Até 1 turma',
          'Até 15 alunos por turma',
          'Correção manual',
          'Analytics básico',
          'Suporte por email'
        ]
      },
      {
        id: 'basic',
        name: 'Basic',
        price: 19,
        maxClasses: 3,
        maxStudents: 30,
        features: [
          'Até 3 turmas',
          'Até 30 alunos por turma',
          'Correção manual e automática',
          'Analytics completo',
          'Exportação de relatórios',
          'Suporte prioritário'
        ],
        recommended: false
      },
      {
        id: 'pro',
        name: 'Pro',
        price: 49,
        maxClasses: 10,
        maxStudents: 50,
        features: [
          'Até 10 turmas',
          'Até 50 alunos por turma',
          'Correção automática com IA',
          'Detecção de plágio (Winston AI)',
          'Chatbot IA com RAG',
          'Analytics avançado com ML',
          'API de integração',
          'Suporte prioritário'
        ],
        recommended: true
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 99,
        maxClasses: 999,
        maxStudents: 100,
        features: [
          'Turmas ilimitadas',
          'Até 100 alunos por turma',
          'Todos os recursos do Pro',
          'White-label (em breve)',
          'SSO (Single Sign-On)',
          'Suporte dedicado 24/7',
          'SLA garantido',
          'Treinamento personalizado'
        ],
        recommended: false
      }
    ];
  }
};

export default teacherSubscriptionService;
