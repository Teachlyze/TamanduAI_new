import React, { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { supabase } from '@/lib/supabaseClient';
import { Logger } from '@/services/logger';
import { AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SkeletonDashboard } from '@/components/ui/skeleton';

// Teacher Dashboard Components
import TeacherDashboard from './TeacherDashboard';

// Student Dashboard Components
import StudentDashboard from './StudentDashboard';

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

        // Fetch both profile and teacher status in parallel
        const [
          { data: profile, error: profileError },
          { data: teacherClasses, error: teacherError }
        ] = await Promise.all([
          supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single(),
          
          // Check if user is a teacher in any class
          supabase
            .from('classes')
            .select('id')
            .eq('teacher_id', user.id)
            .limit(1)
        ]);

        // If we have a profile with a role, use that
        if (profile && !profileError) {
          setUserRole(profile.role || 'student');
        } 
        // If no profile or error, check if user is a teacher
        else if (teacherClasses?.length > 0 && !teacherError) {
          setUserRole('teacher');
        } 
        // Default to student if we can't determine the role
        else {
          setUserRole('student');
        }

        Logger.info('User role determined:', profile?.role || 'student');
      } catch (err) {
        Logger.error('Error in fetchUserRole:', err);
        setError('Erro ao carregar as informações do usuário');
        // Default to student role on error to prevent blocking the UI
        setUserRole('student');
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
        <TeacherDashboard />
      ) : userRole === 'student' ? (
        <StudentDashboard />
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
