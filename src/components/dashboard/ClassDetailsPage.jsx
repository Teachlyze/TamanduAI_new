import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getClassDetails, getClassStudents } from '@/services/apiSupabase';
import { useAuth } from "@/hooks/useAuth";
// useActivities is intentionally not used but may be needed later
// import { useActivities } from '../../contexts/ActivityContext';
import Loading from '../Loading';
import ActivitiesList from '../activities/ActivitiesList';
import { RefreshCw, Users, BookOpen, AlertCircle, Share2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ClassAIAssistant from '@/components/classes/ClassAIAssistant';
import ClassInviteManager from '../classes/ClassInviteManager';

const ClassDetailsPage = () => {
  const { classId } = useParams();
  const { user } = useAuth();
  // classDetails state is used throughout the component
  const [classDetails, setClassDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isTeacher, setIsTeacher] = useState(false);
  // Students state is intentionally unused but may be needed later
  const [_students, _setStudents] = useState([]);
  // isRefreshing state is intentionally unused but may be needed later
  const [isRefreshing, _setIsRefreshing] = useState(false);

  // Função para carregar os detalhes da turma
  const fetchClassDetails = useCallback(async () => {
    if (!classId) {
      console.error('No classId provided');
      setError('ID da turma não fornecido');
      setLoading(false);
      return;
    }
    
    if (!user) {
      console.error('No user found in auth context');
      setError('Usuário não autenticado');
      setLoading(false);
      return;
    }
    
    try {
      setError('');
      console.log('Fetching class details for classId:', classId);
      
      // Buscar detalhes da turma
      const data = await getClassDetails(classId);
      console.log('Class details:', data);
      
      if (!data) {
        throw new Error('Turma não encontrada');
      }

      // Verificar se o usuário atual é o professor
      const userIsTeacher = data.created_by === user.id;
      setIsTeacher(userIsTeacher);
      
      // Set the class details
      setClassDetails(data);
      
      // Carregar estudantes da turma
      // Students data is intentionally not used but may be needed later
      const studentsData = await getClassStudents(classId);
      _setStudents(studentsData || []); // Using the correctly named setter with underscore
      
    } catch (err) {
      console.error('Error fetching class details:', err);
      setError(err.message || 'Erro ao carregar os detalhes da turma');
      setLoading(false);
    }
  }, [classId, user]);

  // Efeito para carregar os dados iniciais
  useEffect(() => {
    fetchClassDetails();
  }, [fetchClassDetails]);
  
  // Refresh function is intentionally unused but may be needed later
  // const handleRefresh = async () => {
  //   setIsRefreshing(true);
  //   try {
  //     await fetchClassDetails();
  //   } finally {
  //     setIsRefreshing(false);
  //   }
  // };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loading />
        <span className="ml-2">Carregando detalhes da turma...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <span className="font-medium">Erro ao carregar a turma</span>
          </div>
          <p className="mt-2 text-sm">{error}</p>
          <button
            onClick={fetchClassDetails}
            className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!classDetails) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-gray-600">Turma não encontrada.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{classDetails.name}</h1>
        {classDetails.description && (
          <p className="text-gray-600 mt-2">{classDetails.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conteúdo principal */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="activities" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="activities">
                <BookOpen className="w-4 h-4 mr-2" />
                Atividades
              </TabsTrigger>
              <TabsTrigger value="students">
                <Users className="w-4 h-4 mr-2" />
                Alunos
              </TabsTrigger>
            </TabsList>

            {/* Aba de Atividades */}
            <TabsContent value="activities">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Atividades da Turma</h2>
                <ActivitiesList classId={classId} isTeacher={isTeacher} />
              </div>
            </TabsContent>

            {/* Aba de Convites (apenas para professores) */}
            {isTeacher && (
              <TabsContent value="invites">
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Gerenciar Convites</h2>
                  <ClassInviteManager classId={classId} />
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
        {/* Coluna lateral */}
        <div className="space-y-6">
          <ClassAIAssistant classId={classId} />
        </div>
      </div>
    </div>
  );
};

export default ClassDetailsPage;
