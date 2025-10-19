import React, { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { supabase } from '@/lib/supabaseClient';
import { Logger } from '@/services/logger';
import { AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SkeletonDashboard } from '@/components/ui/skeleton';

// Teacher Dashboard Components (Premium)
import TeacherDashboardPremium from './TeacherDashboardPremium';

// Student Dashboard Components (Premium)
import StudentDashboardPremium from './StudentDashboardPremium';

// School Dashboard Component (Premium)
import SchoolDashboardPremium from './SchoolDashboardPremium';

const RoleBasedDashboard = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // First try to get role from user metadata (fastest)
        if (user.user_metadata?.role) {
          setUserRole(user.user_metadata.role);
          Logger.info('User role from metadata:', user.user_metadata.role);
          setLoading(false);
          return;
        }

        // Fallback: Fetch from profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (profile && !profileError) {
          setUserRole(profile.role || 'teacher');
          Logger.info('User role from profiles:', profile.role);
        } else {
          // Default to teacher if we can't determine the role
          setUserRole('teacher');
          Logger.warn('Could not determine user role, defaulting to teacher');
        }
      } catch (err) {
        Logger.error('Error in fetchUserRole:', err);
        setError('Erro ao carregar as informações do usuário');
        // Default to teacher role on error to prevent blocking the UI
        setUserRole('teacher');
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay to prevent flash of loading state
    const timer = setTimeout(() => {
      fetchUserRole();
    }, 300);

    return () => clearTimeout(timer);
  }, [user?.id]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <SkeletonDashboard />
      </motion.div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Render appropriate dashboard based on role
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {userRole === 'teacher' ? (
        <TeacherDashboardPremium />
      ) : userRole === 'student' ? (
        <StudentDashboardPremium />
      ) : userRole === 'school' ? (
        <SchoolDashboardPremium />
      ) : (
        <div className="flex items-center justify-center h-64">
          <Alert className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Role não reconhecido. Entre em contato com o administrador.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </motion.div>
  );
};

export default RoleBasedDashboard;
