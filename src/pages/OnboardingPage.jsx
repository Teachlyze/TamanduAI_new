import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabaseClient';
import TermsAuditService from '@/services/termsAuditService';
import { useTranslation } from 'react-i18next';
import { BookOpen, CheckCircle, AlertCircle, User, GraduationCap, Users, Sparkles } from 'lucide-react';

// Current versions of terms and privacy
const CURRENT_TERMS_VERSION = '1.0';
const CURRENT_PRIVACY_VERSION = '1.0';

const OnboardingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: '',
    role: '',
    age: '',
    cpf: '',
    terms_accepted: false,
    privacy_accepted: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.full_name || !form.role || !form.terms_accepted || !form.privacy_accepted) {
      setError(t('onboarding.errors.required', 'Preencha nome, papel e aceite os termos e a privacidade.'));
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        full_name: form.full_name,
        role: form.role,
        terms_accepted: !!form.terms_accepted,
        privacy_accepted: !!form.privacy_accepted,
      };
      if (form.age) payload.age = Number(form.age);
      if (form.cpf) payload.cpf = form.cpf;

      // Call onboarding function
      const { data, error } = await supabase.functions.invoke('user-onboarding', {
        method: 'POST',
        body: payload,
      });
      if (error) throw error;

      // Get user ID from response or from current session
      const { data: { user } } = await supabase.auth.getUser();
      const userId = data?.userId || user?.id;

      if (!userId) {
        throw new Error('User ID not found after onboarding');
      }

      // Log terms acceptance with IP/UA and versioning
      try {
        await TermsAuditService.logAcceptance(
          userId,
          CURRENT_TERMS_VERSION,
          CURRENT_PRIVACY_VERSION,
          {
            ipAddress: await getClientIP(),
            userAgent: navigator.userAgent,
            method: 'onboarding',
            metadata: {
              onboarding_completed: true,
              form_data: {
                full_name: form.full_name,
                role: form.role,
                age: form.age,
                cpf: form.cpf,
              },
            },
          }
        );
      } catch (auditError) {
        console.warn('Failed to log terms acceptance:', auditError);
        // Don't fail the onboarding for audit errors
      }

      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err?.message || t('onboarding.errors.generic', 'Falha ao concluir onboarding'));
    } finally {
      setSubmitting(false);
    }
  };

  // Helper function to get client IP (placeholder for server-side detection)
  const getClientIP = async () => {
    try {
      // In production, this would be detected server-side
      // For now, return a placeholder
      return 'client-side-detection-needed';
    } catch (error) {
      return 'unknown';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-xl p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Completar cadastro</h1>
          <p className="text-sm text-muted-foreground">Informe seus dados para continuar usando a plataforma.</p>
        <form onSubmit={submit} className="space-y-4">
          {error && (
            <div className="p-3 rounded bg-red-50 text-red-700 text-sm">{error}</div>
          )}
          <div className="space-y-2">
            <Label htmlFor="full_name">{t('onboarding.fields.fullName', 'Nome completo')}</Label>
            <Input id="full_name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">{t('onboarding.fields.role', 'Papel')}</Label>
            <select
              className="w-full border rounded h-10 px-3"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              required
            >
              <option value="" disabled>Selecione</option>
              <option value="teacher">Professor</option>
              <option value="student">Aluno</option>
              <option value="school">Escola</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">{t('onboarding.fields.age', 'Idade')} <span className="text-base-content/50">({t('common.optional', 'opcional')})</span></Label>
              <Input id="age" type="number" min="1" max="120" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF (opcional)</Label>
              <Input id="cpf" value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.terms_accepted} onChange={(e) => setForm({ ...form, terms_accepted: e.target.checked })} />
              Aceito os <a className="text-primary underline" href="/terms" target="_blank" rel="noreferrer">Termos de Uso</a>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.privacy_accepted} onChange={(e) => setForm({ ...form, privacy_accepted: e.target.checked })} />
              Aceito a <a className="text-primary underline" href="/privacy" target="_blank" rel="noreferrer">Política de Privacidade</a>
            </label>
          </div>
          <div>
            <Button type="submit" disabled={submitting} className="w-full">{submitting ? 'Salvando...' : 'Concluir'}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default OnboardingPage;
