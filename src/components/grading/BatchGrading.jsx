import { useState, useCallback } from 'react';
import { Button, Upload, Card, Progress, Table, Tag, Space, Typography, Alert, Modal, message } from 'antd';
import { UploadOutlined, FileExcelOutlined, CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { createBatchGradingJob, getBatchGradingJob, getBatchGradingJobsForActivity } from '../../services/batchGradingService';

const { Title, Text } = Typography;
const { Dragger } = Upload;

const BatchGrading = ({ classId, activityId }) => {
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobDetails, setJobDetails] = useState(null);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loadingJobDetails, setLoadingJobDetails] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [error, setError] = useState(null);

  // Load batch grading jobs for this activity
  const loadBatchGradingJobs = useCallback(async () => {
    try {
      setLoadingJobs(true);
      const jobsData = await getBatchGradingJobsForActivity(activityId);
      setJobs(jobsData);
    } catch (err) {
      console.error('Error loading batch grading jobs:', err);
      setError('Failed to load batch grading jobs');
    } finally {
      setLoadingJobs(false);
    }
  }, [activityId]);

  // Load job details
  const loadJobDetails = async (jobId) => {
    try {
      setLoadingJobDetails(true);
      const details = await getBatchGradingJob(jobId);
      setJobDetails(details);
      setModalVisible(true);
    } catch (err) {
      console.error('Error loading job details:', err);
      message.error('Failed to load job details');
    } finally {
      setLoadingJobDetails(false);
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning('Please select a file to upload');
      return;
    }

    const file = fileList[0];
    
    // Validate file type (example: only allow Excel files)
    const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                   file.type === 'application/vnd.ms-excel' ||
                   file.name.endsWith('.xlsx') || 
                   file.name.endsWith('.xls');
    
    if (!isExcel) {
      message.error('You can only upload Excel files (.xlsx, .xls)');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      
      // Create the batch grading job
      const job = await createBatchGradingJob(classId, activityId, file);
      
      // Update the jobs list
      await loadBatchGradingJobs();
      
      // Show success message
      message.success('Batch grading job created successfully');
      
      // Clear the file list
      setFileList([]);
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('Failed to upload file. Please try again.');
      message.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  // Handle file change
  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  // Handle before upload
  const beforeUpload = (file) => {
    // Return false to prevent automatic upload
    return false;
  };

  // Job status tag
  const getStatusTag = (status) => {
    const statusMap = {
      pending: { color: 'default', text: 'Pending' },
      processing: { color: 'processing', text: 'Processing' },
      completed: { color: 'success', text: 'Completed' },
      failed: { color: 'error', text: 'Failed' },
    };

    const statusInfo = statusMap[status] || { color: 'default', text: status };
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };

  // Job columns for the table
  const jobColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <Text ellipsis style={{ maxWidth: 120 }}>{id}</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Progress',
      key: 'progress',
      render: (_, record) => {
        if (record.status === 'completed' || record.status === 'failed') {
          return (
            <Text type="secondary">
              {record.processed_submissions} of {record.total_submissions} processed
            </Text>
          );
        }
        
        return (
          <div style={{ width: 200 }}>
            <Progress 
              percent={record.total_submissions > 0 
                ? Math.round((record.processed_submissions / record.total_submissions) * 100) 
                : 0} 
              status={record.status === 'processing' ? 'active' : 'normal'}
              size="small"
            />
          </div>
        );
      },
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            onClick={() => loadJobDetails(record.id)}
            disabled={record.status === 'processing'}
          >
            View Details
          </Button>
        </Space>
      ),
    },
  ];

  // Results columns for the modal
  const resultColumns = [
    {
      title: 'Student',
      dataIndex: 'user_id',
      key: 'user_id',
      render: (userId) => <Text>{userId}</Text>, // In a real app, you'd fetch and display the student's name
    },
    {
      title: 'Grade',
      dataIndex: 'grade',
      key: 'grade',
      render: (grade) => <Text strong>{grade}%</Text>,
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        record.processed_at ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Processed
          </Tag>
        ) : (
          <Tag icon={<LoadingOutlined />} color="processing">
            Processing
          </Tag>
        )
      ),
    },
    {
      title: 'Feedback',
      dataIndex: 'feedback',
      key: 'feedback',
      ellipsis: true,
    },
  ];

  return (
    <div>
      <Card 
        title="Batch Grade Submissions" 
        style={{ marginBottom: 24 }}
        extra={
          <Button 
            type="primary" 
            onClick={loadBatchGradingJobs}
            loading={loadingJobs}
          >
            Refresh
          </Button>
        }
      >
        <Dragger
          name="file"
          multiple={false}
          fileList={fileList}
          onChange={handleFileChange}
          beforeUpload={beforeUpload}
          accept=".xlsx, .xls"
        >
          <p className="ant-upload-drag-icon">
            <FileExcelOutlined style={{ fontSize: 48, color: '#52c41a' }} />
          </p>
          <p className="ant-upload-text">
            Click or drag file to this area to upload
          </p>
          <p className="ant-upload-hint">
            Support for a single Excel file (.xlsx, .xls) with student submissions
          </p>
        </Dragger>

        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <Button
            type="primary"
            onClick={handleUpload}
            disabled={fileList.length === 0}
            loading={uploading}
            icon={<UploadOutlined />}
          >
            {uploading ? 'Uploading...' : 'Start Batch Grading'}
          </Button>
        </div>

        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            style={{ marginTop: 16 }}
            closable
            onClose={() => setError(null)}
          />
        )}
      </Card>

      <Card title="Recent Batch Jobs" loading={loadingJobs}>
        <Table 
          columns={jobColumns} 
          dataSource={jobs} 
          rowKey="id"
          pagination={{ pageSize: 5 }}
          locale={{
            emptyText: 'No batch jobs found. Upload a file to get started.'
          }}
        />
      </Card>

      {/* Job Details Modal */}
      <Modal
        title={
          <Space>
            {jobDetails?.status === 'completed' ? (
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
            ) : jobDetails?.status === 'failed' ? (
              <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
            ) : (
              <LoadingOutlined />
            )}
            <span>Batch Job Details</span>
          </Space>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={800}
      >
        {loadingJobDetails ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>Loading job details...</div>
          </div>
        ) : jobDetails ? (
          <div>
            <div style={{ marginBottom: 24 }}>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div>
                  <Text strong>Status: </Text>
                  {getStatusTag(jobDetails.status)}
                </div>
                <div>
                  <Text strong>Processed: </Text>
                  <Text>
                    {jobDetails.processed_submissions} of {jobDetails.total_submissions} submissions
                  </Text>
                </div>
                <div>
                  <Text strong>Created: </Text>
                  <Text>{new Date(jobDetails.created_at).toLocaleString()}</Text>
                </div>
                {jobDetails.updated_at && (
                  <div>
                    <Text strong>Last Updated: </Text>
                    <Text>{new Date(jobDetails.updated_at).toLocaleString()}</Text>
                  </div>
                )}
                {jobDetails.error_message && (
                  <Alert
                    message="Error"
                    description={jobDetails.error_message}
                    type="error"
                    showIcon
                    style={{ marginTop: 8 }}
                  />
                )}
              </Space>
            </div>

            {jobDetails.batch_grading_results && jobDetails.batch_grading_results.length > 0 ? (
              <Table
                columns={resultColumns}
                dataSource={jobDetails.batch_grading_results}
                rowKey="id"
                pagination={false}
                size="small"
                style={{ marginTop: 16 }}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <Text type="secondary">No results available for this job.</Text>
              </div>
            )}
          </div>
        ) : (
          <div>No job details available</div>
        )}
      </Modal>
    </div>
  );
};

export default BatchGrading;
