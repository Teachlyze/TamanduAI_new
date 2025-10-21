import { motion, AnimatePresence } from 'framer-motion';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, Search, Filter, Calendar, User, Flag, MoreVertical, Trash2, Edit2, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { PremiumInput } from '@/components/ui/PremiumInput';
import { PremiumModal } from '@/components/ui/PremiumModal';
import toast from 'react-hot-toast';

const TasksKanbanPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [columns, setColumns] = useState([
    { id: 'todo', title: 'A Fazer', color: 'bg-blue-500' },
    { id: 'in_progress', title: 'Em Progresso', color: 'bg-yellow-500' },
    { id: 'review', title: 'Em Revisão', color: 'bg-purple-500' },
    { id: 'done', title: 'Concluído', color: 'bg-green-500' }
  ]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    if (user) {
      loadTasks();
      subscribeToTasks();
    }
  }, [user]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assigned_to:profiles!assigned_to(id, full_name, avatar_url),
          created_by:profiles!created_by(id, full_name)
        `)
        .or(`created_by.eq.${user.id},assigned_to.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
      toast.error('Erro ao carregar tarefas');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToTasks = () => {
    const channel = supabase
      .channel('tasks_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        loadTasks();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const taskId = active.id;
    const newStatus = over.id;

    if (columns.find(col => col.id === newStatus)) {
      try {
        const { error } = await supabase
          .from('tasks')
          .update({ 
            status: newStatus,
            completed_at: newStatus === 'done' ? new Date().toISOString() : null
          })
          .eq('id', taskId);

        if (error) throw error;

        setTasks(prev => prev.map(task => 
          task.id === taskId 
            ? { ...task, status: newStatus, completed_at: newStatus === 'done' ? new Date().toISOString() : null }
            : task
        ));

        toast.success('Status atualizado');
      } catch (error) {
        console.error('Erro:', error);
        toast.error('Erro ao atualizar status');
      }
    }

    setActiveId(null);
  };

  const createTask = async (taskData) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .insert([{
          ...taskData,
          created_by: user.id,
          status: 'todo'
        }]);

      if (error) throw error;
      toast.success('Tarefa criada');
      setShowCreateModal(false);
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao criar tarefa');
    }
  };

  const deleteTask = async (taskId) => {
    if (!confirm('Deseja excluir esta tarefa?')) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      toast.success('Tarefa excluída');
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao excluir tarefa');
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'text-red-600 bg-red-100 dark:bg-red-900/30',
      medium: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30',
      low: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30'
    };
    return colors[priority] || colors.medium;
  };

  const getPriorityLabel = (priority) => {
    const labels = { high: 'Alta', medium: 'Média', low: 'Baixa' };
    return labels[priority] || 'Média';
  };

  const TaskCard = ({ task, isDragging = false }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`p-4 bg-card border border-border rounded-lg cursor-move hover:shadow-md transition-all ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium line-clamp-2 flex-1">{task.title}</h4>
          <div className="relative group">
            <button className="p-1 rounded hover:bg-muted">
              <MoreVertical className="w-4 h-4" />
            </button>
            <div className="absolute right-0 mt-1 w-32 bg-card border border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={() => setEditingTask(task)}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted text-sm"
              >
                <Edit2 className="w-3 h-3" /> Editar
              </button>
              <button
                onClick={() => deleteTask(task.id)}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-destructive/10 text-destructive text-sm"
              >
                <Trash2 className="w-3 h-3" /> Excluir
              </button>
            </div>
          </div>
        </div>

        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
            <Flag className="w-3 h-3 inline mr-1" />
            {getPriorityLabel(task.priority)}
          </span>

          {task.due_date && (
            <span className="px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground">
              <Calendar className="w-3 h-3 inline mr-1" />
              {new Date(task.due_date).toLocaleDateString('pt-BR')}
            </span>
          )}
        </div>

        {task.assigned_to && (
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
              {task.assigned_to.full_name?.charAt(0) || 'U'}
            </div>
            <span className="text-xs text-muted-foreground">
              {task.assigned_to.full_name || 'Sem atribuição'}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Quadro de Tarefas</h1>
          <p className="text-muted-foreground">Gerencie suas tarefas visualmente</p>
        </div>
        <div className="flex items-center gap-3">
          <PremiumInput
            placeholder="Buscar tarefas..."
            leftIcon={Search}
            className="w-64"
          />
          <PremiumButton
            variant="gradient"
            leftIcon={Plus}
            onClick={() => setShowCreateModal(true)}
          >
            Nova Tarefa
          </PremiumButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {columns.map(column => {
          const columnTasks = tasks.filter(t => t.status === column.id);
          return (
            <PremiumCard key={column.id} variant="elevated" className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-12 rounded-full ${column.color}`} />
                <div>
                  <p className="text-sm text-muted-foreground">{column.title}</p>
                  <p className="text-2xl font-bold">{columnTasks.length}</p>
                </div>
              </div>
            </PremiumCard>
          );
        })}
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map(column => {
            const columnTasks = tasks.filter(t => t.status === column.id);
            
            return (
              <div key={column.id} className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${column.color}`} />
                  <h3 className="font-bold">{column.title}</h3>
                  <span className="text-xs text-muted-foreground">
                    ({columnTasks.length})
                  </span>
                </div>

                <SortableContext items={[column.id]} strategy={verticalListSortingStrategy}>
                  <div
                    id={column.id}
                    className="min-h-[400px] p-3 bg-muted/30 rounded-lg space-y-3"
                  >
                    <AnimatePresence>
                      {columnTasks.map(task => (
                        <div key={task.id} draggable onDragStart={() => setActiveId(task.id)}>
                          <TaskCard task={task} isDragging={activeId === task.id} />
                        </div>
                      ))}
                    </AnimatePresence>

                    {columnTasks.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        Nenhuma tarefa
                      </div>
                    )}
                  </div>
                </SortableContext>
              </div>
            );
          })}
        </div>

        <DragOverlay>
          {activeId ? (
            <TaskCard task={tasks.find(t => t.id === activeId)} isDragging />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Create Task Modal */}
      <TaskFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={createTask}
      />

      {editingTask && (
        <TaskFormModal
          isOpen={!!editingTask}
          onClose={() => setEditingTask(null)}
          task={editingTask}
          onSave={(data) => {
            // Update task logic here
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
};

const TaskFormModal = ({ isOpen, onClose, onSave, task = null }) => {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'medium',
    due_date: task?.due_date || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? 'Editar Tarefa' : 'Nova Tarefa'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Título *</label>
          <PremiumInput
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Nome da tarefa"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Descrição</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            placeholder="Descreva a tarefa..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Prioridade</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Prazo</label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <PremiumButton type="button" variant="outline" onClick={onClose} className="bg-white dark:bg-slate-900 text-foreground border-border flex-1">
            Cancelar
          </PremiumButton>
          <PremiumButton type="submit" variant="gradient" className="flex-1">
            {task ? 'Salvar' : 'Criar'}
          </PremiumButton>
        </div>
      </form>
    </PremiumModal>
  );
};

export default TasksKanbanPage;
