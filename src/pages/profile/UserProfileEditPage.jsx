import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Save,
  Upload,
  Camera,
  ArrowLeft,
  Shield,
  Bell,
  Palette
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { PremiumInput } from '@/components/ui/PremiumInput';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import toast from 'react-hot-toast';

const UserProfileEditPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('teacher');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    bio: '',
    institution: '',
    subjects: [],
    preferences: {
      notifications: true,
      emailDigest: true,
      darkMode: false
    }
  });
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    if (user) {
      // Detectar role
      const role = user?.user_metadata?.role || 'teacher';
      setUserRole(role);
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          full_name: data.full_name || '',
          email: data.email || user.email || '',
          phone: data.phone || '',
          bio: data.bio || '',
          institution: data.institution || '',
          subjects: data.subjects || [],
          preferences: data.preferences || {
            notifications: true,
            emailDigest: true,
            darkMode: false
          }
        });
        setAvatarUrl(data.avatar_url || '');
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      toast.error('Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      setAvatarUrl(urlData.publicUrl);
      toast.success('Avatar atualizado!');
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao fazer upload do avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          bio: formData.bio,
          institution: formData.institution,
          subjects: formData.subjects,
          preferences: formData.preferences,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Perfil atualizado com sucesso!');
      const baseRoute = userRole === 'student' ? '/students' : userRole === 'school' ? '/school' : '/dashboard';
      navigate(`${baseRoute}/settings`);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar perfil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Carregando perfil..." />;
  }

  const getBaseRoute = () => {
    switch(userRole) {
      case 'student': return '/students';
      case 'school': return '/school';
      default: return '/dashboard';
    }
  };

  const baseRoute = getBaseRoute();
  const breadcrumbItems = [
    { label: 'Dashboard', path: baseRoute },
    { label: 'Configurações', path: `${baseRoute}/settings` },
    { label: 'Editar Perfil', path: '/profile/edit' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
    <div className="space-y-6 max-w-4xl mx-auto">
      <Breadcrumb items={breadcrumbItems} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Editar Perfil</h1>
          <p className="text-muted-foreground">Atualize suas informações pessoais</p>
        </div>
        <PremiumButton
          variant="outline"
          leftIcon={ArrowLeft}
          onClick={() => navigate(`${getBaseRoute()}/settings`)}
        >
          Cancelar
        </PremiumButton>
      </div>

      {/* Avatar */}
      <PremiumCard variant="elevated" className="p-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-4xl font-bold text-white overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                formData.full_name?.charAt(0) || user.email?.charAt(0) || 'U'
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-2 bg-primary rounded-full cursor-pointer hover:bg-primary/90 transition-colors">
              <Camera className="w-4 h-4 text-slate-900 dark:text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-1">Foto de Perfil</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Recomendamos uma imagem quadrada de pelo menos 200x200px
            </p>
            <label>
              <PremiumButton
                variant="outline"
                size="sm"
                leftIcon={Upload}
                disabled={uploading}
                as="span"
              >
                {uploading ? 'Enviando...' : 'Fazer Upload'}
              </PremiumButton>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
        </div>
      </PremiumCard>

      {/* Informações Pessoais */}
      <PremiumCard variant="elevated" className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-bold">Informações Pessoais</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Nome Completo</label>
            <PremiumInput
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Seu nome completo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">E-mail</label>
            <PremiumInput
              type="email"
              value={formData.email}
              disabled
              leftIcon={Mail}
              placeholder="seu@email.com"
            />
            <p className="text-xs text-muted-foreground mt-1">
              E-mail não pode ser alterado
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Telefone</label>
            <PremiumInput
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              leftIcon={Phone}
              placeholder="(00) 00000-0000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Instituição</label>
            <PremiumInput
              value={formData.institution}
              onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
              leftIcon={MapPin}
              placeholder="Nome da instituição"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Biografia</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Conte um pouco sobre você..."
            />
          </div>
        </div>
      </PremiumCard>

      {/* Preferências */}
      <PremiumCard variant="elevated" className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-bold">Preferências</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <p className="font-medium">Notificações Push</p>
              <p className="text-sm text-muted-foreground">Receba alertas em tempo real</p>
            </div>
            <button
              onClick={() => setFormData({
                ...formData,
                preferences: { ...formData.preferences, notifications: !formData.preferences.notifications }
              })}
              className={`w-12 h-6 rounded-full transition-colors ${
                formData.preferences.notifications ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                formData.preferences.notifications ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <p className="font-medium">Resumo Diário por E-mail</p>
              <p className="text-sm text-muted-foreground">Receba um resumo das atividades do dia</p>
            </div>
            <button
              onClick={() => setFormData({
                ...formData,
                preferences: { ...formData.preferences, emailDigest: !formData.preferences.emailDigest }
              })}
              className={`w-12 h-6 rounded-full transition-colors ${
                formData.preferences.emailDigest ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                formData.preferences.emailDigest ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        </div>
      </PremiumCard>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <PremiumButton
          variant="outline"
          onClick={() => navigate(`${getBaseRoute()}/settings`)}
        >
          Cancelar
        </PremiumButton>
        <PremiumButton
          variant="gradient"
          leftIcon={Save}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </PremiumButton>
      </div>
    </div>
    </div>
  );
};

export default UserProfileEditPage;
