// src/pages/api/students/[studentId]/performance.js
import { supabase } from '@/lib/supabaseClient';
import { redisCache } from '@/services/redisService';

export default async function handler(req, res) {
  const { studentId } = req.query;

  if (!studentId) {
    return res.status(400).json({ message: 'Student ID is required' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Try cache first
    const cacheKey = `student:performance:${studentId}`;
    const cachedPerformance = await redisCache.get(cacheKey);

    if (cachedPerformance) {
      return res.status(200).json(cachedPerformance);
    }

    // Get performance data using RPC function
    const { data: performanceData, error: performanceError } = await supabase
      .rpc('get_student_performance_summary', { student_id: studentId });

    if (performanceError) {
      // Fallback to manual calculation if RPC doesn't exist
      return await getPerformanceFallback(studentId, res);
    }

    // Process performance data
    const performance = {
      overall: {
        averageGrade: performanceData?.overall_average || 0,
        totalActivities: performanceData?.total_activities || 0,
        completedActivities: performanceData?.completed_activities || 0,
        completionRate: performanceData?.completion_rate || 0,
        totalClasses: performanceData?.total_classes || 0
      },
      bySubject: performanceData?.by_subject || [],
      recentGrades: performanceData?.recent_grades || [],
      trends: {
        last30Days: performanceData?.trends_30d || 0,
        last7Days: performanceData?.trends_7d || 0,
        improvement: performanceData?.improvement_rate || 0
      },
      stats: {
        bestSubject: performanceData?.best_subject || 'N/A',
        needsAttention: performanceData?.needs_attention || [],
        totalSubmissions: performanceData?.total_submissions || 0,
        averageTime: performanceData?.average_completion_time || 0
      }
    };

    // Cache for 1 hour
    await redisCache.set(cacheKey, performance, 60 * 60);

    res.status(200).json(performance);

  } catch (error) {
    console.error('Student performance error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

// Fallback function if RPC doesn't exist
async function getPerformanceFallback(studentId, res) {
  try {
    // Get student's classes
    const { data: classes, error: classesError } = await supabase
      .from('class_members')
      .select(`
        classes (
          id,
          name,
          subject
        )
      `)
      .eq('user_id', studentId)
      .eq('role', 'student');

    if (classesError) throw classesError;

    // Get activities for enrolled classes
    const classIds = classes?.map(c => c.classes?.id).filter(Boolean) || [];
    
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
              created_at,
              due_date
            )
          `)
          .in('class_id', classIds)
      : { data: [], error: null };
    
    if (activitiesError) throw activitiesError;

    // Get student's submissions
    const { data: submissions, error: submissionsError } = await supabase
      .from('submissions')
      .select(`
        id,
        activity_id,
        grade,
        submitted_at,
        status,
        activities (
          id,
          title,
          activity_type
        )
      `)
      .eq('student_id', studentId)
      .not('grade', 'is', null)
      .order('submitted_at', { ascending: false });

    if (submissionsError) throw submissionsError;

    // Calculate performance metrics
    const totalActivities = classActivities?.filter(ca => 
      ca.activities?.status === 'published' || ca.activities?.status === 'active'
    ).length || 0;

    const completedActivities = submissions?.length || 0;

    const averageGrade = submissions?.length > 0
      ? submissions.reduce((sum, sub) => sum + (sub.grade || 0), 0) / submissions.length
      : 0;

    const completionRate = totalActivities > 0 ? (completedActivities / totalActivities) * 100 : 0;

    // Group by subject
    const bySubject = {};
    submissions?.forEach(sub => {
      // Find which class this activity belongs to
      const activityAssignment = classActivities?.find(ca => ca.activity_id === sub.activity_id);
      const classData = activityAssignment ? classes?.find(c => c.classes?.id === activityAssignment.class_id)?.classes : null;
      const subject = classData?.subject || 'Outros';
      if (!bySubject[subject]) {
        bySubject[subject] = { total: 0, completed: 0, average: 0, grades: [] };
      }
      bySubject[subject].total++;
      bySubject[subject].completed++;
      bySubject[subject].grades.push(sub.grade || 0);
    });

    // Calculate averages by subject
    Object.keys(bySubject).forEach(subject => {
      const grades = bySubject[subject].grades;
      bySubject[subject].average = grades.length > 0
        ? grades.reduce((sum, grade) => sum + grade, 0) / grades.length
        : 0;
    });

    const performance = {
      overall: {
        averageGrade: Math.round(averageGrade * 10) / 10,
        totalActivities,
        completedActivities,
        completionRate: Math.round(completionRate),
        totalClasses: classes?.length || 0
      },
      bySubject: Object.entries(bySubject).map(([subject, data]) => ({
        subject,
        ...data
      })),
      recentGrades: submissions?.slice(0, 10).map(sub => {
        const activityAssignment = classActivities?.find(ca => ca.activity_id === sub.activity_id);
        const className = activityAssignment ? classes?.find(c => c.classes?.id === activityAssignment.class_id)?.classes?.name : 'Turma';
        
        return {
          subject: className || 'Turma',
          activity: sub.activities?.title || 'Atividade',
          grade: sub.grade || 0,
          date: sub.submitted_at
        };
      }) || [],
      trends: {
        last30Days: 0, // Would need more complex calculation
        last7Days: 0,
        improvement: 0
      },
      stats: {
        bestSubject: Object.entries(bySubject).reduce((best, [subject, data]) =>
          !best || data.average > bySubject[best]?.average ? subject : best, null) || 'N/A',
        needsAttention: Object.entries(bySubject).filter(([, data]) =>
          data.average < 6).map(([subject]) => subject),
        totalSubmissions: submissions?.length || 0,
        averageTime: 0
      }
    };

    // Cache for 1 hour
    await redisCache.set(`student:performance:${studentId}`, performance, 60 * 60);

    res.status(200).json(performance);

  } catch (error) {
    console.error('Performance fallback error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
