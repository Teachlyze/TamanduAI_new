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
    const cacheKey = `student_performance_${id}`;
    const cachedData = await redisCache.get(cacheKey);

    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    // Fetch detailed performance data
    const { data: performanceData, error } = await supabase
      .from('grades')
      .select(`
        id,
        grade,
        subject,
        activity,
        date,
        type,
        class_id,
        classes(name, description)
      `)
      .eq('student_id', id)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching performance data:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }

    // Calculate performance metrics
    const grades = performanceData || [];
    const totalGrades = grades.length;
    const averageGrade = totalGrades > 0
      ? grades.reduce((sum, grade) => sum + grade.grade, 0) / totalGrades
      : 0;

    // Group by subject
    const performanceBySubject = grades.reduce((acc, grade) => {
      const subject = grade.subject;
      if (!acc[subject]) {
        acc[subject] = {
          subject,
          grades: [],
          average: 0,
          total: 0
        };
      }
      acc[subject].grades.push(grade.grade);
      acc[subject].total += 1;
      return acc;
    }, {});

    // Calculate averages by subject
    Object.keys(performanceBySubject).forEach(subject => {
      const subjectData = performanceBySubject[subject];
      subjectData.average = subjectData.grades.reduce((sum, grade) => sum + grade, 0) / subjectData.grades.length;
    });

    // Recent activities (last 10)
    const recentActivities = grades.slice(0, 10).map(grade => ({
      id: grade.id,
      subject: grade.subject,
      activity: grade.activity,
      grade: grade.grade,
      date: grade.date,
      type: grade.type,
      className: grade.classes?.name || 'N/A'
    }));

    const performanceMetrics = {
      totalGrades,
      averageGrade: Math.round(averageGrade * 10) / 10,
      performanceBySubject: Object.values(performanceBySubject),
      recentActivities,
      gradeDistribution: {
        excellent: grades.filter(g => g.grade >= 9).length,
        good: grades.filter(g => g.grade >= 7 && g.grade < 9).length,
        fair: grades.filter(g => g.grade >= 5 && g.grade < 7).length,
        poor: grades.filter(g => g.grade < 5).length
      }
    };

    // Cache the result for 10 minutes
    await redisCache.set(cacheKey, performanceMetrics, 600);

    res.status(200).json(performanceMetrics);
  } catch (error) {
    console.error('Student performance error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
