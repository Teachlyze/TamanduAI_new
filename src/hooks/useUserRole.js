import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from "@/hooks/useAuth";

// Operational default: 'teacher' to prevent hiding features while RLS/tables are pending.
// If the DB explicitly returns 'student', we honor it.
export default function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState('teacher');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();
        if (!active) return;
        if (!error && data?.role) {
          setRole(data.role === 'student' ? 'student' : 'teacher');
        } else {
          setRole('teacher');
        }
      } catch {
        if (active) setRole('teacher');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [user?.id]);

  return { role, isTeacher: role === 'teacher', loading };
}
