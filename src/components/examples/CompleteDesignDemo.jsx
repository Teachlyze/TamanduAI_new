// src/components/examples/CompleteDesignDemo.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Home,
  Users,
  BookOpen,
  Settings,
  Bell,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  TrendingDown,
  Activity,
  Award,
  Clock,
} from 'lucide-react';
import EnhancedLayout, { EnhancedSidebar } from '@/components/ui/EnhancedLayout';
import { EnhancedCard, StatCard, StatsGrid, ProgressRing, SimpleBarChart } from '@/components/ui/EnhancedTable';
import { EnhancedInput, EnhancedSelect, EnhancedButton, EnhancedCheckbox } from '@/components/ui/EnhancedForm';
import { NotificationProvider, useNotifications, NotificationCenter, NotificationToggle } from '@/components/ui/EnhancedNotifications';
import { AdvancedSidebar, AdvancedPagination, AdvancedSearch, QuickActionButton } from '@/components/ui/EnhancedNavigation';
import { useAccessibility } from '@/hooks/useAccessibility';
import { useTheme } from '@/components/ui/ThemeProvider';

/**
 * Demonstração completa de todos os componentes de design aprimorados
 */
const CompleteDesignDemo = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const { preferences } = useAccessibility();
  const { theme, setTheme } = useTheme();
  const { showSuccess, showError, showWarning } = useNotifications();

  // Dados de exemplo
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'content', label: 'Conteúdo', icon: BookOpen },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  const stats = [
    { title: 'Usuários Ativos', value: '2,847', change: '+12%', trend: 'up', icon: Users },
    { title: 'Taxa de Sucesso', value: '94.2%', change: '+2.1%', trend: 'up', icon: Award },
    { title: 'Tempo Médio', value: '2.4s', change: '-0.3s', trend: 'down', icon: Clock },
    { title: 'Atividades', value: '156', change: '+8', trend: 'up', icon: Activity },
  ];

  const tableData = [
    { id: 1, name: 'João Silva', email: 'joao@email.com', role: 'Aluno', status: 'active' },
    { id: 2, name: 'Maria Santos', email: 'maria@email.com', role: 'Professor', status: 'active' },
    { id: 3, name: 'Pedro Costa', email: 'pedro@email.com', role: 'Aluno', status: 'inactive' },
  ];

  const tableColumns = [
    { key: 'name', label: 'Nome', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Função', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
  ];

  const quickActions = [
    {
      icon: Plus,
      label: 'Nova Atividade',
      variant: 'btn-primary',
      onClick: () => showSuccess('Nova atividade criada!'),
    },
    {
      icon: Users,
      label: 'Convidar Usuário',
      variant: 'btn-secondary',
      onClick: () => showInfo('Convite enviado!'),
    },
    {
      icon: Bell,
      label: 'Enviar Notificação',
      variant: 'btn-accent',
      onClick: () => showWarning('Notificação em fila'),
    },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardSection stats={stats} />;

      case 'analytics':
        return <AnalyticsSection />;

      case 'users':
        return <UsersSection data={tableData} columns={tableColumns} />;

      case 'content':
        return <ContentSection />;

      case 'settings':
        return <SettingsSection />;

      default:
        return <DashboardSection stats={stats} />;
    }
  };

  return (
    <NotificationProvider>
      <EnhancedLayout
        title="Demo Completo do Design System"
        subtitle="Demonstração de todos os componentes aprimorados"
        sidebarContent={
          <EnhancedSidebar
            items={sidebarItems}
            activeItem={activeSection}
            onItemClick={setActiveSection}
          />
        }
        headerActions={
          <div className="flex items-center gap-2">
            <AdvancedSearch
              placeholder="Buscar no sistema..."
              suggestions={[
                { title: 'Dashboard', subtitle: 'Página principal', icon: Home },
                { title: 'Usuários', subtitle: 'Gerenciar usuários', icon: Users },
                { title: 'Configurações', subtitle: 'Ajustes do sistema', icon: Settings },
              ]}
            />
            <NotificationToggle onClick={() => {}} />
          </div>
        }
      >
        <div className="space-y-8">
          {renderContent()}

          {/* Botão de ação rápida */}
          <QuickActionButton actions={quickActions} />
        </div>
      </EnhancedLayout>
    </NotificationProvider>
  );
};

/**
 * Seção do Dashboard
 */
const DashboardSection = ({ stats }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-8"
  >
    {/* Métricas principais */}
    <StatsGrid stats={stats} columns={4} />

    {/* Gráficos e análises */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <EnhancedCard title="Performance ao Longo do Tempo">
        <SimpleBarChart
          data={[
            { label: 'Seg', value: 85 },
            { label: 'Ter', value: 92 },
            { label: 'Qua', value: 88 },
            { label: 'Qui', value: 95 },
            { label: 'Sex', value: 90 },
          ]}
          height={200}
        />
      </EnhancedCard>

      <EnhancedCard title="Distribuição por Categoria">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Matemática</span>
            <span className="text-sm text-base-content/70">45%</span>
          </div>
          <ProgressRing progress={45} color="primary" />

          <div className="flex items-center justify-between">
            <span className="text-sm">Português</span>
            <span className="text-sm text-base-content/70">30%</span>
          </div>
          <ProgressRing progress={30} color="secondary" />

          <div className="flex items-center justify-between">
            <span className="text-sm">Ciências</span>
            <span className="text-sm text-base-content/70">25%</span>
          </div>
          <ProgressRing progress={25} color="accent" />
        </div>
      </EnhancedCard>
    </div>

    {/* Atividades recentes */}
    <EnhancedCard title="Atividades Recentes">
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 p-4 bg-base-200 rounded-lg">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium">Atividade {i}</h4>
              <p className="text-sm text-base-content/70">Descrição da atividade</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">95%</div>
              <div className="text-xs text-success">Concluída</div>
            </div>
          </div>
        ))}
      </div>
    </EnhancedCard>
  </motion.div>
);

/**
 * Seção de Analytics
 */
const AnalyticsSection = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-8"
  >
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <EnhancedCard className="lg:col-span-2">
        <h3 className="font-semibold mb-4">Gráfico de Performance</h3>
        <SimpleBarChart
          data={[
            { label: 'Jan', value: 75 },
            { label: 'Fev', value: 82 },
            { label: 'Mar', value: 78 },
            { label: 'Abr', value: 88 },
            { label: 'Mai', value: 92 },
            { label: 'Jun', value: 95 },
          ]}
          height={300}
        />
      </EnhancedCard>

      <EnhancedCard>
        <h3 className="font-semibold mb-4">Indicadores Chave</h3>
        <div className="space-y-6">
          <div className="text-center">
            <ProgressRing progress={87} size={100} showValue />
            <p className="text-sm mt-2">Taxa de Conclusão</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-success">↗ 12%</div>
              <div className="text-xs text-base-content/70">Crescimento</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">156</div>
              <div className="text-xs text-base-content/70">Atividades</div>
            </div>
          </div>
        </div>
      </EnhancedCard>
    </div>
  </motion.div>
);

/**
 * Seção de Usuários com tabela aprimorada
 */
const UsersSection = ({ data, columns }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState(new Set());

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Filtros e busca */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar usuários..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input input-bordered w-full"
          />
        </div>
        <EnhancedSelect
          placeholder="Filtrar por função"
          options={[
            { value: 'all', label: 'Todas' },
            { value: 'student', label: 'Alunos' },
            { value: 'teacher', label: 'Professores' },
          ]}
        />
      </div>

      {/* Tabela de usuários */}
      <EnhancedCard>
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                    checked={selectedRows.size === data.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRows(new Set(data.map(d => d.id)));
                      } else {
                        setSelectedRows(new Set());
                      }
                    }}
                  />
                </th>
                {columns.map((col) => (
                  <th key={col.key}>{col.label}</th>
                ))}
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {data
                .filter(user =>
                  user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  user.email.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((user) => (
                  <tr key={user.id}>
                    <td>
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary"
                        checked={selectedRows.has(user.id)}
                        onChange={(e) => {
                          const newSelected = new Set(selectedRows);
                          if (e.target.checked) {
                            newSelected.add(user.id);
                          } else {
                            newSelected.delete(user.id);
                          }
                          setSelectedRows(newSelected);
                        }}
                      />
                    </td>
                    <td className="font-medium">{user.name}</td>
                    <td className="text-base-content/70">{user.email}</td>
                    <td>
                      <span className={`badge ${user.role === 'Professor' ? 'badge-primary' : 'badge-secondary'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${user.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                        {user.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <button className="btn btn-ghost btn-xs">
                          <Eye className="h-3 w-3" />
                        </button>
                        <button className="btn btn-ghost btn-xs">
                          <Edit className="h-3 w-3" />
                        </button>
                        <button className="btn btn-ghost btn-xs text-error">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-base-content/70">
            {data.length} usuários encontrados
          </span>
          <AdvancedPagination
            currentPage={1}
            totalPages={3}
            onPageChange={(page) => console.log('Page changed:', page)}
          />
        </div>
      </EnhancedCard>
    </motion.div>
  );
};

/**
 * Seção de Conteúdo
 */
const ContentSection = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-8"
  >
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <EnhancedCard className="lg:col-span-2">
        <h3 className="font-semibold mb-4">Editor de Conteúdo</h3>
        <div className="space-y-4">
          <EnhancedInput
            label="Título"
            placeholder="Digite o título do conteúdo..."
            value=""
          />

          <EnhancedSelect
            label="Categoria"
            placeholder="Selecione uma categoria"
            options={[
              { value: 'math', label: 'Matemática' },
              { value: 'portuguese', label: 'Português' },
              { value: 'science', label: 'Ciências' },
            ]}
          />

          <EnhancedInput
            label="Tags"
            placeholder="Adicione tags separadas por vírgula"
            leftIcon={BookOpen}
          />

          <div className="flex gap-2">
            <EnhancedButton variant="primary">Salvar</EnhancedButton>
            <EnhancedButton variant="outline">Prévia</EnhancedButton>
            <EnhancedButton variant="ghost">Cancelar</EnhancedButton>
          </div>
        </div>
      </EnhancedCard>

      <EnhancedCard>
        <h3 className="font-semibold mb-4">Upload de Arquivos</h3>
        <div className="space-y-4">
          <EnhancedFileUpload
            accept=".pdf,.doc,.docx"
            multiple
            helperText="Formatos aceitos: PDF, DOC, DOCX"
          />

          <div className="space-y-2">
            <p className="text-sm font-medium">Arquivos enviados:</p>
            <div className="space-y-2">
              {['documento1.pdf', 'apresentacao.docx'].map((file, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-base-200 rounded">
                  <BookOpen className="h-4 w-4" />
                  <span className="text-sm flex-1">{file}</span>
                  <button className="btn btn-ghost btn-xs text-error">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </EnhancedCard>
    </div>
  </motion.div>
);

/**
 * Seção de Configurações
 */
const SettingsSection = () => {
  const { theme, setTheme } = useTheme();
  const { preferences, savePreferences } = useAccessibility();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Aparência */}
        <EnhancedCard title="Aparência">
          <div className="space-y-6">
            <div>
              <label className="form-label">Tema</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'light', label: 'Claro', icon: '☀️' },
                  { value: 'auto', label: 'Auto', icon: '🖥️' },
                  { value: 'dark', label: 'Escuro', icon: '🌙' },
                ].map((themeOption) => (
                  <button
                    key={themeOption.value}
                    onClick={() => setTheme(themeOption.value)}
                    className={`btn ${theme === themeOption.value ? 'btn-primary' : 'btn-outline'}`}
                  >
                    <span className="mr-2">{themeOption.icon}</span>
                    {themeOption.label}
                  </button>
                ))}
              </div>
            </div>

            <EnhancedCheckbox
              label="Texto ampliado"
              checked={preferences.largeText}
              onChange={(checked) => savePreferences({ largeText: checked })}
            />

            <EnhancedCheckbox
              label="Alto contraste"
              checked={preferences.highContrast}
              onChange={(checked) => savePreferences({ highContrast: checked })}
            />

            <EnhancedCheckbox
              label="Reduzir movimento"
              checked={preferences.reducedMotion}
              onChange={(checked) => savePreferences({ reducedMotion: checked })}
            />
          </div>
        </EnhancedCard>

        {/* Notificações */}
        <EnhancedCard title="Notificações">
          <div className="space-y-4">
            <EnhancedCheckbox label="Notificações push" />
            <EnhancedCheckbox label="Notificações por email" />
            <EnhancedCheckbox label="Lembretes de atividades" />
            <EnhancedCheckbox label="Atualizações do sistema" />

            <div className="pt-4 border-t border-base-200">
              <EnhancedButton variant="primary" className="w-full">
                Salvar Preferências
              </EnhancedButton>
            </div>
          </div>
        </EnhancedCard>
      </div>

      {/* Configurações avançadas */}
      <EnhancedCard title="Configurações Avançadas">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium">Segurança</h4>
            <EnhancedCheckbox label="Autenticação de dois fatores" />
            <EnhancedCheckbox label="Sessões ativas" />
            <EnhancedButton variant="outline" size="sm">
              Gerenciar Sessões
            </EnhancedButton>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Dados</h4>
            <EnhancedButton variant="outline" size="sm">
              Exportar Dados
            </EnhancedButton>
            <EnhancedButton variant="error" size="sm">
              Excluir Conta
            </EnhancedButton>
          </div>
        </div>
      </EnhancedCard>
    </motion.div>
  );
};

export default CompleteDesignDemo;
