import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FiTrendingUp, FiTrendingDown, FiUsers, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';

const PerformanceIndicators = ({ userId, userRole }) => {
  const [metrics, setMetrics] = useState({
    averageGrade: null,
    submissionRate: null,
    lateSubmissionRate: null,
    studentsNeedingAttention: 0,
    totalStudents: 0,
    totalActivities: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, [userId, userRole]);

  const loadMetrics = async () => {
    try {
      setLoading(true);

      if (userRole === 'teacher') {
        await loadTeacherMetrics();
      } else if (userRole === 'student') {
        await loadStudentMetrics();
      }
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTeacherMetrics = async () => {
    // Get classes where user is teacher
    const { data: classes } = await supabase
      .from('class_members')
      .select('class_id')
      .eq('user_id', userId)
      .eq('role', 'teacher');

    if (!classes || classes.length === 0) return;

    const classIds = classes.map(c => c.class_id);

    // Get total students
    const { data: students } = await supabase
      .from('class_members')
      .select('user_id', { count: 'exact' })
      .in('class_id', classIds)
      .eq('role', 'student');

    // Get activities for these classes
    const { data: activities } = await supabase
      .from('activity_class_assignments')
      .select('activity_id')
      .in('class_id', classIds);

    const activityIds = activities ? [...new Set(activities.map(a => a.activity_id))] : [];

    // Get submissions
    const { data: submissions } = await supabase
      .from('submissions')
      .select('grade, status, submitted_at')
      .in('activity_id', activityIds);

    // Calculate metrics
    const gradedSubmissions = (submissions || []).filter(s => s.grade !== null);
    const averageGrade = gradedSubmissions.length > 0
      ? gradedSubmissions.reduce((sum, s) => sum + s.grade, 0) / gradedSubmissions.length
      : null;

    const totalExpectedSubmissions = (students?.length || 0) * activityIds.length;
    const submissionRate = totalExpectedSubmissions > 0
      ? ((submissions?.length || 0) / totalExpectedSubmissions) * 100
      : 0;

    const lateSubmissions = (submissions || []).filter(s => s.status === 'late' || s.status === 'returned');
    const lateSubmissionRate = submissions?.length > 0
      ? (lateSubmissions.length / submissions.length) * 100
      : 0;

    // Get alerts for students needing attention
    const { data: alerts } = await supabase
      .from('student_alerts')
      .select('student_id', { count: 'exact' })
      .in('class_id', classIds)
      .eq('resolved', false);

    const uniqueStudentsWithAlerts = alerts ? new Set(alerts.map(a => a.student_id)).size : 0;

    setMetrics({
      averageGrade: averageGrade ? averageGrade.toFixed(1) : null,
      submissionRate: submissionRate.toFixed(1),
      lateSubmissionRate: lateSubmissionRate.toFixed(1),
      studentsNeedingAttention: uniqueStudentsWithAlerts,
      totalStudents: students?.length || 0,
      totalActivities: activityIds.length
    });
  };

  const loadStudentMetrics = async () => {
    // Get student's submissions
    const { data: submissions } = await supabase
      .from('submissions')
      .select('grade, status, activity_id')
      .eq('user_id', userId);

    const gradedSubmissions = (submissions || []).filter(s => s.grade !== null);
    const averageGrade = gradedSubmissions.length > 0
      ? gradedSubmissions.reduce((sum, s) => sum + s.grade, 0) / gradedSubmissions.length
      : null;

    const lateSubmissions = (submissions || []).filter(s => s.status === 'late');
    const lateSubmissionRate = submissions?.length > 0
      ? (lateSubmissions.length / submissions.length) * 100
      : 0;

    setMetrics({
      averageGrade: averageGrade ? averageGrade.toFixed(1) : null,
      submissionRate: null, // Not applicable for students
      lateSubmissionRate: lateSubmissionRate.toFixed(1),
      studentsNeedingAttention: 0,
      totalStudents: 0,
      totalActivities: submissions?.length || 0
    });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.averageGrade !== null && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Média de Notas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-gray-900">
                {metrics.averageGrade}%
              </div>
              {parseFloat(metrics.averageGrade) >= 70 ? (
                <FiTrendingUp className="h-8 w-8 text-green-500" />
              ) : (
                <FiTrendingDown className="h-8 w-8 text-red-500" />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {userRole === 'teacher' && metrics.submissionRate !== null && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Taxa de Entrega
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-gray-900">
                {metrics.submissionRate}%
              </div>
              <FiCheckCircle className={`h-8 w-8 ${parseFloat(metrics.submissionRate) >= 80 ? 'text-green-500' : 'text-yellow-500'}`} />
            </div>
          </CardContent>
        </Card>
      )}

      {metrics.lateSubmissionRate !== null && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Entregas Atrasadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-gray-900">
                {metrics.lateSubmissionRate}%
              </div>
              <FiAlertTriangle className={`h-8 w-8 ${parseFloat(metrics.lateSubmissionRate) > 20 ? 'text-red-500' : 'text-yellow-500'}`} />
            </div>
          </CardContent>
        </Card>
      )}

      {userRole === 'teacher' && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Alunos Precisam Atenção
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-gray-900">
                {metrics.studentsNeedingAttention}
              </div>
              <FiUsers className={`h-8 w-8 ${metrics.studentsNeedingAttention > 0 ? 'text-red-500' : 'text-green-500'}`} />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              de {metrics.totalStudents} alunos
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PerformanceIndicators;
