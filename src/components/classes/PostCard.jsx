import { motion } from 'framer-motion';
import {
  Heart,
  MessageCircle,
  Eye,
  Pin,
  MoreVertical,
  Trash2,
  Edit2,
  MessageCircleOff,
  Link as LinkIcon,
  Calendar,
  Megaphone,
  FileText,
  BookOpen,
  HelpCircle,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PremiumCard } from '@/components/ui/PremiumCard';
import PostComments from './PostComments';

const PostCard = ({ post, isTeacher, onLike, onPin, onDelete, onToggleComments, onRefresh }) => {
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const getTypeConfig = (type) => {
    const configs = {
      announcement: { icon: Megaphone, label: 'Anúncio', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
      activity: { icon: FileText, label: 'Atividade', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
      material: { icon: BookOpen, label: 'Material', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
      link: { icon: LinkIcon, label: 'Link', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
      question: { icon: HelpCircle, label: 'Pergunta', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    };
    return configs[type] || configs.announcement;
  };

  const typeConfig = getTypeConfig(post.type);
  const TypeIcon = typeConfig.icon;

  const formatDate = (date) => {
    if (!date) return '';
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: ptBR,
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <PremiumCard variant="elevated" className="relative">
        {/* Pin Badge */}
        {post.is_pinned && (
          <div className="absolute top-4 right-4 z-10">
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary text-white text-xs font-medium shadow-lg">
              <Pin className="w-3 h-3" />
              <span>Fixado</span>
            </div>
          </div>
        )}

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3 flex-1">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                {post.author?.full_name?.charAt(0) || 'P'}
              </div>

              {/* Author Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold">{post.author?.full_name || 'Professor'}</h3>
                  <div className={`whitespace-nowrap inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${typeConfig.bg} ${typeConfig.color}`}>
                    <TypeIcon className="w-3 h-3" />
                    <span>{typeConfig.label}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatDate(post.published_at || post.created_at)}
                </p>
              </div>
            </div>

            {/* Menu (apenas professor) */}
            {isTeacher && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>

                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-border z-20 overflow-hidden">
                      <button
                        onClick={() => {
                          onPin();
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted transition-colors"
                      >
                        <Pin className="w-4 h-4" />
                        <span>{post.is_pinned ? 'Desafixar' : 'Fixar no topo'}</span>
                      </button>
                      <button
                        onClick={() => {
                          onToggleComments();
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted transition-colors"
                      >
                        <MessageCircleOff className="w-4 h-4" />
                        <span>{post.comments_enabled ? 'Desabilitar' : 'Habilitar'} comentários</span>
                      </button>
                      <div className="border-t border-border" />
                      <button
                        onClick={() => {
                          onDelete();
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-destructive/10 text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Excluir</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Title */}
          {post.title && (
            <h2 className="text-xl font-bold mb-3">{post.title}</h2>
          )}

          {/* Content */}
          <div className="prose prose-sm dark:prose-invert max-w-none mb-4">
            <p className="whitespace-pre-wrap">{post.content}</p>
          </div>

          {/* Attachments */}
          {post.attachments && post.attachments.length > 0 && (
            <div className="space-y-2 mb-4">
              {post.attachments.map((attachment, index) => (
                <a
                  key={index}
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <LinkIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-primary hover:underline truncate">
                    {attachment.name || attachment.url}
                  </span>
                </a>
              ))}
            </div>
          )}

          {/* Scheduled Info */}
          {post.scheduled_for && !post.published_at && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20 text-warning mb-4">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">
                Agendado para {new Date(post.scheduled_for).toLocaleString('pt-BR')}
              </span>
            </div>
          )}

          {/* Actions Bar */}
          <div className="flex items-center gap-6 pt-4 border-t border-border">
            {/* Like */}
            <button
              onClick={onLike}
              className="whitespace-nowrap inline-flex items-center gap-2 text-sm hover:text-primary transition-colors"
            >
              <Heart className={`w-5 h-5 ${post.isLikedByUser ? 'fill-red-500 text-red-500' : ''}`} />
              <span className="font-medium">{post.likes_count || 0}</span>
            </button>

            {/* Comments */}
            {post.comments_enabled && (
              <button
                onClick={() => setShowComments(!showComments)}
                className="whitespace-nowrap inline-flex items-center gap-2 text-sm hover:text-primary transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="font-medium">{post.comments_count || 0}</span>
              </button>
            )}

            {/* Views */}
            <div className="whitespace-nowrap inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Eye className="w-5 h-5" />
              <span className="font-medium">{post.views_count || 0}</span>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && post.comments_enabled && (
          <div className="border-t border-border">
            <PostComments
              postId={post.id}
              commentsCount={post.comments_count}
              onUpdate={onRefresh}
            />
          </div>
        )}
      </PremiumCard>
    </motion.div>
  );
};

export default PostCard;
