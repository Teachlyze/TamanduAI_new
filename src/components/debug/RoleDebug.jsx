import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { Badge } from '@/components/ui/badge';
import { PremiumCard } from '@/components/ui/PremiumCard';

const RoleDebug = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadProfileData();
    }
  }, [user?.id]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfileData(data);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <PremiumCard className="fixed bottom-4 right-4 p-4 max-w-sm z-50 bg-white/95 backdrop-blur">
      <h3 className="font-bold mb-2">🐛 Role Debug</h3>
      <div className="space-y-2 text-sm">
        <div>
          <strong>Email:</strong> {user.email}
        </div>
        <div>
          <strong>User ID:</strong> {user.id}
        </div>
        <div>
          <strong>Metadata Role:</strong> 
          <Badge className="ml-2">
            {user.user_metadata?.role || 'undefined'}
          </Badge>
        </div>
        <div>
          <strong>Profile Role:</strong> 
          {loading ? (
            <span className="ml-2">Loading...</span>
          ) : (
            <Badge className="ml-2">
              {profileData?.role || 'undefined'}
            </Badge>
          )}
        </div>
        <div>
          <strong>Current Path:</strong> {window.location.pathname}
        </div>
        <div>
          <strong>School ID:</strong> {profileData?.school_id || 'N/A'}
        </div>
      </div>
    </PremiumCard>
  );
};

export default RoleDebug;
