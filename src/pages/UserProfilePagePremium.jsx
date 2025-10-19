import React, { useState, useEffect } from 'react';
import {
  PremiumCard,
  StatsCard,
  PremiumButton,
  PremiumInput,
  LoadingScreen,
  toast,
  ProgressBar
} from '@/components/ui';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Save,
  Camera,
  Award,
  BookOpen,
  Users,
  TrendingUp,
  Edit2,
  Lock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function UserProfilePagePremium() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    school: '',
    subjects: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      // API call ou usar dados do contexto
      const mockProfile = {
        name: user?.name || 'Professor Silva',
        email: user?.email || 'professor@escola.com',
        phone: '(11) 98765-4321',
        location: 'São Paulo, SP',
        bio: 'Professor de Matemática com 10 anos de experiência',
        school: 'Escola Estadual Dom Pedro II',
        subjects: 'Matemática, Física',
        avatar: null,
        role: user?.role || 'Professor',
        joinDate: '2023-01-15',
        totalClasses: 5,
        totalStudents: 142,
        totalActivities: 87,
        avgGrade: 8.3
      };
      setFormData(mockProfile);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await toast.promise(
        new Promise(resolve => setTimeout(resolve, 1000)),
        {
          loading: 'Salvando perfil...',
          success: 'Perfil atualizado com sucesso!',
          error: 'Erro ao atualizar perfil'
        }
      );
      setEditing(false);
      loadProfile();
    } catch (error) {
      toast.error('Erro ao salvar perfil', 'Erro');
    }
  };

  const handleChangePassword = () => {
    toast.info('Funcionalidade em desenvolvimento', 'Info');
  };

  if (loading) {
    return <LoadingScreen message="Carregando perfil..." />;
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 rounded-2xl text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <User className="w-8 h-8" />
            Meu Perfil
          </h1>
          <p className="text-white/90">Gerencie suas informações pessoais e preferências</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stagger-children grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Turmas"
          value={formData.totalClasses?.toString() || '0'}
          icon={Users}
        />
        <StatsCard
          title="Alunos"
          value={formData.totalStudents?.toString() || '0'}
          icon={User}
        />
        <StatsCard
          title="Atividades"
          value={formData.totalActivities?.toString() || '0'}
          icon={BookOpen}
        />
        <StatsCard
          title="Nota Média"
          value={formData.avgGrade?.toFixed(1) || '0.0'}
          icon={Award}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <PremiumCard variant="elevated">
            <div className="p-6 text-center">
              {/* Avatar */}
              <div className="relative inline-block mb-4">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                  {formData.name.charAt(0)}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <h2 className="text-2xl font-bold mb-1">{formData.name}</h2>
              <p className="text-muted-foreground mb-4">{formData.role}</p>

              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{formData.email}</span>
                </div>
                {formData.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{formData.phone}</span>
                  </div>
                )}
                {formData.location && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{formData.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Membro desde {new Date(formData.joinDate).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <PremiumButton
                  variant="outline"
                  className="w-full"
                  leftIcon={Lock}
                  onClick={handleChangePassword}
                >
                  Alterar Senha
                </PremiumButton>
              </div>
            </div>
          </PremiumCard>
        </div>

        {/* Info Card */}
        <div className="lg:col-span-2">
          <PremiumCard variant="elevated">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Informações Pessoais</h3>
                {!editing ? (
                  <PremiumButton
                    variant="outline"
                    size="sm"
                    leftIcon={Edit2}
                    onClick={() => setEditing(true)}
                  >
                    Editar
                  </PremiumButton>
                ) : (
                  <div className="flex gap-2">
                    <PremiumButton
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditing(false);
                        loadProfile();
                      }}
                    >
                      Cancelar
                    </PremiumButton>
                    <PremiumButton
                      variant="gradient"
                      size="sm"
                      leftIcon={Save}
                      onClick={handleSave}
                    >
                      Salvar
                    </PremiumButton>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <PremiumInput
                    label="Nome Completo"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    readOnly={!editing}
                    leftIcon={User}
                  />
                  <PremiumInput
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    readOnly={!editing}
                    leftIcon={Mail}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <PremiumInput
                    label="Telefone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    readOnly={!editing}
                    leftIcon={Phone}
                  />
                  <PremiumInput
                    label="Localização"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    readOnly={!editing}
                    leftIcon={MapPin}
                  />
                </div>

                <PremiumInput
                  label="Escola"
                  value={formData.school}
                  onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                  readOnly={!editing}
                />

                <PremiumInput
                  label="Disciplinas"
                  value={formData.subjects}
                  onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
                  readOnly={!editing}
                  placeholder="Ex: Matemática, Física"
                />

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Bio
                  </label>
                  <textarea
                    className={`w-full px-4 py-2 rounded-lg border text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-colors ${
                      editing
                        ? 'border-input bg-background hover:border-ring/50'
                        : 'border-border bg-background cursor-default'
                    }`}
                    rows={4}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    readOnly={!editing}
                    placeholder="Conte um pouco sobre você..."
                  />
                </div>
              </div>
            </div>
          </PremiumCard>

          {/* Activity Summary */}
          <PremiumCard variant="elevated" className="mt-6">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-6">Resumo de Atividades</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Perfil Completo</span>
                    <span className="font-medium">85%</span>
                  </div>
                  <ProgressBar value={85} variant="success" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Atividades Entregues</span>
                    <span className="font-medium">92%</span>
                  </div>
                  <ProgressBar value={92} variant="primary" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Engajamento dos Alunos</span>
                    <span className="font-medium">78%</span>
                  </div>
                  <ProgressBar value={78} variant="warning" />
                </div>
              </div>
            </div>
          </PremiumCard>
        </div>
      </div>
    </div>
  );
}
