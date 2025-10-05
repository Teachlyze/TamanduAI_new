import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import ClassInviteService from '@/services/classInviteService';

export default function useClassInvites(classId) {
  const [invites, setInvites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const fetchInvites = useCallback(async () => {
    if (!classId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await ClassInviteService.getInvitesByClass(classId);
      setInvites(data || []);
    } catch (err) {
      console.error('Error fetching invites:', err);
      setError(err.message);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar convites',
        description: 'Não foi possível carregar os links de convite. Tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [classId, toast]);

  const createInvite = useCallback(async (options = {}) => {
    if (!classId) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const invite = await ClassInviteService.createInvite(classId, options);
      await fetchInvites();
      toast({
        title: 'Link de convite criado',
        description: 'O link foi gerado com sucesso!',
      });
      return invite;
    } catch (err) {
      console.error('Error creating invite:', err);
      setError(err.message);
      toast({
        variant: 'destructive',
        title: 'Erro ao criar convite',
        description: err.message || 'Não foi possível criar o link de convite.',
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [classId, fetchInvites, toast]);

  const revokeInvite = useCallback(async (inviteId) => {
    if (!inviteId) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await ClassInviteService.revokeInvite(inviteId);
      setInvites(prev => prev.filter(invite => invite.id !== inviteId));
      toast({
        title: 'Convite revogado',
        description: 'O link de convite foi desativado com sucesso.',
      });
      return true;
    } catch (err) {
      console.error('Error revoking invite:', err);
      setError(err.message);
      toast({
        variant: 'destructive',
        title: 'Erro ao revogar convite',
        description: 'Não foi possível revogar o link de convite.',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const useInvite = useCallback(async (token) => {
    if (!token) return { success: false, error: 'Token inválido' };
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');
      
      const result = await ClassInviteService.acceptInvite(token, user.id);
      
      if (result.success) {
        toast({
          title: 'Inscrição realizada',
          description: result.alreadyEnrolled 
            ? 'Você já está inscrito nesta turma.' 
            : 'Você foi inscrito na turma com sucesso!',
        });
      }
      
      return result;
    } catch (err) {
      console.error('Error using invite:', err);
      setError(err.message);
      toast({
        variant: 'destructive',
        title: 'Erro ao usar convite',
        description: err.message || 'Não foi possível aceitar o convite.',
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    invites,
    isLoading,
    error,
    fetchInvites,
    createInvite,
    revokeInvite,
    useInvite,
  };
}
