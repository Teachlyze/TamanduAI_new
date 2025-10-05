import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button, Space, Typography, Spin, Alert, Divider } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { getClassGradingStats, getSubmissionsNeedingGrading } from '../../services/gradingService';
import { getPlagiarismChecksForClass } from '../../services/plagiarismService';

const { Title, Text } = Typography;

const GradingDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const [plagiarismAlerts, setPlagiarismAlerts] = useState([]);
  const [error, setError] = useState(null);
  const [checksBySubmission, setChecksBySubmission] = useState({});

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Get classes where user is a teacher
        const { data: teacherClasses, error: classesError } = await supabase
          .from('class_members')
          .select('class_id, classes(*)')
          .eq('user_id', user.id)
          .eq('role', 'teacher');
          
        if (classesError) throw classesError;
        
        if (!teacherClasses?.length) {
          setLoading(false);
          return;
        }
        
        const classIds = teacherClasses.map(c => c.class_id);
        
        // Load stats for each class
        const classStats = await Promise.all(
          classIds.map(classId => getClassGradingStats(classId))
        );
        
        // Load pending submissions
        const submissions = await getSubmissionsNeedingGrading(user.id);
        
        // Load plagiarism alerts
        const plagiarismChecks = await Promise.all(
          classIds.map(classId => getPlagiarismChecksForClass(classId))
        );
        const flatChecks = plagiarismChecks.flat();
        // Build map submission_id -> latest check
        const latestBySubmission = {};
        for (const chk of flatChecks) {
          const sid = chk.submission_id || chk.submission?.id;
          if (!sid) continue;
          const existing = latestBySubmission[sid];
          const ts = new Date(chk.created_at || chk.updated_at || 0).getTime();
          const prevTs = existing ? new Date(existing.created_at || existing.updated_at || 0).getTime() : -1;
          if (!existing || ts > prevTs) latestBySubmission[sid] = chk;
        }
        setChecksBySubmission(latestBySubmission);

        // Alerts using percentage if available or similarity_score as fallback
        const allPlagiarismAlerts = flatChecks.filter(check => {
          const percent = typeof check.plag_percent === 'number' ? check.plag_percent : Math.round((check.similarity_score || 0) * 100);
          return percent >= 35 && !check.is_notified;
        });
        
        setStats({
          classes: teacherClasses.map(tc => ({
            ...tc.classes,
            stats: classStats.find(s => s.class_id === tc.class_id)
          })),
          totalSubmissions: classStats.reduce((sum, s) => sum + (s.total_submissions || 0), 0),
          averageGrade: Math.round(
            classStats.reduce((sum, s) => sum + (s.average_grade || 0), 0) / 
            Math.max(1, classStats.filter(s => s.average_grade > 0).length)
          )
        });
        
        setPendingSubmissions(submissions);
        setPlagiarismAlerts(allPlagiarismAlerts);
        
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const columns = [
    {
      title: 'Class',
      dataIndex: 'class_name',
      key: 'class_name',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.class_name}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.activity_title}</Text>
        </Space>
      ),
    },
    {
      title: 'Student',
      dataIndex: 'user_name',
      key: 'user_name',
    },
    {
      title: 'Submitted',
      dataIndex: 'submitted_at',
      key: 'submitted_at',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag 
          color={status === 'submitted' ? 'blue' : 'orange'}
          icon={status === 'submitted' ? <ClockCircleOutlined /> : <ExclamationCircleOutlined />}
        >
          {status === 'submitted' ? 'Awaiting Grading' : 'Needs Revision'}
        </Tag>
      ),
    },
    {
      title: 'Plagiarism',
      key: 'plagiarism',
      render: (_, record) => {
        const chk = checksBySubmission[record.submission_id];
        if (!chk) return <Tag>—</Tag>;
        const percent = typeof chk.plag_percent === 'number' ? chk.plag_percent : Math.round((chk.similarity_score || 0) * 100);
        const sev = chk.severity || (percent > 50 ? 'gravissimo' : percent > 35 ? 'grave' : percent > 20 ? 'medio' : 'none');
        const color = sev === 'gravissimo' ? 'red' : sev === 'grave' ? 'orange' : sev === 'medio' ? 'gold' : 'default';
        const label = sev === 'gravissimo' ? `Gravíssimo ${percent}%` : sev === 'grave' ? `Grave ${percent}%` : sev === 'medio' ? `Médio ${percent}%` : 'OK';
        return <Tag color={color}>{label}</Tag>;
      }
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="link" 
          onClick={() => {
            // Navigate to grading interface
            console.log('Grade submission:', record.submission_id);
          }}
        >
          Grade
        </Button>
      ),
    },
  ];

  const plagiarismColumns = [
    {
      title: 'Submission',
      dataIndex: 'submission_id',
      key: 'submission_id',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>Submission #{record.submission_id.substring(0, 8)}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.similarity_score * 100}% similarity
          </Text>
        </Space>
      ),
    },
    {
      title: 'Details',
      dataIndex: 'details',
      key: 'details',
      render: (_, record) => (
        <div>
          <Text>Matched sources: {record.plagiarism_sources?.length || 0}</Text>
        </div>
      ),
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity) => {
        const severityMap = {
          low: { color: 'green', label: 'Low' },
          medium: { color: 'orange', label: 'Medium' },
          high: { color: 'red', label: 'High' }
        };
        
        const { color, label } = severityMap[severity] || { color: 'default', label: 'Unknown' };
        
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="link" 
          onClick={() => {
            // Navigate to plagiarism details
            console.log('View plagiarism details:', record.id);
          }}
        >
          Review
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        showIcon
        style={{ margin: '20px 0' }}
      />
    );
  }

  return (
    <div className="grading-dashboard">
      <Title level={2}>Grading Dashboard</Title>
      
      {/* Summary Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Classes"
              value={stats?.classes.length || 0}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Submissions to Grade"
              value={pendingSubmissions.length}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Plagiarism Alerts"
              value={plagiarismAlerts.length}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: plagiarismAlerts.length > 0 ? '#ff4d4f' : 'inherit' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Average Grade"
              value={stats?.averageGrade || 0}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>
      
      {/* Class Stats */}
      {stats?.classes.map((classItem) => (
        <Card 
          key={classItem.id} 
          title={classItem.name}
          style={{ marginBottom: 24 }}
          extra={
            <Button 
              type="link"
              onClick={() => {
                // Navigate to class grading page
                console.log('View class:', classItem.id);
              }}
            >
              View All
            </Button>
          }
        >
          {classItem.stats ? (
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <Statistic
                  title="Activities"
                  value={classItem.stats.total_activities}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic
                  title="Submissions"
                  value={classItem.stats.total_submissions}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic
                  title="Average Grade"
                  value={classItem.stats.average_grade || 0}
                  suffix="%"
                />
              </Col>
              
              {classItem.stats.activities?.slice(0, 3).map((activity) => (
                <Col span={24} key={activity.activity_id}>
                  <Card size="small">
                    <Row align="middle">
                      <Col xs={16}>
                        <Text strong>{activity.title}</Text>
                        <div>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {new Date(activity.due_date).toLocaleDateString()}
                          </Text>
                        </div>
                      </Col>
                      <Col xs={8} style={{ textAlign: 'right' }}>
                        <Text>
                          {activity.graded_submissions} of {activity.total_submissions} graded
                        </Text>
                        {activity.plagiarism_count > 0 && (
                          <div>
                            <Text type="danger" style={{ fontSize: 12 }}>
                              {activity.plagiarism_count} plagiarism case(s)
                            </Text>
                          </div>
                        )}
                      </Col>
                    </Row>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Text type="secondary">No data available for this class</Text>
          )}
        </Card>
      ))}
      
      {/* Pending Submissions */}
      <Card 
        title={
          <Space>
            <ClockCircleOutlined />
            <span>Submissions Needing Grading</span>
            {pendingSubmissions.length > 0 && (
              <Tag color="blue">{pendingSubmissions.length}</Tag>
            )}
          </Space>
        }
        style={{ marginBottom: 24 }}
      >
        {pendingSubmissions.length > 0 ? (
          <Table 
            columns={columns} 
            dataSource={pendingSubmissions} 
            rowKey="submission_id"
            pagination={{ pageSize: 5 }}
            size="small"
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Text type="secondary">No submissions need grading at this time</Text>
          </div>
        )}
      </Card>
      
      {/* Plagiarism Alerts */}
      {plagiarismAlerts.length > 0 && (
        <Card 
          title={
            <Space>
              <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
              <span>Plagiarism Alerts</span>
              <Tag color="red">{plagiarismAlerts.length}</Tag>
            </Space>
          }
          style={{ marginBottom: 24 }}
        >
          <Table 
            columns={plagiarismColumns} 
            dataSource={plagiarismAlerts} 
            rowKey="id"
            pagination={{ pageSize: 3 }}
            size="small"
          />
          
          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <Button 
              type="link"
              onClick={() => {
                // Navigate to plagiarism dashboard
                console.log('View all plagiarism alerts');
              }}
            >
              View All Alerts
            </Button>
          </div>
        </Card>
      )}
      
      {/* Recent Activity */}
      <Card title="Recent Activity">
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Text type="secondary">Recent grading activity will appear here</Text>
        </div>
      </Card>
    </div>
  );
};

export default GradingDashboard;
