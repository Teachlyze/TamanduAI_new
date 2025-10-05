import { useState, useEffect, useCallback, useContext, createContext, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';

// Create and export the context
export const AuthContext = createContext(null);

// Export the provider as default
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // We'll use a ref to store the navigate function
  const navigateRef = useRef(null);

  // Bootstrap: if session exists, fetch user payload via Edge Function (Redis-backed)
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const accessToken = session?.access_token;
        if (!accessToken) {
          setUser(null);
          return;
        }
        // Fetch cached user from Edge Function
        const { data, error } = await supabase.functions.invoke('auth-me', {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (error) throw error;
        setUser(data?.user ?? null);
      } catch (err) {
        console.error('Bootstrap auth error:', err);
        setError(err?.message || String(err));
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();

    // Optional: update on auth state change to keep token fresh
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        const accessToken = session?.access_token;
        if (!accessToken) {
          setUser(null);
          return;
        }
        const { data, error } = await supabase.functions.invoke('auth-me', {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (error) throw error;
        setUser(data?.user ?? null);
      } catch (err) {
        console.error('Auth state refresh error:', err);
        setUser(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Sign in with email and password (guarded by hCaptcha + lockout)
  const signIn = async (email, password, hcaptchaToken) => {
    try {
      setLoading(true);
      setError(null);
      // 1) Guard: validate hCaptcha + rate limit using Edge Function
      try {
        await supabase.functions.invoke('auth-guard-login', {
          method: 'POST',
          body: { email, hcaptchaToken },
        })
      } catch (guardErr) {
        // Surface guard error to caller
        throw new Error(guardErr?.message || 'Security check failed');
      }

      // 2) Perform Supabase sign-in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      // 3) Clear attempts/lock on success
      try {
        await supabase.functions.invoke('auth-login-success', {
          method: 'POST',
          body: { email },
        })
      } catch (_) { /* noop */ }
      // After login, fetch user payload via Edge Function
      const accessToken = data.session?.access_token;
      if (!accessToken) return { user: null };
      const { data: meData, error: meErr } = await supabase.functions.invoke('auth-me', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (meErr) throw meErr;
      const meUser = meData?.user ?? null
      setUser(meUser);
      const needsOnboarding = !(
        meUser?.role && meUser?.terms_accepted && meUser?.privacy_accepted
      )
      return { user: meUser, needsOnboarding };
    } catch (error) {
      setError(error.message);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  // Sign up with email and password
  const signUp = async (userData, hcaptchaToken) => {
    try {
      setLoading(true);
      setError(null);
      // 1) Guard: validate hCaptcha + rate limit using Edge Function
      try {
        await supabase.functions.invoke('auth-guard-register', {
          method: 'POST',
          body: { email: userData.email, hcaptchaToken },
        })
      } catch (guardErr) {
        // Surface guard error to caller
        throw new Error(guardErr?.message || 'Security check failed');
      }

      // 2) Perform Supabase registration
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.name,
            cpf: userData.cpf,
            role: userData.role || 'student'
          }
        }
      });
      if (error) throw error;
      // 3) Clear attempts on success
      try {
        await supabase.functions.invoke('auth-register-success', {
          method: 'POST',
          body: { email: userData.email },
        })
      } catch (_) { /* noop */ }
      return { user: data.user, success: true };
    } catch (error) {
      setError(error.message);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  // Complete onboarding and sync cache via Edge Function
  const completeOnboarding = async (concluded = true) => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      if (!accessToken) throw new Error('Sem sessão ativa');
      const { data, error } = await supabase.functions.invoke('user-onboarding', {
        method: 'POST',
        body: { concluded },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (error) throw error;
      setUser(data?.user ?? user);
      return { user: data?.user ?? user };
    } catch (err) {
      setError(err?.message || String(err));
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // Use the navigate function if it's available
      if (navigateRef.current) {
        navigateRef.current('/login');
      } else {
        // Fallback to window.location if navigate is not available yet
        window.location.href = '/login';
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [navigateRef]);

  // Prepare the context value
  const contextValue = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    completeOnboarding,
    setNavigate: (navigate) => {
      navigateRef.current = navigate;
    }
  };

  // Render the provider with the context value
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
