import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabaseClient';
import TermsAuditService from '@/services/termsAuditService';
import { navigateToHome } from '@/utils/roleNavigation';
import { BookOpen, CheckCircle, AlertCircle, User, GraduationCap, Users, Sparkles, Building2 } from 'lucide-react';
import gamificationService from '@/services/gamificationService';
import missionsService from '@/services/missionsService';

// Current versions of terms and privacy
const CURRENT_TERMS_VERSION = '1.0';
const CURRENT_PRIVACY_VERSION = '1.0';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: '',
    role: '',
    age: '',
    cpf: '',
    school_name: '',
    terms_accepted: false,
    privacy_accepted: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.full_name || !form.role || !form.terms_accepted || !form.privacy_accepted) {
      setError('Preencha nome, papel e aceite os termos e a privacidade.');
      return;
    }

    if (form.role === 'school' && !form.school_name) {
      setError('Por favor, informe o nome da escola.');
      return;
    }

    setSubmitting(true);
    try {
      // console.log('[Onboarding] Starting onboarding process...');
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No user found');

      // console.log('[Onboarding] Updating user metadata...');
      
      // Update user metadata directly
      const { data: updatedData, error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: form.full_name,
          role: form.role,
          age: form.age ? Number(form.age) : null,
          cpf: form.cpf || null,
          terms_accepted: true,
          privacy_accepted: true,
          terms_version: CURRENT_TERMS_VERSION,
          privacy_version: CURRENT_PRIVACY_VERSION,
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
        }
      });

      if (updateError) throw updateError;
      
      // console.log('[Onboarding] User metadata updated successfully');
      const userId = user.id;

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
        console.error('[Onboarding] Failed to log terms acceptance:', auditError);
      }

      // Inicializar gamificação para alunos
      if (form.role === 'student') {
        // console.log('[Onboarding] Initializing gamification for student...');
        try {
          await gamificationService.initializeProfile(userId);
          await missionsService.initializeMissions(userId);
          // console.log('[Onboarding] Gamification initialized successfully!');
        } catch (gamError) {
          console.error('[Onboarding] Error initializing gamification:', gamError);
          // Não bloquear o fluxo se gamificação falhar
        }
      }

      // Criar escola e vincular admin
      if (form.role === 'school') {
        // console.log('[Onboarding] Creating school...');
        try {
          const { data: school, error: schoolError } = await supabase
            .from('schools')
            .insert({ 
              name: form.school_name,
              created_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (schoolError) throw schoolError;

          // console.log('[Onboarding] School created:', school.id);

          // Vincular como admin
          const { error: adminError } = await supabase
            .from('school_admins')
            .insert({
              school_id: school.id,
              user_id: userId,
              role: 'owner',
            });

          if (adminError) throw adminError;

          // console.log('[Onboarding] User linked as school admin!');
        } catch (schoolError) {
          console.error('[Onboarding] Error creating school:', schoolError);
          // Não bloquear o fluxo
        }
      }

      // console.log('[Onboarding] Onboarding completed successfully!');
      // Navigate based on user role
      const role = form.role || 'student';
      navigateToHome(navigate, role);
    } catch (err) {
      console.error('[Onboarding] Error:', err);
      setError(err?.message || 'Falha ao concluir onboarding');
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
      <div className="w-full max-w-xl p-6 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div>
          <h1 className="text-2xl font-bold">Completar cadastro</h1>
          <p className="text-sm text-muted-foreground">Informe seus dados para continuar usando a plataforma.</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          {error && (
            <div className="p-3 rounded bg-red-50 text-red-700 text-sm">{error}</div>
          )}
          <div className="space-y-2">
            <Label htmlFor="full_name">Nome completo</Label>
            <Input id="full_name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Papel</Label>
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
          
          {/* Campo Nome da Escola (apenas se role='school') */}
          {form.role === 'school' && (
            <div className="space-y-2">
              <Label htmlFor="school_name">
                <Building2 className="mr-1 inline h-4 w-4" />
                Nome da Escola
              </Label>
              <Input 
                id="school_name" 
                value={form.school_name} 
                onChange={(e) => setForm({ ...form, school_name: e.target.value })} 
                placeholder="Ex: Colégio XYZ"
                required={form.role === 'school'}
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Idade <span className="text-base-content/50">(opcional)</span></Label>
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
      </div>
    </div>
  );
};

export default OnboardingPage;
