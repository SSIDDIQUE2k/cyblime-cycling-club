import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { base44 } from '@/api/supabaseClient';
import { supabase } from '@/api/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);
  const checkedRef = useRef(false);

  useEffect(() => {
    // Only run once — avoid double-checking on mount + auth event
    if (!checkedRef.current) {
      checkedRef.current = true;
      checkAppState();
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Use the session user directly — no extra getUser() call
          await loadProfile(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkAppState = async () => {
    try {
      setIsLoadingAuth(true);
      setAuthError(null);

      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // We already have the user from the session — just get the profile
        await loadProfile(session.user);
      } else {
        setIsLoadingAuth(false);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth state check failed:', error);
      setAuthError({
        type: 'unknown',
        message: error.message || 'An unexpected error occurred',
      });
      setIsLoadingAuth(false);
    }
  };

  // Single DB call — just fetch the profile row
  const loadProfile = async (authUser) => {
    try {
      setIsLoadingAuth(true);
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      setUser({
        id: authUser.id,
        email: authUser.email,
        role: profile?.role || 'user',
        ...profile,
      });
      setIsAuthenticated(true);
      setIsLoadingAuth(false);
    } catch (error) {
      console.error('Profile load failed:', error);
      // Still authenticated, just no profile yet
      setUser({ id: authUser.id, email: authUser.email, role: 'user' });
      setIsAuthenticated(true);
      setIsLoadingAuth(false);
    }
  };

  const logout = (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);

    if (shouldRedirect) {
      base44.auth.logout(window.location.href);
    } else {
      base44.auth.logout();
    }
  };

  const navigateToLogin = () => {
    base44.auth.redirectToLogin(window.location.href);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        authError,
        logout,
        navigateToLogin,
        checkAppState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
