import { supabase } from '@/lib/supabaseClient';
import { redisCache } from '@/services/redisService';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: 'Student ID is required' });
  }

  try {
    // Check cache first
    const cacheKey = `student_profile_${id}`;
    const cachedData = await redisCache.get(cacheKey);

    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    // Fetch student data from Supabase
    const { data: studentData, error: studentError } = await supabase
      .from('profiles')
      .select(`
        id,
        name,
        email,
        phone,
        status,
        created_at,
        classes:enrollments(
          id,
          class_id,
          classes(
            id,
            name,
            description
          )
        )
      `)
      .eq('id', id)
      .single();

    if (studentError || !studentData) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Fetch grades and activities for the student
    const { data: gradesData, error: gradesError } = await supabase
      .from('grades')
      .select(`
        id,
        grade,
        subject,
        activity,
        date,
        type,
        class_id,
        classes(name)
      `)
      .eq('student_id', id)
      .order('date', { ascending: false });

    if (gradesError) {
      console.error('Error fetching grades:', gradesError);
    }

    // Calculate statistics
    const stats = {
      averageGrade: gradesData && gradesData.length > 0
        ? gradesData.reduce((sum, grade) => sum + grade.grade, 0) / gradesData.length
        : 0,
      totalActivities: gradesData ? gradesData.length : 0,
      completedActivities: gradesData ? gradesData.filter(g => g.grade > 0).length : 0,
      totalClasses: studentData.classes ? studentData.classes.length : 0,
      overallProgress: gradesData && gradesData.length > 0
        ? Math.round((gradesData.filter(g => g.grade > 0).length / gradesData.length) * 100)
        : 0
    };

    // Format the response
    const studentProfile = {
      id: studentData.id,
      name: studentData.name,
      email: studentData.email,
      phone: studentData.phone || '',
      status: studentData.status || 'active',
      joinDate: studentData.created_at,
      stats,
      classes: studentData.classes?.map(enrollment => ({
        id: enrollment.classes.id,
        name: enrollment.classes.name,
        description: enrollment.classes.description,
        average: stats.averageGrade,
        total: stats.totalActivities,
        completed: stats.completedActivities,
        progress: stats.overallProgress
      })) || [],
      grades: gradesData?.map(grade => ({
        id: grade.id,
        subject: grade.subject,
        activity: grade.activity,
        grade: grade.grade,
        date: grade.date,
        type: grade.type
      })) || []
    };

    // Cache the result for 5 minutes
    await redisCache.set(cacheKey, studentProfile, 300);

    res.status(200).json(studentProfile);
  } catch (error) {
    console.error('Student profile error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
