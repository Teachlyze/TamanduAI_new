import { PremiumCard } from '@/components/ui/PremiumCard'
import { PremiumButton } from '@/components/ui/PremiumButton', { useState }
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format, parseISO, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  Users, 
  User, 
  CheckCircle2, 
  Clock as ClockIcon, 
  XCircle, 
  Edit, 
  Trash2, 
  Send, 
  MessageSquare, 
  FileText,
  AlertCircle,
  File, 
  X, 
  Loader2, 
  Download, 
  Paperclip 
} from 'lucide-react';

// UI Components
import Button from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import MeetingAttachments from '@/components/meetings/MeetingAttachments';

// Services
import { MeetingService } from '@/services/meetingsService';
import { UserService } from '@/services/userService';

  const MeetingDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State
  const [meeting, setMeeting] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  // tabs are uncontrolled below
  const [notes, setNotes] = useState('');
  const [isSubmittingNotes, setIsSubmittingNotes] = useState(false);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);

  // Format date and time
  const formatDateTime = (dateString) => {
    const date = parseISO(dateString);
    return {
      date: format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }),
      time: format(date, "HH:mm", { locale: ptBR })
    };
  };

  // Fetch meeting details
  const fetchMeetingDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const meetingData = await MeetingService.getMeetingById(id);
      if (!meetingData) {
        throw new Error('Reunião não encontrada');
      }
      
      setMeeting(meetingData);
      setNotes(meetingData.notes || '');
      
      // If participants data is not included in the meeting object, fetch them
      if (!meetingData.participants || meetingData.participants.length === 0) {
        fetchParticipants(meetingData.id);
      } else {
        setParticipants(meetingData.participants);
      }
      
    } catch (error) {
      console.error('Error fetching meeting details:', error);
      setError(error.message || 'Não foi possível carregar os detalhes da reunião.');
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar reunião',
        description: error.message || 'Ocorreu um erro ao carregar os detalhes da reunião.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [id, toast, fetchParticipants]);

  // Fetch participants
  const fetchParticipants = useCallback(async (meetingId) => {
    try {
      setIsLoadingParticipants(true);
      const participantsData = await MeetingService.getMeetingParticipants(meetingId);
      setParticipants(participantsData);
    } catch (error) {
      console.error('Error fetching participants:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar participantes',
        description: 'Não foi possível carregar a lista de participantes da reunião.',
      });
    } finally {
      setIsLoadingParticipants(false);
    }
  }, [toast]);

  // Handle delete meeting
  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja excluir esta reunião? Esta ação não pode ser desfeita.')) {
      return;
    }
    
    try {
      setIsDeleting(true);
      await MeetingService.deleteMeeting(id);
      
      toast({
        title: 'Reunião excluída',
        description: 'A reunião foi excluída com sucesso.',
      });
      
      navigate('/meetings');
    } catch (error) {
      console.error('Error deleting meeting:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir reunião',
        description: error.message || 'Não foi possível excluir a reunião. Tente novamente.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle save notes
  const handleSaveNotes = async () => {
    if (!meeting) return;
    
    try {
      setIsSubmittingNotes(true);
      const updatedMeeting = await MeetingService.updateMeeting(meeting.id, {
        ...meeting,
        notes
      });
      
      setMeeting(updatedMeeting);
      
      toast({
        title: 'Notas salvas',
        description: 'As anotações da reunião foram salvas com sucesso.',
      });
    } catch (error) {
      console.error('Error saving notes:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar anotações',
        description: 'Não foi possível salvar as anotações da reunião.',
      });
    } finally {
      setIsSubmittingNotes(false);
    }
  };

  // Handle participant status update
  const handleUpdateStatus = async (participantId, status) => {
    try {
      await MeetingService.updateParticipantStatus(meeting.id, participantId, status);
      
      // Update local state
      setParticipants(prev => 
        prev.map(p => 
          p.id === participantId 
            ? { ...p, status, updated_at: new Date().toISOString() } 
            : p
        )
      );
      
      toast({
        title: 'Status atualizado',
        description: 'O status do participante foi atualizado com sucesso.',
      });
    } catch (error) {
      console.error('Error updating participant status:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar status',
        description: 'Não foi possível atualizar o status do participante.',
      });
    }
  };

  // Set up real-time subscription for meeting updates
  useEffect(() => {
    fetchMeetingDetails(, []); // TODO: Add dependencies
    
    const subscription = MeetingService.subscribeToMeetingUpdates(id, (payload) => {
      console.log('Meeting update received:', payload, []); // TODO: Add dependencies
      fetchMeetingDetails(, []); // TODO: Add dependencies
    }, []); // TODO: Add dependencies
    
    if (loading) return <LoadingScreen />;

  return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [id, fetchMeetingDetails]);

  // Render loading state
  if (isLoading) {
    if (loading) return <LoadingScreen />;

  return (
      <div className="container mx-auto py-12 px-4">
      <PremiumCard variant="elevated">
        <LoadingSpinner size="lg" text="Carregando detalhes da reunião..." />
      </div>
    );
  }

  // Render error state
  if (error || !meeting) {
    if (loading) return <LoadingScreen />;

  return (
      <div className="container mx-auto py-12 px-4">
      <PremiumCard variant="elevated">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {error || 'Reunião não encontrada'}
          </h2>
          <p className="text-muted-foreground mb-6">
            Não foi possível carregar os detalhes da reunião solicitada.
          </p>
          <Button onClick={() => navigate('/meetings')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para a lista de reuniões
          </Button>
        </PremiumCard>
    </div>
      </div>
    );
  }

  const { date, time } = formatDateTime(meeting.start_time);
  const endTime = format(parseISO(meeting.end_time), 'HH:mm', { locale: ptBR });
  const isPastMeeting = isPast(parseISO(meeting.end_time));
  const isOnline = meeting.meeting_type === 'online';

  if (loading) return <LoadingScreen />;

  return (
    <ErrorBoundary
      errorTitle="Ocorreu um erro na página de detalhes da reunião"
      errorMessage="Algo inesperado aconteceu. Por favor, tente recarregar a página."
    >
      <div className="container mx-auto py-6 px-4">
      <PremiumCard variant="elevated">
        {/* Header with back button and actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-2"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Voltar</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{meeting.title}</h1>
              <p className="text-muted-foreground">
                Detalhes e gerenciamento da reunião
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={() => navigate(`/meetings/edit/${meeting.id}`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Excluir
            </Button>
          </div>
        </div>
        
        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Meeting details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Meeting info card */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{meeting.title}</CardTitle>
                    <CardDescription className="mt-2">
                      {meeting.description || 'Nenhuma descrição fornecida.'}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={isPastMeeting ? 'secondary' : 'default'}
                    className="ml-2"
                  >
                    {isPastMeeting ? 'Realizada' : 'Agendada'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Data e horário</p>
                    <p className="text-sm">
                      {date} • {time} - {endTime}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {isOnline ? (
                      <Video className="h-5 w-5 text-primary" />
                    ) : (
                      <MapPin className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">
                      {isOnline ? 'Link da reunião' : 'Local'}
                    </p>
                    {isOnline ? (
                      <a 
                        href={meeting.meeting_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        {meeting.meeting_url}
                      </a>
                    ) : (
                      <p className="text-sm">
                        {meeting.location || 'Local não especificado'}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Participantes</p>
                    <div className="flex -space-x-2 mt-1">
                      {participants.slice(0, 5).map((participant) => (
                        <Avatar key={participant.id} className="border-2 border-background">
                          <AvatarImage src={participant.avatar_url} alt={participant.name} />
                          <AvatarFallback>
                            {participant.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {participants.length > 5 && (
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                          +{participants.length - 5}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {participants.length} {participants.length === 1 ? 'participante' : 'participantes'}
                    </p>
                  </div>
                </div>
              </CardContent>
              {isOnline && !isPastMeeting && (
                <CardFooter className="border-t pt-4">
                  <Button className="w-full" asChild>
                    <a 
                      href={meeting.meeting_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Video className="mr-2 h-4 w-4" />
                      Entrar na reunião
                    </a>
                  </Button>
                </CardFooter>
              )}
            </Card>
            
            {/* Tabs for additional content */}
            <Tabs defaultValue="notes">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="notes">
                  <FileText className="h-4 w-4 mr-2" />
                  Anotações
                </TabsTrigger>
                <TabsTrigger value="participants">
                  <Users className="h-4 w-4 mr-2" />
                  Participantes
                </TabsTrigger>
                <TabsTrigger value="attachments">
                  <Paperclip className="h-4 w-4 mr-2" />
                  Anexos
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="notes" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Anotações da Reunião</CardTitle>
                    <CardDescription>
                      Adicione notas e informações relevantes sobre esta reunião.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Adicione suas anotações aqui..."
                      className="min-h-[200px]"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </CardContent>
                  <CardFooter className="flex justify-end border-t pt-4">
                    <Button 
                      onClick={handleSaveNotes}
                      disabled={isSubmittingNotes}
                    >
                      {isSubmittingNotes ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Salvar anotações
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="participants" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Participantes</CardTitle>
                    <CardDescription>
                      Lista de participantes confirmados e seus status.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingParticipants ? (
                      <div className="flex justify-center py-8">
                        <LoadingSpinner size="md" text="Carregando participantes..." />
                      </div>
                    ) : participants.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Nenhum participante adicionado a esta reunião.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {participants.map((participant) => (
                          <div 
                            key={participant.id}
                            className="flex items-center justify-between p-3 rounded-lg border"
                          >
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarImage src={participant.avatar_url} alt={participant.name} />
                                <AvatarFallback>
                                  {participant.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{participant.name}</p>
                                <p className="text-sm text-muted-foreground">{participant.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {participant.status === 'confirmed' ? (
                                <Badge variant="success">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Confirmado
                                </Badge>
                              ) : participant.status === 'pending' ? (
                                <Badge variant="warning">
                                  <ClockIcon className="h-3 w-3 mr-1" />
                                  Pendente
                                </Badge>
                              ) : (
                                <Badge variant="destructive">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Recusado
                                </Badge>
                              )}
                              
                              {!isPastMeeting && (
                                <div className="flex space-x-1">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 px-2"
                                    onClick={() => handleUpdateStatus(participant.id, 'confirmed')}
                                    disabled={participant.status === 'confirmed'}
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 px-2"
                                    onClick={() => handleUpdateStatus(participant.id, 'declined')}
                                    disabled={participant.status === 'declined'}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="attachments" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Anexos da Reunião</CardTitle>
                    <CardDescription>
                      Arquivos compartilhados nesta reunião.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MeetingAttachments 
                      meetingId={meeting.id}
                      readOnly={isPastMeeting}
                      onUploadSuccess={() => {
                        toast({
                          title: 'Anexo adicionado',
                          description: 'O arquivo foi enviado com sucesso.',
                        });
                      }}
                      onDeleteSuccess={() => {
                        toast({
                          title: 'Anexo removido',
                          description: 'O arquivo foi removido com sucesso.',
                        });
                      }}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Right column - Actions and related info */}
          <div className="space-y-6">
            {/* Quick actions card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="bg-white dark:bg-slate-900 text-foreground border-border w-full justify-start">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Enviar lembrete
                </Button>
                <Button variant="outline" className="bg-white dark:bg-slate-900 text-foreground border-border w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Adicionar participantes
                </Button>
                <Button variant="outline" className="bg-white dark:bg-slate-900 text-foreground border-border w-full justify-start">
                  <Calendar className="mr-2 h-4 w-4" />
                  Reagendar
                </Button>
                <Button 
                  variant="outline" 
                  className="bg-white dark:bg-slate-900 text-foreground border-border w-full justify-start text-destructive hover:text-destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isDeleting ? 'Excluindo...' : 'Excluir reunião'}
                </Button>
              </CardContent>
            </Card>
            
            {/* Meeting details card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detalhes da Reunião</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Criada em</p>
                  <p className="text-sm">
                    {format(parseISO(meeting.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Criada por</p>
                  <div className="flex items-center mt-1">
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src={meeting.creator?.avatar_url} />
                      <AvatarFallback>
                        {meeting.creator?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{meeting.creator?.name || 'Usuário'}</span>
                  </div>
                </div>
                
                {meeting.updated_at !== meeting.created_at && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Última atualização</p>
                    <p className="text-sm">
                      {format(parseISO(meeting.updated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID da reunião</p>
                  <p className="text-sm font-mono bg-muted px-2 py-1 rounded mt-1">
                    {meeting.id}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default MeetingDetailsPage;
