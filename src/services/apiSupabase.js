// Import the singleton Supabase client
import { supabase } from '@/lib/supabaseClient';

// This file should only use the singleton Supabase client from @/lib/supabaseClient
// and should not create any new instances of the Supabase client.

// ============================================
// SECURITY & VALIDATION HELPERS
// ============================================

/**
 * Validate user access to a resource based on ownership or permissions
 */
const validateResourceAccess = async (resourceType, resourceId, userId, requiredPermission = 'read') => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      throw new Error('Usuário não autenticado');
    }

    switch (resourceType) {
      case 'class':
        // Verificar se usuário é professor da turma ou aluno inscrito
        const { data: classAccess, error: classError } = await supabase
          .from('classes')
          .select('teacher_id, id')
          .eq('id', resourceId)
          .single();

        if (classError) throw classError;

        if (requiredPermission === 'write') {
          // Apenas professor pode modificar
          if (classAccess.teacher_id !== userId) {
            throw new Error('Apenas o professor pode modificar esta turma');
          }
        } else {
          // Verificar se é professor ou aluno da turma
          if (classAccess.teacher_id === userId) return true;

          // Verificar se é aluno da turma
          const { data: studentAccess } = await supabase
            .from('class_members')
            .select('id')
            .eq('class_id', resourceId)
            .eq('user_id', userId)
            .eq('role', 'student')
            .single();

          if (!studentAccess) {
            throw new Error('Você não tem acesso a esta turma');
          }
        }
        break;

      case 'activity':
        // Verificar se atividade pertence a turma do usuário
        const { data: activityAccess, error: activityError } = await supabase
          .from('class_activities')
          .select(`
            id,
            class_id,
            class:classes(teacher_id)
          `)
          .eq('id', resourceId)
          .single();

        if (activityError) throw activityError;

        // Verificar se usuário é professor da turma ou aluno inscrito
        if (activityAccess.class?.teacher_id === userId) return true;

        const { data: studentAccess } = await supabase
          .from('class_members')
          .select('id')
          .eq('class_id', activityAccess.class_id)
          .eq('user_id', userId)
          .eq('role', 'student')
          .single();

        if (!studentAccess) {
          throw new Error('Você não tem acesso a esta atividade');
        }
        break;

      case 'submission':
        // Verificar se submissão pertence ao usuário
        const { data: submissionAccess, error: submissionError } = await supabase
          .from('activity_submissions')
          .select('student_id')
          .eq('id', resourceId)
          .single();

        if (submissionError) throw submissionError;

        if (submissionAccess.student_id !== userId) {
          throw new Error('Você só pode acessar suas próprias submissões');
        }
        break;

      default:
        throw new Error(`Tipo de recurso não suportado: ${resourceType}`);
    }

    return true;
  } catch (error) {
    console.error('Erro na validação de acesso:', error);
    throw error;
  }
};

/**
 * Validate that user owns or has permission to access the class
 */
const validateClassAccess = async (classId, userId, permission = 'read') => {
  return validateResourceAccess('class', classId, userId, permission);
};

/**
 * Validate that user owns or has permission to access the activity
 */
const validateActivityAccess = async (activityId, userId, permission = 'read') => {
  return validateResourceAccess('activity', activityId, userId, permission);
};

// ============================================
// CONSTANTS & CONFIGURATION
// ============================================

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Simple in-memory cache for frequently accessed data
const cache = new Map();

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Sleep utility for retry delays
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retry wrapper for Supabase operations
 */
const withRetry = async (operation, retries = MAX_RETRIES) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === retries - 1) throw error;

      // Check if error is retryable
      const isRetryable = error.message?.includes('network') ||
                         error.message?.includes('timeout') ||
                         error.message?.includes('temporarily');

      if (!isRetryable) throw error;

      await sleep(RETRY_DELAY * (i + 1));
    }
  }
};

/**
 * Simple caching utility
 */
const getCached = (key) => {
  const item = cache.get(key);
  if (item && Date.now() - item.timestamp < CACHE_DURATION) {
    return item.data;
  }
  cache.delete(key);
  return null;
};

const setCached = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

// ============================================
// AUTHENTICATION & USER HELPERS
// ============================================

/**
 * Get the current authenticated user with improved error handling
 */
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.warn('Error getting current user:', error.message);
      return null;
    }

    if (!user) {
      // Fallback: try getting from session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.warn('Error getting session:', sessionError.message);
        return null;
      }

      return session?.user || null;
    }

    return user;
  } catch (error) {
    console.error('Unexpected error in getCurrentUser:', error);
    return null;
  }
};

/**
 * Get user profile with security validation
 */
export const getUserProfile = async (userId = null) => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error('Usuário não autenticado');

    const targetUserId = userId || currentUser.id;

    // Security: Users can only access their own profile or admins can access any
    if (targetUserId !== currentUser.id) {
      // Check if current user is admin
      const { data: permissions } = await supabase
        .from('user_permissions')
        .select('permission')
        .eq('user_id', currentUser.id)
        .eq('permission', 'admin')
        .single();

      if (!permissions) {
        throw new Error('Acesso negado: você só pode acessar seu próprio perfil');
      }
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, avatar_url, role, created_at, updated_at')
      .eq('id', targetUserId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

/**
 * Sign out user with cleanup
 */
export const signOut = async () => {
  try {
    // Clear cache on sign out
    cache.clear();

    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.warn('Error checking authentication:', error.message);
      return false;
    }

    return !!session?.user;
  } catch (error) {
    console.error('Unexpected error in isAuthenticated:', error);
    return false;
  }
};

/**
 * Get the user's access token
 */
export const getToken = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.warn('Error getting token:', error.message);
      return null;
    }

    return session?.access_token || null;
  } catch (error) {
    console.error('Unexpected error in getToken:', error);
    return null;
  }
};

// ============================================
// DATA OPERATIONS WITH SECURITY
// ============================================

/**
 * Export class data with retry logic and caching (SECURE VERSION)
 */
export const exportClassData = async (classId) => {
  if (!classId) {
    throw new Error('Class ID is required');
  }

  const user = await getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');

  // Security: Validate access to class
  await validateClassAccess(classId, user.id, 'read');

  const cacheKey = `class_export_${classId}_${user.id}`;

  // Check cache first
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    return await withRetry(async () => {
      // Get class details (filtered by ownership)
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('id, name, subject, teacher_id, created_at')
        .eq('id', classId)
        .single();

      if (classError) throw classError;
      if (!classData) throw new Error('Turma não encontrada');

      // Get students (only if user is teacher or enrolled student)
      const { data: students, error: studentsError } = await supabase
        .from('class_members')
        .select(`
          student:profiles (
            id,
            full_name,
            avatar_url,
            created_at
          )
        `)
        .eq('class_id', classId)
        .eq('role', 'student');

      if (studentsError) throw studentsError;

      // Get activities (filtered by class access)
      const { data: activities, error: activitiesError } = await supabase
        .from('class_activities')
        .select('id, title, description, status, created_at')
        .eq('class_id', classId);

      if (activitiesError) throw activitiesError;

      // Combine all data (sanitized)
      const exportData = {
        class: {
          id: classData.id,
          name: classData.name,
          subject: classData.subject,
          created_at: classData.created_at
        },
        students: students?.map(s => s.student).filter(Boolean) || [],
        activities: activities || [],
        exported_at: new Date().toISOString(),
        exported_by: user.id
      };

      // Cache the result
      setCached(cacheKey, exportData);

      return exportData;
    });
  } catch (error) {
    console.error('Error exporting class data:', error);
    throw new Error('Falha ao exportar dados da turma: ' + error.message);
  }
};

// Helper function to handle file uploads
export const uploadFile = async (bucket, path, file) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file);

  if (error) throw error;
  return data;
};

// Helper function to get a public URL for a file
export const getPublicUrl = (bucket, path) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  return data.publicUrl;
};

// ============================================
// CLASS & STUDENT HELPERS (SECURE)
// ============================================

/**
 * Buscar detalhes de uma turma específica (com validação de acesso)
 */
export const getClassDetails = async (classId) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');

  // Security: Validate access to class
  await validateClassAccess(classId, user.id, 'read');

  const { data, error } = await supabase
    .from('classes')
    .select('id, name, subject, teacher_id, created_at, updated_at')
    .eq('id', classId)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Buscar turmas de um usuário (professor ou aluno) - SEGURA
 */
export const getUserClasses = async (userId, role = 'student') => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error('Usuário não autenticado');

    // Security: Users can only access their own data
    if (userId !== currentUser.id) {
      throw new Error('Acesso negado: você só pode acessar suas próprias turmas');
    }

    if (role === 'teacher') {
      // Professor: turmas em que ele é teacher_id
      const { data, error } = await supabase
        .from('classes')
        .select('id, name, subject, teacher_id, created_at, students_count, activities_count')
        .eq('teacher_id', userId)
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) {
        console.error('Error fetching teacher classes:', error.message);
        throw new Error(`Erro ao buscar turmas: ${error.message}`);
      }
      return data || [];
    } else {
      // Aluno: turmas via class_members
      const { data, error } = await supabase
        .from('class_members')
        .select(`
          class:classes(
            id,
            name,
            subject,
            teacher_id,
            created_at,
            students_count,
            activities_count
          )
        `)
        .eq('user_id', userId)
        .eq('role', 'student');

      if (error) {
        console.error('Error fetching student classes:', error.message);
        throw new Error(`Erro ao buscar turmas: ${error.message}`);
      }
      return data ? data.map(row => row.class).filter(Boolean) : [];
    }
  } catch (error) {
    console.error('Error in getUserClasses:', error);
    return [];
  }
};

/**
 * Buscar alunos de uma turma (com validação de acesso)
 */
export const getClassStudents = async (classId) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');

  // Security: Validate access to class
  await validateClassAccess(classId, user.id, 'read');

  const { data, error } = await supabase
    .from('class_members')
    .select(`
      user:profiles(
        id,
        full_name,
        avatar_url,
        created_at
      )
    `)
    .eq('class_id', classId)
    .eq('role', 'student');

  if (error) throw error;
  return (data || []).map(row => row.user).filter(Boolean);
};

/**
 * Buscar reuniões do usuário (com validação de acesso)
 */
export const getUserMeetings = async (userId) => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error('Usuário não autenticado');

  // Security: Users can only access their own meetings
  if (userId !== currentUser.id) {
    throw new Error('Acesso negado: você só pode acessar suas próprias reuniões');
  }

  const { data, error } = await supabase
    .from('meetings')
    .select(`
      id,
      title,
      description,
      start_time,
      end_time,
      status,
      created_at
    `)
    .or(`created_by.eq.${userId},and(class_id.in.(select class_id from class_members where user_id.eq.${userId}))`)
    .order('start_time', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data || [];
};

/**
 * Buscar atividades publicadas de uma turma (com validação de acesso)
 */
export const getClassActivities = async (classId) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');

  if (classId) {
    // Security: Validate access to class
    await validateClassAccess(classId, user.id, 'read');
  }

  if (!classId) {
    // Busca todos os templates do usuário (professor)
    const { data, error } = await supabase
      .from('activity_templates')
      .select('id, title, description, subject, created_at, updated_at')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Busca atividades publicadas na turma
  const { data, error } = await supabase
    .from('class_activities')
    .select(`
      id,
      title,
      description,
      instructions,
      due_date,
      max_points,
      status,
      published_at,
      created_at,
      template:activity_templates(
        id,
        title,
        subject
      )
    `)
    .eq('class_id', classId)
    .order('published_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

// ============================================
// ACTIVITY TEMPLATE MANAGEMENT (SECURE)
// ============================================

/**
 * Cria um novo template de atividade (com validação de ownership)
 */
export const createActivityTemplate = async (templateData) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');

  try {
    const { data, error } = await supabase
      .from('activity_templates')
      .insert([{
        ...templateData,
        created_by: user.id,
        is_public: templateData.is_public || false,
        tags: templateData.tags || []
      }])
      .select('id, title, description, subject, created_by, created_at')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating activity template:', error);
    throw error;
  }
};

/**
 * Busca um template de atividade pelo ID (com validação de acesso)
 */
export const getActivityTemplate = async (templateId) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('activity_templates')
    .select('id, title, description, instructions, subject, schema, created_by, created_at, updated_at')
    .eq('id', templateId)
    .or(`created_by.eq.${user.id},is_public.eq.true`)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Atualiza um template de atividade existente (com validação de ownership)
 */
export const updateActivityTemplate = async (templateId, updates) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('activity_templates')
    .update(updates)
    .eq('id', templateId)
    .eq('created_by', user.id)
    .select('id, title, description, subject, created_by, updated_at')
    .single();

  if (error) throw error;
  return data;
};

/**
 * Remove um template de atividade (com validação de ownership)
 */
export const deleteActivityTemplate = async (templateId) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { error } = await supabase
    .from('activity_templates')
    .delete()
    .eq('id', templateId)
    .eq('created_by', user.id);

  if (error) throw error;
};

/**
 * Lista os templates de atividade disponíveis (com validação de acesso)
 */
export const listActivityTemplates = async ({ userId, publicOnly = false } = {}) => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error('Usuário não autenticado');

  let query = supabase.from('activity_templates').select('id, title, description, subject, created_by, created_at, is_public');

  if (publicOnly) {
    query = query.eq('is_public', true);
  } else if (userId) {
    // Security: Users can only see their own templates or public ones
    if (userId !== currentUser.id) {
      query = query.eq('is_public', true);
    } else {
      query = query.or(`created_by.eq.${userId},is_public.eq.true`);
    }
  } else {
    // Default: only public templates for non-authenticated context
    query = query.eq('is_public', true);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

// ============================================
// CLASS ACTIVITY MANAGEMENT (SECURE)
// ============================================

/**
 * Publica um template de atividade em uma ou mais turmas (com validação de ownership e acesso)
 */
export const publishActivityTemplate = async (templateId, classIds, overrides = {}) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');

  try {
    // Security: Verifica se o template existe e o usuário tem permissão
    const { data: template, error: templateError } = await supabase
      .from('activity_templates')
      .select('id, title, description, instructions, created_by, is_public')
      .eq('id', templateId)
      .or(`created_by.eq.${user.id},is_public.eq.true`)
      .single();

    if (templateError) throw templateError;
    if (!template) throw new Error('Template não encontrado ou sem permissão');

    // Security: Verificar se usuário é professor de todas as turmas
    const { data: userClasses, error: classesError } = await supabase
      .from('classes')
      .select('id')
      .eq('teacher_id', user.id)
      .in('id', classIds);

    if (classesError) throw classesError;

    const accessibleClassIds = userClasses?.map(c => c.id) || [];
    const unauthorizedClasses = classIds.filter(id => !accessibleClassIds.includes(id));

    if (unauthorizedClasses.length > 0) {
      throw new Error(`Você não tem permissão para publicar em algumas turmas: ${unauthorizedClasses.join(', ')}`);
    }

    // Cria as atividades nas turmas
    const { data: activities, error: activitiesError } = await supabase
      .from('class_activities')
      .insert(
        classIds.map(classId => ({
          template_id: templateId,
          class_id: classId,
          title: overrides.title || template.title,
          description: overrides.description || template.description,
          instructions: overrides.instructions || template.instructions,
          due_date: overrides.due_date || null,
          max_points: overrides.max_points || 100,
          status: 'published',
          published_by: user.id,
          published_at: new Date().toISOString()
        })))
      .select('id, title, class_id, status, published_at');

    if (activitiesError) throw activitiesError;
    return activities || [];
  } catch (error) {
    console.error('Error publishing activity template:', error);
    throw error;
  }
};

/**
 * Atualiza uma atividade publicada (com validação de ownership)
 */
export const updateClassActivity = async (activityId, updates) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');

  // Security: Validate access to activity
  await validateActivityAccess(activityId, user.id, 'write');

  const { data, error } = await supabase
    .from('class_activities')
    .update(updates)
    .eq('id', activityId)
    .select('id, title, description, status, updated_at')
    .single();

  if (error) throw error;
  return data;
};

/**
 * Remove uma atividade publicada (com validação de ownership)
 */
export const deleteClassActivity = async (activityId) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');

  // Security: Validate access to activity
  await validateActivityAccess(activityId, user.id, 'write');

  const { error } = await supabase
    .from('class_activities')
    .delete()
    .eq('id', activityId);

  if (error) throw error;
};

// ============================================
// SECURE SUBMISSION HANDLING
// ============================================

/**
 * Submeter resposta de atividade (com validação de ownership)
 */
export const submitActivity = async ({ activity_id, answers, hcaptchaToken }) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');

  // Security: Validate access to activity
  await validateActivityAccess(activity_id, user.id, 'read');

  // Security: Validate hCaptcha token exists
  if (!hcaptchaToken) {
    throw new Error('Token de verificação hCaptcha é obrigatório');
  }

  try {
    const { data, error } = await supabase
      .from('activity_submissions')
      .insert({
        student_id: user.id,
        activity_id,
        answers,
        hcaptcha_token: hcaptchaToken,
        submitted_at: new Date().toISOString()
      })
      .select('id, student_id, activity_id, submitted_at, status')
      .single();

    if (error) {
      console.error('Error submitting activity:', error.message);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in submitActivity:', error);
    throw error;
  }
};

/**
 * Get submissions for an activity (teachers only, with access validation)
 */
export const getActivitySubmissions = async (activityId) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');

  // Security: Validate access to activity (teachers only)
  await validateActivityAccess(activityId, user.id, 'read');

  const { data, error } = await supabase
    .from('activity_submissions')
    .select(`
      id,
      student_id,
      answers,
      submitted_at,
      status,
      graded_at,
      points,
      feedback,
      student:profiles(
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('activity_id', activityId)
    .order('submitted_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * Grade a submission (teachers only, with access validation)
 */
export const gradeSubmission = async (submissionId, { points, feedback }) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Usuário não autenticado');

  // Security: Get submission and validate access to related activity
  const { data: submission, error: submissionError } = await supabase
    .from('activity_submissions')
    .select(`
      id,
      activity_id,
      student_id
    `)
    .eq('id', submissionId)
    .single();

  if (submissionError) throw submissionError;

  // Security: Validate access to activity
  await validateActivityAccess(submission.activity_id, user.id, 'write');

  const { data, error } = await supabase
    .from('activity_submissions')
    .update({
      points,
      feedback,
      graded_at: new Date().toISOString(),
      status: points !== null ? 'graded' : 'pending'
    })
    .eq('id', submissionId)
    .select('id, points, feedback, graded_at, status')
    .single();

  if (error) throw error;
  return data;
};

// ============================================
// DEPRECATED FUNCTIONS
// ============================================

/**
 * @deprecated Use getClassActivities instead
 */

/**
 * @deprecated Use createActivityTemplate instead
 */
export const createActivity = createActivityTemplate;

/**
 * @deprecated Use getActivityTemplate instead
 */
export const getActivity = getActivityTemplate;

/**
 * @deprecated Use updateActivityTemplate instead
 */
export const updateActivity = updateActivityTemplate;

/**
 * @deprecated Use deleteActivityTemplate instead
 */
export const deleteActivity = deleteActivityTemplate;
