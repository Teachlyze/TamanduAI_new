import { supabase } from '@/lib/supabaseClient';

const ConsentManager = {
  async registerConsent(userId, consentData) {
    try {
      const { data, error } = await supabase
        .from('user_consents')
        .insert([
          {
            user_id: userId,
            consent_type: 'cookies',
            consent_data: consentData,
            ip_address: await this.getIpAddress(),
            user_agent: navigator.userAgent,
            timestamp: new Date().toISOString()
          }
        ]);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao registrar consentimento:', error);
      throw error;
    }
  },

  async getIpAddress() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Erro ao obter IP:', error);
      return 'unknown';
    }
  },

  async getUserConsents(userId) {
    try {
      const { data, error } = await supabase
        .from('user_consents')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar consentimentos:', error);
      throw error;
    }
  },

  async deleteUserData(userId) {
    try {
      // Deletar dados do usuário
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (userError) throw userError;

      // Deletar consentimentos
      const { error: consentError } = await supabase
        .from('user_consents')
        .delete()
        .eq('user_id', userId);

      if (consentError) throw consentError;

      return true;
    } catch (error) {
      console.error('Erro ao deletar dados do usuário:', error);
      throw error;
    }
  }
};

export default ConsentManager;
