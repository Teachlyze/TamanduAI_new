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
      .from('class_students')
      .select(`
        id,
        status,
        enrolled_at,
        classes (
          id,
          name,
          subject,
          teacher_id,
          is_active,
          created_at,
          class_activities (
            id,
            title,
            type,
            is_published,
            due_date,
            created_at
          )
        )
      `)
      .eq('student_id', studentId)
      .eq('status', 'active');

    if (classesError) throw classesError;

    // Get student's grades
    const { data: grades, error: gradesError } = await supabase
      .from('submissions')
      .select(`
        id,
        grade,
        submitted_at,
        status,
        class_activities (
          id,
          title,
          type,
          classes (
            id,
            name,
            subject
          )
        )
      `)
      .eq('student_id', studentId)
      .not('grade', 'is', null)
      .order('submitted_at', { ascending: false })
      .limit(10);

    if (gradesError) throw gradesError;

    // Get teacher's feedback
    const { data: feedbacks, error: feedbackError } = await supabase
      .from('feedback')
      .select(`
        id,
        comment,
        created_at,
        type,
        class_activities (
          id,
          title,
          classes (
            id,
            name,
            subject
          )
        ),
        profiles!feedback_teacher_id_fkey (
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
      const activities = item.classes?.class_activities || [];
      const totalActivities = activities.filter(a => a.is_published).length;
      const completedActivities = activities.filter(a =>
        grades?.some(g => g.class_activities?.id === a.id)
      ).length;

      // Calculate average grade for this class
      const classGrades = grades?.filter(g =>
        g.class_activities?.classes?.id === item.classes.id
      ) || [];

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
    const processedGrades = grades?.map(grade => ({
      id: grade.id,
      subject: grade.class_activities?.classes?.name || 'Turma',
      activity: grade.class_activities?.title || 'Atividade',
      grade: grade.grade || 0,
      date: grade.submitted_at,
      type: grade.class_activities?.type || 'Atividade'
    })) || [];

    // Process feedback data
    const processedFeedbacks = feedbacks?.map(feedback => ({
      id: feedback.id,
      subject: feedback.class_activities?.classes?.name || 'Turma',
      teacher: feedback.profiles?.full_name || 'Professor',
      comment: feedback.comment,
      date: feedback.created_at,
      type: feedback.type || 'Feedback'
    })) || [];

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
