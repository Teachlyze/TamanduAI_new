import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  FileText,
  Link as LinkIcon,
  Image as ImageIcon,
  Video,
  Send,
  Heart,
  MessageCircle,
  MoreVertical,
  Pin,
  Trash2
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { PremiumCard } from '@/components/ui/PremiumCard';
import toast from 'react-hot-toast';

const ClassFeedTab = ({ classId, classData }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [postType, setPostType] = useState('announcement'); // announcement, activity, material, link
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPosts();
    
    // Real-time subscription
    const channel = supabase
      .channel(`class_feed_${classId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'class_posts', filter: `class_id=eq.${classId}` },
        () => loadPosts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [classId]);

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('class_posts')
        .select(`
          *,
          author:profiles(id, full_name, avatar_url),
          comments:post_comments(count),
          likes:post_likes(count)
        `)
        .eq('class_id', classId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  };

  const createPost = async () => {
    if (!newPost.trim()) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('class_posts')
        .insert({
          class_id: classId,
          author_id: user.id,
          content: newPost,
          type: postType
        });

      if (error) throw error;
      
      setNewPost('');
      toast.success('Post publicado!');
      loadPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Erro ao publicar post');
    } finally {
      setLoading(false);
    }
  };

  const postTypes = [
    { id: 'announcement', label: 'Anúncio', icon: MessageSquare, color: 'blue' },
    { id: 'activity', label: 'Atividade', icon: FileText, color: 'purple' },
    { id: 'material', label: 'Material', icon: LinkIcon, color: 'emerald' },
    { id: 'question', label: 'Pergunta', icon: MessageCircle, color: 'orange' }
  ];

  return (
    <div className="space-y-6">
      {/* Create Post Card */}
      <PremiumCard>
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg">
              {user?.user_metadata?.name?.[0]?.toUpperCase() || 'P'}
            </div>

            <div className="flex-1 space-y-4">
              {/* Post Type Selector */}
              <div className="flex items-center gap-2 flex-wrap">
                {postTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setPostType(type.id)}
                    className={`whitespace-nowrap inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      postType === type.id
                        ? `bg-${type.color}-100 dark:bg-${type.color}-900/30 text-${type.color}-700 dark:text-${type.color}-400 border-2 border-${type.color}-500`
                        : 'bg-slate-100 dark:bg-slate-800 text-muted-foreground border-2 border-transparent hover:border-slate-300'
                    }`}
                  >
                    <type.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                ))}
              </div>

              {/* Text Input */}
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Compartilhe algo com a turma..."
                className="w-full min-h-[120px] p-4 bg-slate-50 dark:bg-slate-900 border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <ImageIcon className="w-5 h-5 text-muted-foreground" />
                  </button>
                  <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <Video className="w-5 h-5 text-muted-foreground" />
                  </button>
                  <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <LinkIcon className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>

                <PremiumButton
                  onClick={createPost}
                  disabled={!newPost.trim() || loading}
                  className="whitespace-nowrap inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'Publicando...' : 'Publicar'}</span>
                </PremiumButton>
              </div>
            </div>
          </div>
        </div>
      </PremiumCard>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <PremiumCard>
            <div className="p-12 text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Nenhum post ainda</h3>
              <p className="text-muted-foreground">
                Seja o primeiro a postar algo nesta turma!
              </p>
            </div>
          </PremiumCard>
        ) : (
          posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <PremiumCard>
                <div className="p-6">
                  {/* Post Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold">
                        {post.author?.full_name?.[0]?.toUpperCase() || 'P'}
                      </div>
                      <div>
                        <p className="font-semibold">{post.author?.full_name || 'Professor'}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(post.created_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {post.is_pinned && (
                        <div className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-xs font-medium flex items-center gap-1">
                          <Pin className="w-3 h-3" />
                          <span>Fixado</span>
                        </div>
                      )}
                      <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="mb-4">
                    <p className="text-foreground whitespace-pre-wrap">{post.content}</p>
                  </div>

                  {/* Post Actions */}
                  <div className="flex items-center gap-6 pt-4 border-t border-border">
                    <button className="flex items-center gap-2 text-muted-foreground hover:text-red-500 transition-colors">
                      <Heart className="w-5 h-5" />
                      <span className="text-sm font-medium">{post.likes?.[0]?.count || 0}</span>
                    </button>
                    <button className="flex items-center gap-2 text-muted-foreground hover:text-blue-500 transition-colors">
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">{post.comments?.[0]?.count || 0}</span>
                    </button>
                  </div>
                </div>
              </PremiumCard>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default ClassFeedTab;
