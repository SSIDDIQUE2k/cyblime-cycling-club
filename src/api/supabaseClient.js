import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================
// Entity wrapper — mimics Base44 API patterns
// so we don't have to rewrite every page
// ============================================

// Fields that Supabase auto-manages — strip before create/update
const READ_ONLY_FIELDS = ['id', 'created_date', 'updated_date', 'created_by'];

function stripReadOnly(record) {
  const clean = { ...record };
  for (const key of READ_ONLY_FIELDS) {
    delete clean[key];
  }
  return clean;
}

function createEntity(tableName) {
  return {
    // base44: Entity.list('-created_date') or Entity.list('-created_date', 50)
    async list(orderBy, limit) {
      let query = supabase.from(tableName).select('*');

      if (orderBy) {
        const desc = orderBy.startsWith('-');
        const column = desc ? orderBy.slice(1) : orderBy;
        query = query.order(column, { ascending: !desc });
      } else {
        query = query.order('created_date', { ascending: false });
      }

      // Default limit of 200 prevents full-table scans
      query = query.limit(limit || 200);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },

    // base44: Entity.filter({ field: value })
    async filter(filters, orderBy, limit) {
      let query = supabase.from(tableName).select('*');

      // Apply filters
      if (filters) {
        for (const [key, value] of Object.entries(filters)) {
          if (Array.isArray(value)) {
            query = query.in(key, value);
          } else if (value === true || value === false) {
            query = query.eq(key, value);
          } else {
            query = query.eq(key, value);
          }
        }
      }

      // Apply ordering
      if (orderBy) {
        const desc = orderBy.startsWith('-');
        const column = desc ? orderBy.slice(1) : orderBy;
        query = query.order(column, { ascending: !desc });
      } else {
        query = query.order('created_date', { ascending: false });
      }

      // Apply limit
      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },

    // base44: Entity.create({ ...data })
    async create(record) {
      const { data, error } = await supabase
        .from(tableName)
        .insert(stripReadOnly(record))
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    // base44: Entity.update(id, { ...data })
    async update(id, updates) {
      const { data, error } = await supabase
        .from(tableName)
        .update(stripReadOnly(updates))
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    // base44: Entity.delete(id)
    async delete(id) {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    },

    // base44: Entity.get(id)
    async get(id) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
  };
}

// ============================================
// Auth wrapper — mimics base44.auth
// ============================================

const auth = {
  async me() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    // Get the user profile with role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    return {
      id: user.id,
      email: user.email,
      role: profile?.role || 'user',
      ...profile,
    };
  },

  async list() {
    // Admin: list all user profiles
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  logout(redirectUrl) {
    supabase.auth.signOut().then(() => {
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        window.location.href = '/';
      }
    }).catch((err) => {
      console.error("Sign out failed:", err);
      // Force redirect even on error to clear UI state
      window.location.href = '/';
    });
  },

  redirectToLogin(redirectUrl) {
    // Store redirect URL and go to login
    if (redirectUrl) {
      sessionStorage.setItem('auth_redirect', redirectUrl);
    }
    window.location.href = '/login';
  },

  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
    return data;
  },

  async signInWithEmail(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/`,
    });
    if (error) throw error;
    return true;
  },

  async signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;

    // Create user profile — only if we have a confirmed session
    // (if email confirmation is required, data.session will be null)
    if (data.user && data.session) {
      try {
        await supabase.from('user_profiles').insert({
          user_id: data.user.id,
          email: data.user.email,
          role: 'user',
        });
      } catch (profileErr) {
        console.warn('Profile creation deferred:', profileErr.message);
      }
    }

    return data;
  },

  // Listen for auth state changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// ============================================
// Integrations wrapper
// ============================================

const integrations = {
  Core: {
    // File upload → Supabase Storage
    async UploadFile({ file }) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error } = await supabase.storage
        .from('uploads')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);

      return { file_url: publicUrl };
    },

    // Email — use Supabase Edge Function or external service
    async SendEmail({ to, subject, body }) {
      // Option 1: Call a Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: { to, subject, body },
      });
      if (error) {
        console.warn('Email sending failed:', error);
        // Don't throw — email failure shouldn't break the app
      }
      return data;
    },

    // SMS — stub (not currently used in the app)
    async SendSMS({ to, body }) {
      console.warn('SMS not configured. Would send to:', to);
      return { success: false, message: 'SMS not configured' };
    },

    // LLM — call via Supabase Edge Function
    async InvokeLLM({ prompt, response_json_schema }) {
      const { data, error } = await supabase.functions.invoke('invoke-llm', {
        body: { prompt, response_json_schema },
      });
      if (error) throw error;
      return data;
    },

    // Image generation — stub
    async GenerateImage(params) {
      console.warn('Image generation not configured');
      return { image_url: '' };
    },

    // Data extraction — stub
    async ExtractDataFromUploadedFile(params) {
      console.warn('Data extraction not configured');
      return {};
    },
  },
};

// ============================================
// Main export — drop-in replacement for base44
// ============================================

export const base44 = {
  auth,
  integrations,
  entities: {
    // Map Base44 entity names → Supabase table names
    BlogPost: createEntity('blog_posts'),
    BlogComment: createEntity('blog_comments'),
    Event: createEntity('events'),
    EventRSVP: createEntity('event_rsvps'),
    EventRegistration: createEntity('event_registrations'),
    Route: createEntity('routes'),
    RouteComment: createEntity('route_comments'),
    Challenge: createEntity('challenges'),
    TeamChallenge: createEntity('team_challenges'),
    ForumPost: createEntity('forum_posts'),
    ForumReply: createEntity('forum_replies'),
    Notification: createEntity('notifications'),
    Achievement: createEntity('achievements'),
    UserPoints: createEntity('user_points'),
    UserProfile: createEntity('user_profiles'),
    Badge: createEntity('badges'),
    Buddy: createEntity('buddies'),
    Report: createEntity('reports'),
    UnlockableContent: createEntity('unlockable_content'),
    UserUnlock: createEntity('user_unlocks'),
    Ticket: createEntity('tickets'),
    StravaSettings: createEntity('strava_settings'),
    InstagramSettings: createEntity('instagram_settings'),
    User: auth, // Base44 maps User to auth
    Query: createEntity('queries'), // fallback

    // CMS entities
    SiteSettings: createEntity('site_settings'),
    PageContent: createEntity('page_content'),
    Testimonial: createEntity('testimonials'),
  },
};
