import { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Typography, 
  Divider, 
  Space, 
  Upload, 
  message, 
  Alert, 
  Spin,
  Row,
  Col,
  Tabs,
  Table,
  Tag
} from 'antd';
import { 
  UploadOutlined, 
  SaveOutlined, 
  SendOutlined, 
  FileTextOutlined,
  CheckCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getSubmission, 
  createSubmission, 
  submitDraft,
  getSubmissionStats
} from '../../services/submissionService';
import { getPlagiarismCheckForSubmission } from '../../services/plagiarismService';
import PlagiarismCheck from '../plagiarism/PlagiarismCheck';
import RichTextEditor from '../common/RichTextEditor';
import FileUpload from '../common/FileUpload';
import { formatFileSize } from '../../utils/fileUtils';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

const SubmissionForm = ({ activityId, readOnly = false }) => {
  const { submissionId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submission, setSubmission] = useState(null);
  const [plagiarismCheck, setPlagiarismCheck] = useState(null);
  const [activeTab, setActiveTab] = useState('answers');
  const [fileList, setFileList] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [questions, setQuestions] = useState([
    { id: 'q1', text: 'Question 1', type: 'essay', points: 10 },
    { id: 'q2', text: 'Question 2', type: 'short_answer', points: 5 },
  ]);

  // Load submission data if in edit mode
  useEffect(() => {
    if (submissionId) {
      loadSubmission();
    } else if (activityId) {
      // Initialize for new submission
      setSubmission({
        activity_id: activityId,
        user_id: user?.id,
        status: 'draft',
        answers: []
      });
      
      // Load activity questions
      loadActivityQuestions();
    }
  }, [submissionId, activityId, user]);
  
  // Load submission data
  const loadSubmission = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getSubmission(submissionId, user?.id);
      setSubmission(data);
      
      // Initialize answers
      if (data.answers) {
        setAnswers(data.answers);
      }
      
      // Load plagiarism check if submitted
      if (data.status !== 'draft') {
        try {
          const check = await getPlagiarismCheckForSubmission(submissionId);
          setPlagiarismCheck(check);
        } catch (err) {
          console.error('Error loading plagiarism check:', err);
        }
      }
      
      // Load submission stats
      if (data.activity_id) {
        try {
          const statsData = await getSubmissionStats(data.activity_id);
          setStats(statsData);
        } catch (err) {
          console.error('Error loading submission stats:', err);
        }
      }
      
    } catch (err) {
      console.error('Error loading submission:', err);
      setError('Failed to load submission. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Load activity questions
  const loadActivityQuestions = async () => {
    try {
      // In a real app, this would fetch from your API
      // const { data } = await getActivityQuestions(activityId);
      // setQuestions(data);
      
      // Mock data for now
      setQuestions([
        { 
          id: 'q1', 
          text: 'Explain the main concepts covered in this activity.', 
          type: 'essay', 
          points: 10,
          instructions: 'Write a detailed explanation with examples.'
        },
        { 
          id: 'q2', 
          text: 'What was the most challenging part?', 
          type: 'short_answer', 
          points: 5,
          instructions: 'Provide a brief response.'
        },
      ]);
    } catch (err) {
      console.error('Error loading questions:', err);
    }
  };
  
  // Handle answer change
  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => {
      const existing = prev.find(a => a.question_id === questionId);
      if (existing) {
        return prev.map(a => 
          a.question_id === questionId 
            ? { ...a, answer_text: value } 
            : a
        );
      }
      return [...prev, { question_id: questionId, answer_text: value }];
    });
  };
  
  // Handle file change
  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };
  
  // Save draft
  const saveDraft = async () => {
    try {
      setSaving(true);
      
      const submissionData = {
        activity_id: activityId,
        user_id: user?.id,
        answers: answers.map(a => ({
          question_id: a.question_id,
          answer_text: a.answer_text
        })),
        attachments: fileList.map(f => ({
          name: f.name,
          url: f.url || f.response?.url,
          type: f.type
        }))
      };
      
      let result;
      if (submissionId) {
        // Update existing submission
        // result = await updateSubmission(submissionId, submissionData);
        console.log('Would update submission:', submissionId, submissionData);
      } else {
        // Create new submission
        result = await createSubmission(submissionData, false);
        navigate(`/submissions/${result.id}`, { replace: true });
      }
      
      message.success('Draft saved successfully');
      return result;
    } catch (err) {
      console.error('Error saving draft:', err);
      message.error('Failed to save draft. Please try again.');
      throw err;
    } finally {
      setSaving(false);
    }
  };
  
  // Submit the submission
  const handleSubmit = async () => {
    try {
      if (!submissionId) {
        // Save as draft first if new
        const saved = await saveDraft();
        if (!saved) return;
      }
      
      setSubmitting(true);
      
      // Submit the draft
      const result = await submitDraft(submissionId);
      setSubmission(result);
      
      // Check for plagiarism
      if (result.status === 'submitted') {
        // In a real app, this would trigger a server-side check
        console.log('Would check for plagiarism');
      }
      
      message.success('Submission submitted successfully');
      
    } catch (err) {
      console.error('Error submitting:', err);
      message.error('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Render answer input based on question type
  const renderAnswerInput = (question) => {
    const answer = answers.find(a => a.question_id === question.id);
    
    switch (question.type) {
      case 'essay':
        return (
          <RichTextEditor
            value={answer?.answer_text || ''}
            onChange={(value) => handleAnswerChange(question.id, value)}
            readOnly={readOnly || submission?.status !== 'draft'}
            placeholder="Type your answer here..."
            style={{ minHeight: 200 }}
          />
        );
        
      case 'short_answer':
        return (
          <TextArea
            value={answer?.answer_text || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            disabled={readOnly || submission?.status !== 'draft'}
            rows={4}
            placeholder="Type your answer here..."
          />
        );
        
      case 'multiple_choice':
        return (
          <div>
            {question.options?.map((option, index) => (
              <div key={index} style={{ marginBottom: 8 }}>
                <label>
                  <input 
                    type="radio" 
                    name={`question_${question.id}`}
                    checked={answer?.answer_text === option.value}
                    onChange={() => handleAnswerChange(question.id, option.value)}
                    disabled={readOnly || submission?.status !== 'draft'}
                    style={{ marginRight: 8 }}
                  />
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );
        
      default:
        return (
          <Input
            value={answer?.answer_text || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            disabled={readOnly || submission?.status !== 'draft'}
            placeholder="Enter your answer..."
          />
        );
    }
  };
  
  // Render submission status tag
  const renderStatusTag = (status) => {
    const statusMap = {
      draft: { color: 'default', label: 'Draft' },
      submitted: { color: 'processing', label: 'Submitted' },
      graded: { color: 'success', label: 'Graded' },
      returned: { color: 'warning', label: 'Returned' },
      late: { color: 'error', label: 'Late' }
    };
    
    const { color, label } = statusMap[status] || { color: 'default', label: status };
    
    return <Tag color={color}>{label}</Tag>;
  };
  
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Loading submission...</div>
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
  
  const isDraft = submission?.status === 'draft';
  const isSubmitted = submission?.status === 'submitted' || submission?.status === 'graded';
  const canEdit = isDraft && !readOnly;
  
  return (
    <div className="submission-form">
      <Card 
        title={
          <Space>
            <FileTextOutlined />
            <span>Activity Submission</span>
            {submission?.status && renderStatusTag(submission.status)}
            
            {submission?.is_plagiarized && (
              <Tag color="red" icon={<WarningOutlined />}>
                Plagiarism Detected: {Math.round(submission.plagiarism_score * 100)}%
              </Tag>
            )}
          </Space>
        }
        extra={
          <Space>
            {canEdit && (
              <Button 
                icon={<SaveOutlined />} 
                onClick={saveDraft}
                loading={saving}
                disabled={!isDraft}
              >
                Save Draft
              </Button>
            )}
            
            {canEdit && (
              <Button 
                type="primary" 
                icon={<SendOutlined />} 
                onClick={handleSubmit}
                loading={submitting}
              >
                Submit
              </Button>
            )}
            
            {isSubmitted && submission?.final_grade !== null && (
              <Tag color="success" style={{ fontSize: 16, padding: '4px 12px' }}>
                Grade: {submission.final_grade}%
              </Tag>
            )}
          </Space>
        }
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Your Work" key="answers">
            {questions.map((question, index) => (
              <div key={question.id} style={{ marginBottom: 32 }}>
                <div style={{ marginBottom: 16 }}>
                  <Title level={4}>
                    Question {index + 1} 
                    <Text type="secondary" style={{ marginLeft: 8, fontSize: '0.8em' }}>
                      ({question.points} points)
                    </Text>
                  </Title>
                  
                  {question.instructions && (
                    <div style={{ 
                      backgroundColor: '#f9f9f9', 
                      padding: '12px 16px',
                      borderRadius: 4,
                      marginBottom: 12,
                      borderLeft: '3px solid #1890ff'
                    }}>
                      <Text type="secondary">
                        <strong>Instructions:</strong> {question.instructions}
                      </Text>
                    </div>
                  )}
                  
                  <Paragraph>{question.text}</Paragraph>
                </div>
                
                <div style={{ marginBottom: 24 }}>
                  {renderAnswerInput(question)}
                </div>
                
                {!isDraft && answers.find(a => a.question_id === question.id)?.feedback && (
                  <div style={{ 
                    marginTop: 16,
                    padding: '12px 16px',
                    backgroundColor: '#f6ffed',
                    border: '1px solid #b7eb8f',
                    borderRadius: 4
                  }}>
                    <Text strong>Feedback:</Text>
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: answers.find(a => a.question_id === question.id)?.feedback || '' 
                      }} 
                    />
                    {answers.find(a => a.question_id === question.id)?.points_earned !== undefined && (
                      <div style={{ marginTop: 8 }}>
                        <Text strong>Score: </Text>
                        <Text>
                          {answers.find(a => a.question_id === question.id)?.points_earned} 
                          / {question.points} points
                        </Text>
                      </div>
                    )}
                  </div>
                )}
                
                {index < questions.length - 1 && <Divider />}
              </div>
            ))}
            
            <div style={{ marginTop: 32 }}>
              <Title level={4}>Attachments</Title>
              <FileUpload
                fileList={fileList}
                onChange={handleFileChange}
                disabled={!canEdit}
                maxCount={5}
                maxSize={10}
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              />
              
              {submission?.attachments?.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <Text strong>Submitted Files:</Text>
                  <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                    {submission.attachments.map((file, index) => (
                      <li key={index}>
                        <a 
                          href={file.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          {file.name}
                        </a>
                        {' '}
                        <Text type="secondary">
                          ({formatFileSize(file.size || 0)})
                        </Text>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </TabPane>
          
          {isSubmitted && (
            <TabPane tab="Feedback" key="feedback">
              {submission?.feedback ? (
                <div>
                  <div 
                    className="feedback-content"
                    style={{ 
                      padding: 16,
                      backgroundColor: '#f9f9f9',
                      borderRadius: 4,
                      minHeight: 200
                    }}
                    dangerouslySetInnerHTML={{ __html: submission.feedback }}
                  />
                  
                  {submission.graded_at && (
                    <div style={{ marginTop: 16, textAlign: 'right' }}>
                      <Text type="secondary">
                        Graded on {new Date(submission.graded_at).toLocaleString()}
                      </Text>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Text type="secondary">
                    {submission?.status === 'submitted' 
                      ? 'Your submission is being reviewed. Check back later for feedback.'
                      : 'No feedback available yet.'}
                  </Text>
                </div>
              )}
              
              {plagiarismCheck && (
                <div style={{ marginTop: 32 }}>
                  <Title level={4}>Plagiarism Check</Title>
                  <PlagiarismCheck 
                    submissionId={submissionId} 
                    initialText={answers.map(a => a.answer_text).join('\n\n')}
                  />
                </div>
              )}
            </TabPane>
          )}
          
          {stats && (
            <TabPane tab="Class Statistics" key="stats">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={8}>
                  <Card size="small">
                    <Statistic
                      title="Submissions"
                      value={stats.submitted}
                      suffix={`/ ${stats.total_students} students`}
                    />
                    <div style={{ marginTop: 8 }}>
                      <Text type="secondary">
                        {Math.round((stats.submitted / Math.max(1, stats.total_students)) * 100)}% submission rate
                      </Text>
                    </div>
                  </Card>
                </Col>
                
                <Col xs={24} md={8}>
                  <Card size="small">
                    <Statistic
                      title="Average Grade"
                      value={stats.average_grade || 0}
                      suffix="%"
                    />
                    <div style={{ marginTop: 8 }}>
                      <Text type="secondary">
                        Based on {stats.graded} graded submissions
                      </Text>
                    </div>
                  </Card>
                </Col>
                
                <Col xs={24} md={8}>
                  <Card size="small">
                    <Statistic
                      title="Plagiarism Detected"
                      value={stats.plagiarism_detected}
                    />
                    <div style={{ marginTop: 8 }}>
                      <Text type="secondary">
                        {stats.plagiarism_detected > 0 ? 'Review needed' : 'No issues found'}
                      </Text>
                    </div>
                  </Card>
                </Col>
              </Row>
              
              {submission?.status === 'graded' && (
                <div style={{ marginTop: 24 }}>
                  <Title level={5}>Your Performance</Title>
                  <div style={{ marginTop: 16 }}>
                    <Text>Your grade: </Text>
                    <Text strong style={{ fontSize: 24 }}>
                      {submission.final_grade}%
                    </Text>
                    
                    <div style={{ marginTop: 16 }}>
                      <Text>Class average: {stats.average_grade}%</Text>
                    </div>
                    
                    <div style={{ marginTop: 8 }}>
                      <Text>Your rank: </Text>
                      <Text strong>
                        {stats.graded > 0 
                          ? `Top ${Math.round(((stats.graded - (stats.rank || 1)) / stats.graded) * 100)}%` 
                          : 'N/A'}
                      </Text>
                    </div>
                  </div>
                </div>
              )}
            </TabPane>
          )}
        </Tabs>
      </Card>
    </div>
  );
};

export default SubmissionForm;
