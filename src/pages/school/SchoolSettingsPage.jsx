import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Building2,
  Globe,
  Mail,
  Phone,
  MapPin,
  Save,
  Upload,
  Bell,
  Shield,
  Palette
} from 'lucide-react';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabaseClient';
import schoolService from '@/services/schoolService';
import { useAuth } from '@/hooks/useAuth';

const SchoolSettingsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [school, setSchool] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipcode: '',
    website: '',
    description: ''
  });

  useEffect(() => {
    if (user) {
      loadSchoolData();
    }
  }, [user]);

  const loadSchoolData = async () => {
    try {
      setLoading(true);
      const schoolData = await schoolService.getUserSchool(user.id);
      
      if (schoolData) {
        setSchool(schoolData);
        setFormData({
          name: schoolData.name || '',
          email: schoolData.email || '',
          phone: schoolData.phone || '',
          address: schoolData.address || '',
          city: schoolData.city || '',
          state: schoolData.state || '',
          zipcode: schoolData.zipcode || '',
          website: schoolData.website || '',
          description: schoolData.description || ''
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados da escola:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      if (!school?.id) {
        throw new Error('Escola não encontrada');
      }

      const { error } = await supabase
        .from('schools')
        .update({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipcode: formData.zipcode,
          website: formData.website,
          description: formData.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', school.id);

      if (error) throw error;

      toast.success('Configurações salvas com sucesso!');
      loadSchoolData();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Carregando configurações..." />;
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header Animado */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 p-8 text-white"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }} />
        </div>
        
        <div className="relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4"
          >
            <Settings className="w-4 h-4" />
            <span className="text-sm font-medium">Configurações</span>
          </motion.div>
          <h1 className="text-4xl font-bold mb-2">Configurações da Escola ⚙️</h1>
          <p className="text-white/90 text-lg">Gerencie as informações e preferências da instituição</p>
        </div>

        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-10 right-20 text-6xl opacity-20"
        >
          ⚙️
        </motion.div>
      </motion.div>

      {/* Informações Básicas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <PremiumCard variant="elevated">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Building2 className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Informações Básicas</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Escola *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nome completo da instituição"
                  className="bg-white dark:bg-slate-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Institucional *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700 dark:text-slate-300" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="contato@escola.com"
                    className="pl-10 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700 dark:text-slate-300" />
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(00) 0000-0000"
                    className="pl-10 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700 dark:text-slate-300" />
                  <Input
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://www.escola.com"
                    className="pl-10 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Breve descrição da instituição..."
                  rows={3}
                  className="bg-white dark:bg-slate-900"
                />
              </div>
            </div>
          </div>
        </PremiumCard>
      </motion.div>

      {/* Endereço */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <PremiumCard variant="elevated">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <MapPin className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Endereço</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Logradouro</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Rua, Avenida, etc."
                  className="bg-white dark:bg-slate-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Nome da cidade"
                  className="bg-white dark:bg-slate-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="UF"
                  maxLength={2}
                  className="bg-white dark:bg-slate-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zipcode">CEP</Label>
                <Input
                  id="zipcode"
                  name="zipcode"
                  value={formData.zipcode}
                  onChange={handleChange}
                  placeholder="00000-000"
                  className="bg-white dark:bg-slate-900"
                />
              </div>
            </div>
          </div>
        </PremiumCard>
      </motion.div>

      {/* Botão Salvar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex justify-end gap-4"
      >
        <PremiumButton
          onClick={handleSave}
          disabled={saving}
          leftIcon={Save}
          className="bg-gradient-to-r from-slate-700 to-slate-900 text-white whitespace-nowrap inline-flex items-center gap-2 shadow-lg"
        >
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </PremiumButton>
      </motion.div>
    </div>
  );
};

export default SchoolSettingsPage;
