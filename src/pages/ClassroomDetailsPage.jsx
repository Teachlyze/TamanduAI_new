import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { Layout, Typography, Card, Button, message, Tag, Descriptions, Space, List, Badge } from 'antd';
import { setClassroomState } from '../services/agoraClassroomAPI';
import { useActivities } from '@/contexts/ActivityContext';
import NotificationService from '@/services/notificationService';
import { NOTIFICATION_TYPES } from '@/constants/notifications';
import { useAuth } from "@/hooks/useAuth";

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const ClassroomDetailsPage = () => {
  const { roomUuid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { classroom: initialClassroom } = location.state || {};

  const [classroom, setClassroom] = useState(initialClassroom);
  const [loading, setLoading] = useState(false);
  const { activities, loading: activitiesLoading } = useActivities(classroom.roomUuid);

  if (!classroom) {
    return (
      <Content className="p-8">
        <Title level={2}>Classroom Not Found</Title>
        <Paragraph>The classroom details could not be loaded. Please return to the classrooms list.</Paragraph>
        <Button onClick={() => navigate('/classrooms')}>Go to Classrooms</Button>
      </Content>
    );
  }

  const handleSetState = async (state) => {
    setLoading(true);
    try {
      await setClassroomState(roomUuid, state);
      const stateText = state === 1 ? 'started' : 'ended';
      message.success(`Classroom successfully ${stateText}.`);
      // We would normally update the state from the API response
      // For now, we'll just update it locally for the UI
      setClassroom(prev => ({ ...prev, state }));
    } catch (error) {
      message.error(`Failed to update classroom state: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getClassStateTag = (state) => {
    switch (state) {
      case 0: return <Tag color="default">Not Started</Tag>;
      case 1: return <Tag color="success">In Progress</Tag>;
      case 2: return <Tag color="error">Ended</Tag>;
      default: return <Tag>Unknown</Tag>;
    }
  };

  const handleDeleteActivity = async (activityId) => {
    try {
      await deleteActivity(activityId);
      message.success('Atividade deletada com sucesso!');
    } catch (error) {
      message.error('Erro ao deletar atividade');
    }
  };

  return (
    <Content className="p-4 md:p-8">
      <Title level={2}>{classroom.roomName}</Title>
      <Paragraph>Gerencie o estado da sala e visualize os detalhes e atividades abaixo.</Paragraph>

      <Card>
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Status">{getClassStateTag(classroom.state)}</Descriptions.Item>
          <Descriptions.Item label="Room UUID">{classroom.roomUuid}</Descriptions.Item>
          <Descriptions.Item label="Room Type">{classroom.roomType}</Descriptions.Item>
        </Descriptions>

        <Space className="mt-6">
          <Button 
            type="primary" 
            onClick={() => handleSetState(1)} 
            loading={loading}
            disabled={classroom.state === 1 || classroom.state === 2}
          >
            Start Class
          </Button>
          <Button 
            danger 
            onClick={() => handleSetState(2)} 
            loading={loading}
            disabled={classroom.state === 2}
          >
            End Class
          </Button>
<Button onClick={() => navigate(`/atividades/criar?classId=${classroom.roomUuid}`)}>
            Criar Atividade
          </Button>
        </Space>
      </Card>

      {/* Lista de Atividades */}
      <Card title="Atividades da Turma" className="mt-6">
        {activitiesLoading ? (
          <p>Carregando atividades...</p>
        ) : (
          <List
            dataSource={activities}
            renderItem={(activity) => (
              <List.Item>
                <List.Item.Meta
                  title={activity.title}
                  description={activity.description}
                  avatar={
                    <Badge status="success" text={new Date(activity.created_at).toLocaleDateString()} />
                  }
                />
                <Space>
                  <Button
                    type="link"
                    onClick={() => navigate(`/atividades/${activity.id}`)}
                  >
                    Ver Detalhes
                  </Button>
                  {classroom.state === 1 && (
                    <Button
                      type="link"
                      onClick={() => {
                        if (window.confirm('Tem certeza que deseja deletar esta atividade?')) {
                          handleDeleteActivity(activity.id);
                        }
                      }}
                    >
                      Deletar
                    </Button>
                  )}
                </Space>
              </List.Item>
            )}
          />
        )}
      </Card>
    </Content>
  );
};

export default ClassroomDetailsPage;
