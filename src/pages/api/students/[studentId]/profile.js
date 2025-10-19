// src/pages/api/students/[studentId]/profile.js
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
    const cacheKey = `student:profile:${studentId}`;
    const cachedProfile = await redisCache.get(cacheKey);

    if (cachedProfile) {
      return res.status(200).json(cachedProfile);
    }

    // Get student profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, full_name, email, phone, avatar_url, created_at, updated_at')
      .eq('id', studentId)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get student's classes with statistics
    const { data: classes, error: classesError } = await supabase
      .from('class_members')
      .select(`
        id,
        role,
        created_at,
        classes (
          id,
          name,
          subject,
          teacher_id,
          is_active,
          created_at
        )
      `)
      .eq('user_id', studentId)
      .eq('role', 'student');

    if (classesError) throw classesError;

    // Get student's activities for enrolled classes
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
              due_date,
              created_at
            )
          `)
          .in('class_id', classIds)
      : { data: [], error: null };
    
    if (activitiesError) throw activitiesError;

    // Get student's grades
    const { data: grades, error: gradesError } = await supabase
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
      .order('submitted_at', { ascending: false })
      .limit(10);

    if (gradesError) throw gradesError;

    // Get teacher's feedback
    const { data: feedbacks, error: feedbackError } = await supabase
      .from('student_feedback_history')
      .select(`
        id,
        activity_id,
        feedback_text,
        created_at,
        feedback_type,
        activities (
          id,
          title
        ),
        profiles!student_feedback_history_given_by_fkey (
          id,
          username,
          full_name
        )
      `)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (feedbackError) throw feedbackError;

    // Process classes data
    const processedClasses = classes?.map(item => {
      // Get activities for this class
      const activities = classActivities?.filter(ca => ca.class_id === item.classes?.id)
        .map(ca => ca.activities)
        .filter(Boolean) || [];
      
      const totalActivities = activities.filter(a => a.status === 'published' || a.status === 'active').length;
      const completedActivities = activities.filter(a =>
        grades?.some(g => g.activity_id === a.id)
      ).length;

      // Calculate average grade for this class
      const activityIds = activities.map(a => a.id);
      const classGrades = grades?.filter(g => activityIds.includes(g.activity_id)) || [];

      const average = classGrades.length > 0
        ? classGrades.reduce((sum, g) => sum + (g.grade || 0), 0) / classGrades.length
        : 0;

      return {
        id: item.classes.id,
        name: item.classes.name,
        subject: item.classes.subject,
        average: Math.round(average * 10) / 10,
        total: totalActivities,
        completed: completedActivities,
        progress: totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0
      };
    }) || [];

    // Process grades data
    const processedGrades = grades?.map(grade => {
      // Find which class this activity belongs to
      const activityAssignment = classActivities?.find(ca => ca.activity_id === grade.activity_id);
      const className = activityAssignment ? classes?.find(c => c.classes?.id === activityAssignment.class_id)?.classes?.name : 'Turma';
      
      return {
        id: grade.id,
        subject: className || 'Turma',
        activity: grade.activities?.title || 'Atividade',
        grade: grade.grade || 0,
        date: grade.submitted_at,
        type: grade.activities?.activity_type || 'Atividade'
      };
    }) || [];

    // Process feedback data
    const processedFeedbacks = feedbacks?.map(feedback => {
      // Find which class this activity belongs to
      const activityAssignment = classActivities?.find(ca => ca.activity_id === feedback.activity_id);
      const className = activityAssignment ? classes?.find(c => c.classes?.id === activityAssignment.class_id)?.classes?.name : 'Turma';
      
      return {
        id: feedback.id,
        subject: className || 'Turma',
        teacher: feedback.profiles?.full_name || 'Professor',
        comment: feedback.feedback_text,
        date: feedback.created_at,
        type: feedback.feedback_type || 'Feedback'
      };
    }) || [];

    const studentProfile = {
      id: profile.id,
      name: profile.full_name || profile.username,
      email: profile.email,
      phone: profile.phone,
      status: 'active',
      joinDate: profile.created_at,
      avatarUrl: profile.avatar_url,
      classes: processedClasses,
      grades: processedGrades,
      feedbacks: processedFeedbacks,
      stats: {
        totalClasses: processedClasses.length,
        averageGrade: processedClasses.length > 0
          ? processedClasses.reduce((sum, cls) => sum + cls.average, 0) / processedClasses.length
          : 0,
        totalActivities: processedClasses.reduce((sum, cls) => sum + cls.total, 0),
        completedActivities: processedClasses.reduce((sum, cls) => sum + cls.completed, 0),
        overallProgress: processedClasses.length > 0
          ? Math.round(processedClasses.reduce((sum, cls) => sum + cls.progress, 0) / processedClasses.length)
          : 0
      }
    };

    // Cache the result for 30 minutes
    await redisCache.set(cacheKey, studentProfile, 30 * 60);

    res.status(200).json(studentProfile);

  } catch (error) {
    console.error('Student profile error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
