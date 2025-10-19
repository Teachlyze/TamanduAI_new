import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { X, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

/**
 * Painel de Debug - Remover em produção!
 * Mostra informações sobre autenticação e roteamento
 * 
 * Para usar: Adicionar no Layout principal temporariamente
 * <DebugPanel />
 */
const DebugPanel = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [show, setShow] = useState(true);
  const [tablesStatus, setTablesStatus] = useState({});

  useEffect(() => {
    checkTables();
  }, []);

  const checkTables = async () => {
    const tables = ['classes', 'activities', 'class_members', 'submissions'];
    const status = {};

    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('id')
          .limit(1);
        
        status[table] = !error;
      } catch (e) {
        status[table] = false;
      }
    }

    setTablesStatus(status);
  };

  if (!show) return null;

  const role = user?.user_metadata?.role || user?.role;
  const expectedPaths = {
    student: '/students',
    teacher: '/dashboard',
    school: '/school'
  };
  const expectedPath = expectedPaths[role];
  const isCorrectPath = location.pathname.startsWith(expectedPath);

  return (
    <div className="fixed bottom-4 right-4 z-[9999] max-w-md">
      <div className="bg-white dark:bg-gray-800 border-2 border-orange-500 rounded-lg shadow-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            Debug Panel
          </h3>
          <button
            onClick={() => setShow(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 text-xs">
          {/* User Info */}
          <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
            <div className="font-semibold mb-1">👤 Usuário:</div>
            <div>Email: {user?.email || 'N/A'}</div>
            <div className="flex items-center gap-2">
              Role: 
              <span className={`px-2 py-0.5 rounded ${role ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {role || '❌ NÃO DEFINIDO'}
              </span>
            </div>
          </div>

          {/* Path Info */}
          <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
            <div className="font-semibold mb-1">📍 Rota:</div>
            <div>Atual: {location.pathname}</div>
            <div className="flex items-center gap-2">
              Esperada: {expectedPath || 'N/A'}
              {isCorrectPath ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
            </div>
          </div>

          {/* Tables Status */}
          <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
            <div className="font-semibold mb-1">🗄️ Tabelas:</div>
            {Object.entries(tablesStatus).map(([table, ok]) => (
              <div key={table} className="flex items-center gap-2">
                {ok ? (
                  <CheckCircle className="w-3 h-3 text-green-500" />
                ) : (
                  <XCircle className="w-3 h-3 text-red-500" />
                )}
                {table}
              </div>
            ))}
          </div>

          {/* Actions */}
          {(!role || !isCorrectPath || Object.values(tablesStatus).some(v => !v)) && (
            <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-300">
              <div className="font-semibold mb-1 text-yellow-700 dark:text-yellow-400">
                ⚠️ Ações Necessárias:
              </div>
              {!role && (
                <div className="text-yellow-700 dark:text-yellow-300">
                  • Definir role no Supabase
                </div>
              )}
              {!isCorrectPath && (
                <div className="text-yellow-700 dark:text-yellow-300">
                  • Rota incorreta para o role
                </div>
              )}
              {Object.values(tablesStatus).some(v => !v) && (
                <div className="text-yellow-700 dark:text-yellow-300">
                  • Executar migração SQL
                </div>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => window.location.href = expectedPath}
              className="flex-1 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
            >
              Ir para rota correta
            </button>
            <button
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
                window.location.reload();
              }}
              className="flex-1 px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
            >
              Limpar cache
            </button>
          </div>
        </div>

        <div className="mt-2 pt-2 border-t text-[10px] text-gray-500">
          ℹ️ Remover este componente em produção
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;
