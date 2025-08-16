import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = process.env.SUPA_BASE_PROJECT_URL || 'https://yjsjxiptdoextcadozdz.supabase.co';
const SUPABASE_API_KEY = process.env.SUPA_BASE_API_KEY;

if (!SUPABASE_API_KEY) {
  console.warn('⚠️ Supabase API key not found. Set SUPA_BASE_API_KEY in your environment variables.');
}

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_API_KEY || '', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  }
});

// Database types for OpenSAM
export interface Database {
  public: {
    Tables: {
      company_profiles: {
        Row: {
          id: string;
          name: string;
          description: string;
          capabilities: string[];
          naics_codes: string[];
          created_at: string;
          updated_at: string;
          user_id?: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          capabilities: string[];
          naics_codes: string[];
          created_at?: string;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          capabilities?: string[];
          naics_codes?: string[];
          created_at?: string;
          updated_at?: string;
          user_id?: string;
        };
      };
      opportunities: {
        Row: {
          id: string;
          title: string;
          synopsis: string;
          naics_code: string;
          state: string;
          city: string;
          set_aside: string;
          response_deadline: string;
          active: boolean;
          ui_link: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          synopsis: string;
          naics_code: string;
          state: string;
          city: string;
          set_aside: string;
          response_deadline: string;
          active: boolean;
          ui_link: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          synopsis?: string;
          naics_code?: string;
          state?: string;
          city?: string;
          set_aside?: string;
          response_deadline?: string;
          active?: boolean;
          ui_link?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      working_lists: {
        Row: {
          id: string;
          name: string;
          description: string;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      working_list_items: {
        Row: {
          id: string;
          list_id: string;
          opportunity_id: string;
          notes: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          list_id: string;
          opportunity_id: string;
          notes?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          list_id?: string;
          opportunity_id?: string;
          notes?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      chat_sessions: {
        Row: {
          id: string;
          title: string;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          session_id: string;
          role: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          role: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          role?: string;
          content?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Typed Supabase client
export const typedSupabase = createClient<Database>(SUPABASE_URL, SUPABASE_API_KEY || '', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  }
});

// Utility functions for common operations
export const supabaseUtils = {
  // Company Profiles
  async getCompanyProfiles(userId?: string) {
    const query = typedSupabase
      .from('company_profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (userId) {
      query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async createCompanyProfile(profile: Database['public']['Tables']['company_profiles']['Insert']) {
    const { data, error } = await typedSupabase
      .from('company_profiles')
      .insert(profile)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateCompanyProfile(id: string, updates: Database['public']['Tables']['company_profiles']['Update']) {
    const { data, error } = await typedSupabase
      .from('company_profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteCompanyProfile(id: string) {
    const { error } = await typedSupabase
      .from('company_profiles')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Opportunities
  async getOpportunities(limit = 100) {
    const { data, error } = await typedSupabase
      .from('opportunities')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  async createOpportunity(opportunity: Database['public']['Tables']['opportunities']['Insert']) {
    const { data, error } = await typedSupabase
      .from('opportunities')
      .insert(opportunity)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Working Lists
  async getWorkingLists(userId: string) {
    const { data, error } = await typedSupabase
      .from('working_lists')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async createWorkingList(list: Database['public']['Tables']['working_lists']['Insert']) {
    const { data, error } = await typedSupabase
      .from('working_lists')
      .insert(list)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Chat Sessions
  async getChatSessions(userId: string) {
    const { data, error } = await typedSupabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async createChatSession(session: Database['public']['Tables']['chat_sessions']['Insert']) {
    const { data, error } = await typedSupabase
      .from('chat_sessions')
      .insert(session)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Chat Messages
  async getChatMessages(sessionId: string) {
    const { data, error } = await typedSupabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async createChatMessage(message: Database['public']['Tables']['chat_messages']['Insert']) {
    const { data, error } = await typedSupabase
      .from('chat_messages')
      .insert(message)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

export default supabase; 