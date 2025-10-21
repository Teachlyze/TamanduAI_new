import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Heart,
  Eye,
  Pin,
  MoreVertical,
  Plus,
  Filter,
  ArrowLeft,
  Paperclip,
  Send,
  Trash2,
  Edit2,
  MessageCircle,
  Link as LinkIcon,
  FileText,
  BookOpen,
  HelpCircle,
  Megaphone,
  Calendar,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import ClassFeedService from '@/services/classFeedService';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import toast from 'react-hot-toast';
import CreatePostModal from '@/components/classes/CreatePostModal';
import PostCard from '@/components/classes/PostCard';

const ClassFeedPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [isTeacher, setIsTeacher] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterType, setFilterType] = useState('all');

  const postTypes = [
    { value: 'all', label: 'Todos', icon: Filter },
    { value: 'announcement', label: 'Anúncios', icon: Megaphone },
    { value: 'activity', label: 'Atividades', icon: FileText },
    { value: 'material', label: 'Materiais', icon: BookOpen },
    { value: 'link', label: 'Links', icon: LinkIcon },
    { value: 'question', label: 'Perguntas', icon: HelpCircle },
  ];

  useEffect(() => {
    if (classId && user) {
      loadClassData();
      loadPosts();
    }
  }, [classId, user]);

  useEffect(() => {
    // Filtrar posts quando tipo mudar
    if (filterType === 'all') {
      setFilteredPosts(posts);
    } else {
      setFilteredPosts(posts.filter(p => p.type === filterType));
    }
  }, [filterType, posts]);

  const loadClassData = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('id', classId)
        .single();

      if (error) throw error;

      setClassData(data);
      setIsTeacher(data.created_by === user.id);
    } catch (error) {
      console.error('Erro ao carregar turma:', error);
      toast.error('Erro ao carregar dados da turma');
    }
  };

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await ClassFeedService.getPosts(classId, { pinnedFirst: true });
      setPosts(data);
      setFilteredPosts(data);
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
      toast.error('Erro ao carregar mural');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (postData) => {
    try {
      const newPost = await ClassFeedService.createPost(classId, postData);
      setPosts([newPost, ...posts]);
      setShowCreateModal(false);
      toast.success('Post criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar post:', error);
      toast.error('Erro ao criar post');
    }
  };

  const handleToggleLike = async (postId) => {
    try {
      const isLiked = await ClassFeedService.toggleLike(postId);
      
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            likes_count: isLiked ? post.likes_count + 1 : post.likes_count - 1,
            isLikedByUser: isLiked,
          };
        }
        return post;
      }));
    } catch (error) {
      console.error('Erro ao curtir:', error);
      toast.error('Erro ao curtir post');
    }
  };

  const handleTogglePin = async (postId, isPinned) => {
    try {
      await ClassFeedService.togglePin(postId, !isPinned);
      await loadPosts(); // Recarregar para manter ordem
      toast.success(isPinned ? 'Post desafixado' : 'Post fixado no topo');
    } catch (error) {
      console.error('Erro ao fixar:', error);
      toast.error('Erro ao fixar post');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Tem certeza que deseja excluir este post?')) return;

    try {
      await ClassFeedService.deletePost(postId);
      setPosts(posts.filter(p => p.id !== postId));
      toast.success('Post excluído');
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast.error('Erro ao excluir post');
    }
  };

  const handleToggleComments = async (postId, commentsEnabled) => {
    try {
      await ClassFeedService.toggleComments(postId, !commentsEnabled);
      setPosts(posts.map(post => 
        post.id === postId ? { ...post, comments_enabled: !commentsEnabled } : post
      ));
      toast.success(commentsEnabled ? 'Comentários desabilitados' : 'Comentários habilitados');
    } catch (error) {
      console.error('Erro ao alterar comentários:', error);
      toast.error('Erro ao alterar comentários');
    }
  };

  if (loading) {
    return <LoadingScreen message="Carregando mural..." />;
  }

  if (!classData) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="Turma não encontrada"
        description="Não foi possível carregar o mural da turma"
        actionLabel="Voltar"
        onAction={() => navigate('/dashboard/classes')}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-8 text-white"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="relative z-10">
          <button
            onClick={() => navigate(`/dashboard/classes/${classId}`)}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Turma
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">📰 Mural</h1>
              <p className="text-white/90 text-lg">{classData.name}</p>
            </div>

            {isTeacher && (
              <PremiumButton
                variant="outline"
                leftIcon={Plus}
                onClick={() => setShowCreateModal(true)}
                className="whitespace-nowrap inline-flex items-center gap-2 bg-white/10 border-white/20 hover:bg-white/20 text-white"
              >
                <span>Nova Postagem</span>
              </PremiumButton>
            )}
          </div>
        </div>
      </motion.div>

      {/* Filtros */}
      <PremiumCard variant="elevated">
        <div className="p-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            {postTypes.map((type) => {
              const Icon = type.icon;
              const isActive = filterType === type.value;
              
              return (
                <button
                  key={type.value}
                  onClick={() => setFilterType(type.value)}
                  className={`whitespace-nowrap inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-primary text-white shadow-lg'
                      : 'bg-white dark:bg-slate-900 text-foreground border border-border hover:bg-muted'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{type.label}</span>
                  {type.value === 'all' && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-white/20">
                      {posts.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </PremiumCard>

      {/* Feed de Posts */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredPosts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <EmptyState
                icon={MessageSquare}
                title={filterType === 'all' ? 'Nenhuma postagem ainda' : 'Nenhum post deste tipo'}
                description={
                  isTeacher
                    ? 'Crie a primeira postagem para seus alunos!'
                    : 'Aguarde seu professor publicar algo.'
                }
                actionLabel={isTeacher ? 'Criar Postagem' : null}
                onAction={isTeacher ? () => setShowCreateModal(true) : null}
              />
            </motion.div>
          ) : (
            filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <PostCard
                  post={post}
                  isTeacher={isTeacher}
                  onLike={() => handleToggleLike(post.id)}
                  onPin={() => handleTogglePin(post.id, post.is_pinned)}
                  onDelete={() => handleDeletePost(post.id)}
                  onToggleComments={() => handleToggleComments(post.id, post.comments_enabled)}
                  onRefresh={loadPosts}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Modal de Criação */}
      {showCreateModal && (
        <CreatePostModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreatePost}
        />
      )}
    </div>
  );
};

export default ClassFeedPage;
