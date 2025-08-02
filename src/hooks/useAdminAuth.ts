import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdminUser } from '@/types/database';
import type { User, Session } from '@supabase/supabase-js';

export function useAdminAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchAdminUser(session.user.id);
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchAdminUser(session.user.id);
        // Update last login
        await updateLastLogin(session.user.id);
      } else {
        setAdminUser(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchAdminUser = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching admin user:', error);
        setAdminUser(null);
        return;
      }

      setAdminUser(data);
    } catch (error) {
      console.error('Error in fetchAdminUser:', error);
      setAdminUser(null);
    }
  };

  const updateLastLogin = async (userId: string) => {
    try {
      await supabase
        .from('admin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('user_id', userId);
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    
    // Check if email is in admin_users first (same validation as magic link)
    const { data: adminCheck, error: adminError } = await supabase
      .from('admin_users')
      .select('email')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (adminError || !adminCheck) {
      setLoading(false);
      return { 
        data: null, 
        error: { message: 'Email not authorized for admin access' } 
      };
    }
    
    // Proceed with normal password authentication
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    return { data, error };
  };

  const signInWithMagicLink = async (email: string) => {
    setLoading(true);
    
    // Check if email is in admin_users first
    const { data: adminCheck, error: adminError } = await supabase
      .from('admin_users')
      .select('email')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (adminError || !adminCheck) {
      setLoading(false);
      return { 
        data: null, 
        error: { message: 'Email not authorized for admin access' } 
      };
    }
    
    // Get redirect URL - prioritize environment variable, fallback to current location
    const envUrl = import.meta.env.VITE_APP_URL;
    const currentOrigin = window.location.origin;
    
    // For production, always use environment variable if set
    // For development, use localhost:3000 if current origin is different
    let baseUrl;
    if (envUrl && envUrl !== 'http://localhost:8080') {
      baseUrl = envUrl;
    } else if (currentOrigin.includes('localhost')) {
      baseUrl = 'http://localhost:3000';
    } else {
      baseUrl = currentOrigin;
    }
    
    const redirectUrl = `${baseUrl}/admin`;
    
    console.log('Magic link redirect URL:', redirectUrl); // Debug log
    
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });
    setLoading(false);
    return { data, error };
  };

  const signOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setAdminUser(null);
    setLoading(false);
    return { error };
  };

  const createAdminUser = async (userId: string, email: string, role: 'super_admin' | 'admin' | 'editor' = 'admin') => {
    if (!adminUser || !['super_admin', 'admin'].includes(adminUser.role)) {
      return { data: null, error: { message: 'Insufficient permissions' } };
    }

    // Note: User validation is handled by database triggers and the UI selection
    // The get_available_auth_users() function ensures only valid users are selectable
    
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .insert({
          user_id: userId,
          email,
          role,
          created_by: adminUser.id,
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  };

  const getAvailableAuthUsers = async () => {
    try {
      const { data, error } = await supabase.rpc('get_available_auth_users');
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  };

  const updateAdminUser = async (id: string, updates: Partial<AdminUser>) => {
    if (!adminUser || adminUser.role !== 'super_admin') {
      return { data: null, error: { message: 'Insufficient permissions' } };
    }

    try {
      const { data, error } = await supabase
        .from('admin_users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  };

  return {
    user,
    session,
    adminUser,
    loading,
    isAuthenticated: !!user && !!adminUser,
    isAdmin: !!adminUser && ['super_admin', 'admin'].includes(adminUser.role),
    isSuperAdmin: !!adminUser && adminUser.role === 'super_admin',
    signInWithEmail,
    signInWithMagicLink,
    signOut,
    createAdminUser,
    updateAdminUser,
    getAvailableAuthUsers,
    refreshAdminUser: () => user ? fetchAdminUser(user.id) : Promise.resolve(),
  };
}