import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Heart,
  Trash2,
  CornerDownRight,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ClassFeedService from '@/services/classFeedService';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

const PostComments = ({ postId, commentsCount, onUpdate }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const data = await ClassFeedService.getComments(postId);
      setComments(data);
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
      toast.error('Erro ao carregar comentários');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      await ClassFeedService.addComment(
        postId,
        newComment.trim(),
        replyTo
      );
      
      setNewComment('');
      setReplyTo(null);
      await loadComments();
      if (onUpdate) onUpdate();
      toast.success('Comentário adicionado');
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      toast.error('Erro ao adicionar comentário');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Tem certeza que deseja excluir este comentário?')) return;

    try {
      await ClassFeedService.deleteComment(commentId);
      await loadComments();
      if (onUpdate) onUpdate();
      toast.success('Comentário excluído');
    } catch (error) {
      console.error('Erro ao excluir comentário:', error);
      toast.error('Erro ao excluir comentário');
    }
  };

  const handleLike = async (commentId) => {
    try {
      await ClassFeedService.toggleCommentLike(commentId);
      await loadComments();
    } catch (error) {
      console.error('Erro ao curtir comentário:', error);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: ptBR,
    });
  };

  const renderComment = (comment, isReply = false) => {
    const isAuthor = comment.author_id === user?.id;

    return (
      <motion.div
        key={comment.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`${isReply ? 'ml-12' : ''}`}
      >
        <div className="flex gap-3 py-3">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {comment.author?.full_name?.charAt(0) || 'U'}
          </div>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm">
                {comment.author?.full_name || 'Usuário'}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDate(comment.created_at)}
              </span>
              {isAuthor && (
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  Você
                </span>
              )}
            </div>

            {/* Content */}
            <p className="text-sm mb-2 whitespace-pre-wrap">{comment.content}</p>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleLike(comment.id)}
                className="whitespace-nowrap inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500 transition-colors"
              >
                <Heart className="w-3.5 h-3.5" />
                {comment.likes_count > 0 && (
                  <span className="font-medium">{comment.likes_count}</span>
                )}
              </button>

              {!isReply && (
                <button
                  onClick={() => setReplyTo(comment.id)}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Responder
                </button>
              )}

              {isAuthor && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                >
                  Excluir
                </button>
              )}
            </div>

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-2 space-y-2">
                {comment.replies.map(reply => renderComment(reply, true))}
              </div>
            )}
          </div>
        </div>

        {/* Reply Form */}
        {replyTo === comment.id && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="ml-11 mb-3"
          >
            <form onSubmit={handleSubmit} className="flex items-start gap-2">
              <CornerDownRight className="w-4 h-4 text-muted-foreground mt-2.5" />
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Digite sua resposta..."
                autoFocus
                className="flex-1 px-3 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="whitespace-nowrap inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setReplyTo(null);
                  setNewComment('');
                }}
                className="px-3 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
              >
                Cancelar
              </button>
            </form>
          </motion.div>
        )}
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex items-start gap-3">
          {/* User Avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>

          {/* Input */}
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Escreva um comentário..."
              disabled={submitting}
              className="flex-1 px-4 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="whitespace-nowrap inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Enviar</span>
            </button>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-1">
        <AnimatePresence>
          {comments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-muted-foreground"
            >
              Nenhum comentário ainda. Seja o primeiro!
            </motion.div>
          ) : (
            comments.map(comment => renderComment(comment))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PostComments;
