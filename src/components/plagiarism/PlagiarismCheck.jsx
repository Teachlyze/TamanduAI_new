import { useState, useEffect } from 'react';
import { Card, Progress, Button, Alert, Typography, List, Space, Spin } from 'antd';
import { CheckCircleOutlined, WarningOutlined, LoadingOutlined } from '@ant-design/icons';
import { checkSubmissionForPlagiarism, getPlagiarismCheckForSubmission } from '../../services/plagiarismService';

const { Title, Text, Paragraph } = Typography;

const PlagiarismCheck = ({ submissionId, initialText = '' }) => {
  const [loading, setLoading] = useState(false);
  const [check, setCheck] = useState(null);
  const [error, setError] = useState(null);

  const loadPlagiarismCheck = async () => {
    try {
      setLoading(true);
      const result = await getPlagiarismCheckForSubmission(submissionId);
      if (result) {
        setCheck(result);
      }
    } catch (err) {
      console.error('Error loading plagiarism check:', err);
      setError('Failed to load plagiarism check results');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckPlagiarism = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await checkSubmissionForPlagiarism(submissionId, initialText);
      setCheck(result);
    } catch (err) {
      console.error('Error checking for plagiarism:', err);
      setError('Failed to check for plagiarism. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (submissionId) {
      loadPlagiarismCheck();
    }
  }, [submissionId]);

  const getStatusIcon = () => {
    if (!check) return null;
    
    return check.status === 'completed' ? (
      check.similarity_score > 0.3 ? (
        <WarningOutlined style={{ color: '#faad14' }} />
      ) : (
        <CheckCircleOutlined style={{ color: '#52c41a' }} />
      )
    ) : null;
  };

  const getStatusText = () => {
    if (!check) return 'Not checked';
    
    switch (check.status) {
      case 'pending':
        return 'Pending';
      case 'processing':
        return 'Processing...';
      case 'completed':
        return `Similarity: ${Math.round(check.similarity_score * 100)}%`;
      case 'failed':
        return 'Check failed';
      default:
        return 'Unknown status';
    }
  };

  const getSimilarityColor = (score) => {
    if (score < 0.3) return '#52c41a'; // Green
    if (score < 0.7) return '#faad14'; // Orange
    return '#ff4d4f'; // Red
  };

  return (
    <Card 
      title={
        <Space>
          {getStatusIcon()}
          <span>Plagiarism Check</span>
        </Space>
      }
      style={{ marginTop: 16 }}
      extra={
        !check || check.status === 'failed' ? (
          <Button 
            type="primary" 
            onClick={handleCheckPlagiarism}
            loading={loading}
            disabled={!initialText}
          >
            Check for Plagiarism
          </Button>
        ) : (
          <Button onClick={handleCheckPlagiarism} loading={loading}>
            Re-check
          </Button>
        )
      }
    >
      {error && (
        <Alert message="Error" description={error} type="error" showIcon style={{ marginBottom: 16 }} />
      )}

      {!check ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Paragraph type="secondary">
            {initialText 
              ? 'Click the button to check this submission for plagiarism.'
              : 'No text content available to check for plagiarism.'}
          </Paragraph>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text>Similarity Score</Text>
              <Text strong>{Math.round(check.similarity_score * 100)}%</Text>
            </div>
            <Progress 
              percent={Math.round(check.similarity_score * 100)} 
              strokeColor={getSimilarityColor(check.similarity_score)}
              showInfo={false}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {check.similarity_score < 0.3 
                  ? 'Low similarity - likely original work.'
                  : check.similarity_score < 0.7 
                    ? 'Moderate similarity - review recommended.'
                    : 'High similarity - potential plagiarism detected.'}
              </Text>
            </div>
          </div>

          {check.plagiarism_sources && check.plagiarism_sources.length > 0 && (
            <div>
              <Title level={5} style={{ marginBottom: 16 }}>Potential Sources</Title>
              <List
                itemLayout="vertical"
                dataSource={check.plagiarism_sources}
                renderItem={(source) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <a href={source.source_url} target="_blank" rel="noopener noreferrer">
                          {source.source_url}
                        </a>
                      }
                      description={
                        <div>
                          <div style={{ marginBottom: 8 }}>
                            <Text type="secondary">
                              Similarity: <Text strong style={{ color: getSimilarityColor(source.similarity) }}>
                                {Math.round(source.similarity * 100)}%
                              </Text>
                            </Text>
                          </div>
                          <div style={{ 
                            backgroundColor: '#f6ffed', 
                            borderLeft: '3px solid #52c41a',
                            padding: '8px 12px',
                            borderRadius: 2,
                            fontStyle: 'italic'
                          }}>
                            {source.matched_text || 'Matching text not available'}
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </div>
          )}

          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Last checked: {new Date(check.processed_at).toLocaleString()}
            </Text>
          </div>
        </div>
      )}
    </Card>
  );
};

export default PlagiarismCheck;
