// src/pages/api/dashboard/stats.js
import { supabase } from '@/lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Get user classes
    const { data: classes, error: classesError } = await supabase
      .from('classes')
      .select(`
        id,
        name,
        subject,
        created_by,
        is_active,
        created_at,
        class_members (
          id,
          user_id,
          role
        )
      `)
      .eq('created_by', userId)
      .eq('is_active', true);

    if (classesError) throw classesError;

    // Get activities for these classes
    const classIds = classes?.map(c => c.id) || [];
    const { data: classActivities, error: activitiesError } = classIds.length > 0
      ? await supabase
          .from('activity_class_assignments')
          .select(`
            activity_id,
            class_id,
            activities (
              id,
              title,
              activity_type,
              status,
              created_at
            )
          `)
          .in('class_id', classIds)
      : { data: [], error: null };

    if (activitiesError) throw activitiesError;

    // Calculate stats
    const totalStudents = classes.reduce((sum, cls) =>
      sum + cls.class_members.filter(cm => cm.role === 'student').length, 0
    );

    const totalClasses = classes.length;

    const totalActivities = classActivities?.filter(ca => 
      ca.activities?.status === 'published' || ca.activities?.status === 'active'
    ).length || 0;

    const avgCompletion = totalActivities > 0 ? Math.round((totalActivities / (totalClasses * 10)) * 100) : 0;

    // Get recent activities (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentActivitiesData, error: recentActivitiesError } = await supabase
      .from('activities')
      .select(`
        id,
        title,
        activity_type,
        created_at,
        created_by,
        activity_class_assignments!inner(
          class_id,
          classes!inner(
            id,
            name,
            subject
          )
        )
      `)
      .eq('created_by', userId)
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    if (recentActivitiesError) throw recentActivitiesError;

    // Get upcoming deadlines (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const { data: upcomingDeadlinesData, error: deadlinesError } = await supabase
      .from('activities')
      .select(`
        id,
        title,
        due_date,
        activity_class_assignments!inner(
          class_id,
          classes!inner(
            id,
            name
          )
        )
      `)
      .eq('created_by', userId)
      .not('due_date', 'is', null)
      .gte('due_date', new Date().toISOString())
      .lte('due_date', thirtyDaysFromNow.toISOString())
      .order('due_date', { ascending: true })
      .limit(5);

    if (deadlinesError) throw deadlinesError;

    // Format recent activities
    const recentActivities = recentActivitiesData?.map(activity => ({
      type: activity.activity_type || 'activity',
      title: 'Nova atividade criada',
      description: `${activity.title} - ${activity.activity_class_assignments[0]?.classes?.name || 'Turma'}`,
      time: getTimeAgo(activity.created_at),
      icon: 'FileText',
      color: 'blue'
    })) || [];

    // Format upcoming deadlines
    const upcomingDeadlines = upcomingDeadlinesData?.map(deadline => ({
      title: deadline.title,
      class: deadline.activity_class_assignments[0]?.classes?.name || 'Turma',
      date: deadline.due_date,
      daysLeft: Math.ceil((new Date(deadline.due_date) - new Date()) / (1000 * 60 * 60 * 24))
    })) || [];

    const stats = [
      {
        icon: 'Users',
        label: 'Total de Alunos',
        value: totalStudents.toString(),
        change: '+12%',
        changeType: 'positive',
        gradient: 'from-blue-500 to-cyan-500'
      },
      {
        icon: 'GraduationCap',
        label: 'Turmas Ativas',
        value: totalClasses.toString(),
        change: '+2',
        changeType: 'positive',
        gradient: 'from-green-500 to-emerald-500'
      },
      {
        icon: 'FileText',
        label: 'Atividades',
        value: totalActivities.toString(),
        change: '+5',
        changeType: 'positive',
        gradient: 'from-purple-500 to-pink-500'
      },
      {
        icon: 'TrendingUp',
        label: 'Taxa de Conclusão',
        value: `${avgCompletion}%`,
        change: '+3%',
        changeType: 'positive',
        gradient: 'from-orange-500 to-red-500'
      },
    ];

    res.status(200).json({
      stats,
      recentActivities,
      upcomingDeadlines,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

function getTimeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

  if (diffInHours < 1) return 'Agora mesmo';
  if (diffInHours < 24) return `${diffInHours} horas atrás`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} dias atrás`;

  return date.toLocaleDateString('pt-BR');
}
