import React, { useState } from 'react';
import Button from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import NotificationService from '@/services/notificationService';
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const NotificationTest = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [notificationType, setNotificationType] = useState('info');
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [testResults, setTestResults] = useState('');

  const notificationTypes = [
    { value: 'info', label: 'Informação' },
    { value: 'success', label: 'Sucesso' },
    { value: 'warning', label: 'Aviso' },
    { value: 'error', label: 'Erro' },
    { value: 'event', label: 'Evento' },
    { value: 'reminder', label: 'Lembrete' },
  ];

  const logTestResult = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => `[${timestamp}] ${message}\n${prev}`);
  };

  const sendTestNotification = async (e) => {
    e.preventDefault();
    if (!notificationTitle.trim() || !notificationMessage.trim()) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Por favor, preencha o título e a mensagem da notificação.',
      });
      return;
    }

    setIsLoading(true);
    logTestResult(`Enviando notificação de teste do tipo: ${notificationType}...`);

    try {
      const notification = {
        title: notificationTitle || `Notificação de teste (${notificationType})`,
        message: notificationMessage || 'Esta é uma notificação de teste',
        type: notificationType,
        action_url: '/dashboard',
      };

      const result = await NotificationService.scheduleNotification(notification);
      
      logTestResult(`✅ Notificação enviada com sucesso! ID: ${result.id}`);
      
      toast({
        title: 'Notificação de teste enviada',
        description: 'Verifique a campainha de notificações no cabeçalho.',
      });

      // Clear form
      setNotificationTitle('');
      setNotificationMessage('');
    } catch (error) {
      console.error('Erro ao enviar notificação de teste:', error);
      logTestResult(`❌ Erro ao enviar notificação: ${error.message}`);
      
      toast({
        variant: 'destructive',
        title: 'Erro ao enviar notificação',
        description: error.message || 'Ocorreu um erro ao enviar a notificação de teste.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testMarkAsRead = async () => {
    try {
      logTestResult('Buscando notificações não lidas...');
      const unread = await NotificationService.getNotifications({ unreadOnly: true, limit: 1 });
      
      if (unread.length === 0) {
        logTestResult('❌ Nenhuma notificação não lida encontrada para teste.');
        return;
      }
      
      const notification = unread[0];
      logTestResult(`Marcando notificação como lida: ${notification.id}...`);
      
      await NotificationService.markAsRead(notification.id);
      logTestResult(`✅ Notificação marcada como lida com sucesso!`);
      
      toast({
        title: 'Teste de marcação como lida',
        description: 'A notificação foi marcada como lida com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao testar marcação como lida:', error);
      logTestResult(`❌ Erro ao marcar notificação como lida: ${error.message}`);
    }
  };

  const testDelete = async () => {
    try {
      logTestResult('Buscando notificações para exclusão...');
      const notifications = await NotificationService.getNotifications({ limit: 1 });
      
      if (notifications.length === 0) {
        logTestResult('❌ Nenhuma notificação encontrada para teste de exclusão.');
        return;
      }
      
      const notification = notifications[0];
      logTestResult(`Excluindo notificação: ${notification.id}...`);
      
      await NotificationService.deleteNotification(notification.id);
      logTestResult(`✅ Notificação excluída com sucesso!`);
      
      toast({
        title: 'Teste de exclusão',
        description: 'A notificação foi excluída com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao testar exclusão:', error);
      logTestResult(`❌ Erro ao excluir notificação: ${error.message}`);
    }
  };

  const testRealTime = () => {
    logTestResult('Iniciando teste de notificações em tempo real...');
    
    // This will be handled by the subscription in the NotificationDropdown component
    toast({
      title: 'Teste de notificação em tempo real',
      description: 'Verifique a campainha de notificações em alguns segundos.',
    });
    
    // Simulate a real-time notification
    setTimeout(() => {
      const event = new CustomEvent('notification:test', {
        detail: {
          eventType: 'INSERT',
          new: {
            id: `test-${Date.now()}`,
            title: 'Notificação em Tempo Real',
            message: 'Esta é uma notificação de teste em tempo real!',
            type: 'info',
            is_read: false,
            created_at: new Date().toISOString(),
            user_id: user?.id,
          },
        },
      });
      
      window.dispatchEvent(event);
      logTestResult('✅ Evento de notificação em tempo real disparado!');
    }, 3000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Teste de Notificações</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Enviar Notificação de Teste</CardTitle>
            <CardDescription>
              Envie uma notificação de teste para o painel de notificações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={sendTestNotification} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notificationType">Tipo de Notificação</Label>
                <Select 
                  value={notificationType} 
                  onValueChange={setNotificationType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {notificationTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  placeholder="Título da notificação"
                  value={notificationTitle}
                  onChange={(e) => setNotificationTitle(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Mensagem</Label>
                <Input
                  id="message"
                  placeholder="Mensagem da notificação"
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                />
              </div>
              
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Enviando...' : 'Enviar Notificação de Teste'}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Testes de Funcionalidade</CardTitle>
            <CardDescription>
              Teste as funcionalidades do sistema de notificações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">Testes de API</h3>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  onClick={testMarkAsRead}
                  disabled={isLoading}
                >
                  Testar Marcar como Lida
                </Button>
                <Button 
                  variant="outline" 
                  onClick={testDelete}
                  disabled={isLoading}
                >
                  Testar Exclusão
                </Button>
                <Button 
                  variant="outline" 
                  onClick={testRealTime}
                  disabled={isLoading}
                >
                  Testar Tempo Real
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">Registro de Testes</h3>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md h-48 overflow-y-auto font-mono text-sm">
                {testResults || 'Nenhum teste executado ainda.'}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setTestResults('')}
                className="text-xs"
              >
                Limpar Registros
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotificationTest;
