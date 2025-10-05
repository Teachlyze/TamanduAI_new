// src/pages/meetings/MeetingsPageWrapper.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from "@/hooks/useAuth";
import useUserRole from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar, Video, Plus, Users } from 'lucide-react';
import { format } from 'date-fns';
import MeetingsSkeleton from '@/components/ui/meetings-skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const MeetingsPageWrapper = () => {
  const { user } = useAuth();
  const { isTeacher } = useUserRole();
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadMeetings = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Buscar turmas do usuário via membership e turmas criadas por ele
      const [{ data: memberRows, error: memberErr }, { data: ownedClasses, error: ownedErr }] = await Promise.all([
        supabase.from('class_members').select('class_id').eq('user_id', user.id),
        supabase.from('classes').select('id').eq('created_by', user.id),
      ])

      if (memberErr) throw memberErr
      if (ownedErr) throw ownedErr

      const classIds = [
        ...(memberRows?.map(r => r.class_id) || []),
        ...(ownedClasses?.map(c => c.id) || []),
      ]

      const uniqueClassIds = Array.from(new Set(classIds))

      // Buscar meetings onde usuário é criador ou pertence às turmas
      let meetingsQuery = supabase
        .from('meetings')
        .select(`
          id,
          title,
          class_id,
          start_time,
          end_time,
          description,
          status,
          created_by,
          classes (
            id,
            name
          )
        `)
        .order('start_time', { ascending: false })
        .limit(50);

      // Filtrar por criador ou turmas do usuário
      if (uniqueClassIds.length > 0) {
        meetingsQuery = meetingsQuery.or(`created_by.eq.${user.id},class_id.in.(${uniqueClassIds.join(',')})`);
      } else {
        meetingsQuery = meetingsQuery.eq('created_by', user.id);
      }

      const { data, error } = await meetingsQuery;

      if (error) throw error;
      
      setMeetings(data || []);
    } catch (err) {
      setError(err.message || 'Falha ao carregar reuniões');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadMeetings();
  }, [loadMeetings]);

  // Loading state
  if (loading) {
    return <MeetingsSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Reuniões</h1>
            <p className="text-sm text-muted-foreground">Salas vinculadas às suas turmas</p>
          </div>
          <Button onClick={loadMeetings} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar novamente
          </Button>
        </div>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={loadMeetings}>
              <RefreshCw className="h-3 w-3 mr-1" />
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Success state - renderizar o componente real
  return      <MeetingsPageContent 
        meetings={meetings} 
        isTeacher={isTeacher} 
        navigate={navigate}
      />;
};

// Componente interno que recebe os dados já carregados
const MeetingsPageContent = ({ meetings = [], isTeacher, navigate }) => {
  if (!Array.isArray(meetings)) {
    return null; // or a loading/error state
  }
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reuniões</h1>
          <p className="text-sm text-muted-foreground">Salas vinculadas às suas turmas</p>
        </div>
        {isTeacher && (
          <Button onClick={() => navigate('/dashboard/calendar')}>
            <Plus className="w-4 h-4 mr-2" /> Agendar pela Agenda
          </Button>
        )}
      </div>

      {meetings.length === 0 ? (
        <Card className="p-8 text-center">
          <Calendar className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="font-medium">Nenhuma reunião encontrada</p>
          <p className="text-sm text-muted-foreground">Use a Agenda para criar um novo evento de reunião</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {meetings.map((m) => (
            <Card key={m.id} className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{m.title || 'Reunião'}</div>
                <Users className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="text-sm text-muted-foreground">
                {m.classes?.name ? `Turma: ${m.classes.name}` : 'Sem turma'}
              </div>
              <div className="text-xs text-muted-foreground">
                {m.start_time ? format(new Date(m.start_time), 'dd/MM/yyyy HH:mm') : '—'}
              </div>
              <div className="pt-2 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => navigate(`/meetings/${m.id}`)}>
                  <Video className="w-4 h-4 mr-1" /> Entrar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MeetingsPageWrapper;
