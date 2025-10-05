import React from 'react';
import useSupabaseTest from '@/hooks/useSupabaseTest';

const SupabaseTest = () => {
  const { connectionStatus, authStatus, tableStatus } = useSupabaseTest();

  const getStatusColor = (status) => {
    switch (status) {
      case 'ok': return 'green';
      case 'error': return 'red';
      case 'no_auth': return 'orange';
      default: return 'gray';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ok': return '✅ OK';
      case 'error': return '❌ Erro';
      case 'no_auth': return '⚠️ Não autenticado';
      case 'testing': return '⏳ Testando...';
      default: return '❓ Desconhecido';
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h3>🩺 Diagnóstico do Supabase</h3>

      <div style={{ margin: '10px 0' }}>
        <strong>Conexão básica:</strong>
        <span style={{ color: getStatusColor(connectionStatus), marginLeft: '10px' }}>
          {getStatusText(connectionStatus)}
        </span>
      </div>

      <div style={{ margin: '10px 0' }}>
        <strong>Autenticação:</strong>
        <span style={{ color: getStatusColor(authStatus), marginLeft: '10px' }}>
          {getStatusText(authStatus)}
        </span>
      </div>

      <div style={{ margin: '10px 0' }}>
        <strong>Tabela calendar_events:</strong>
        <span style={{ color: getStatusColor(tableStatus), marginLeft: '10px' }}>
          {getStatusText(tableStatus)}
        </span>
      </div>

      {connectionStatus === 'error' && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          <h4>Possíveis causas do erro de conexão:</h4>
          <ul>
            <li>Problemas de rede</li>
            <li>Configuração incorreta do Supabase</li>
            <li>Firewall bloqueando conexões WebSocket</li>
            <li>Variáveis de ambiente incorretas</li>
          </ul>
        </div>
      )}

      {authStatus === 'error' && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          <h4>Possíveis causas do erro de autenticação:</h4>
          <ul>
            <li>Usuário não logado</li>
            <li>Token de autenticação expirado</li>
            <li>Problemas no contexto de autenticação</li>
          </ul>
        </div>
      )}

      {tableStatus === 'error' && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          <h4>Possíveis causas do erro na tabela:</h4>
          <ul>
            <li>Tabela não existe no banco</li>
            <li>Políticas RLS bloqueando acesso</li>
            <li>Problemas de permissão</li>
            <li>Dados não existem para o usuário</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default SupabaseTest;
