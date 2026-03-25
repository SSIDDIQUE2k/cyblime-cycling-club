import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/supabaseClient';
import { supabase } from '@/api/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Single listener handles ALL auth state — no separate getSession() call
    // This avoids the lock contention that causes "Lock not released" errors
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // SIGNED_IN, TOKEN_REFRESHED, INITIAL_SESSION — all have a user
          await loadProfile(session.user);
        } else {
          // SIGNED_OUT or no session
          setUser(null);
          setIsAuthenticated(false);
          setIsLoadingAuth(false);
        }
      }
    );

    // Safety timeout — if onAuthStateChange never fires (e.g. no network),
    // stop showing the loading spinner after 5s
    const timeout = setTimeout(() => {
      setIsLoadingAuth((prev) => {
        if (prev) {
          setIsAuthenticated(false);
          return false;
        }
        return prev;
      });
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  // Fetch the profile row — create one if it doesn't exist yet
  const loadProfile = async (authUser) => {
    try {
      setIsLoadingAuth(true);
      let { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      // If no profile exists (first sign-in after email confirmation), create one
      if (error && error.code === 'PGRST116') {
        const { data: newProfile } = await supabase
          .from('user_profiles')
          .insert({ user_id: authUser.id, email: authUser.email, role: 'user' })
          .select()
          .single();
        profile = newProfile;
      }

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
