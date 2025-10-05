import React, { useState } from 'react';
import { Layout, Typography, Divider, Card } from 'antd';
import CreateClassroomForm from '../components/classrooms/CreateClassroomForm';
import ClassroomList from '../components/classrooms/ClassroomList';
import { useUserClasses } from '@/hooks/useRedisCache';
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from 'lucide-react';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const ClassroomsPage = () => {
  const { user } = useAuth();
  const [classrooms, setClassrooms] = useState([]);

  // Use Redis cache for user classes
  const { data: cachedClasses, loading: classesLoading, error: classesError } = useUserClasses(user?.id, 'student');

  const handleClassroomCreated = (newClassroom) => {
    setClassrooms(prevClassrooms => [...prevClassrooms, newClassroom]);
  };

  if (classesLoading) {
    return (
      <Content className="p-4 md:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Carregando turmas...</p>
          </div>
        </div>
      </Content>
    );
  }

  return (
    <Content className="p-4 md:p-8">
      <Title level={2}>Gerenciamento de Turmas</Title>
      <Paragraph>
        Crie e gerencie suas turmas virtuais. Junte-se a uma turma para acessar as atividades e recursos disponíveis.
      </Paragraph>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card>
            <Title level={4}>Create a New Classroom</Title>
            <CreateClassroomForm onClassroomCreated={handleClassroomCreated} />
          </Card>
        </div>
        <div className="md:col-span-2">
          <Title level={4}>Available Classrooms</Title>
          {cachedClasses && cachedClasses.length > 0 ? (
            <ClassroomList classrooms={cachedClasses} />
          ) : (
            <Paragraph type="secondary">No classrooms have been created yet. Use the form to create your first one.</Paragraph>
          )}
        </div>
      </div>
    </Content>
  );
};

export default ClassroomsPage;
