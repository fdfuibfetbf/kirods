export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      articles: {
        Row: {
          id: string;
          title: string;
          content: string;
          category_id: string | null;
          tags: string[];
          featured: boolean;
          views: number;
          created_at: string;
          updated_at: string;
          meta_title: string | null;
          meta_description: string | null;
          meta_keywords: string | null;
          slug: string | null;
          canonical_url: string | null;
          og_title: string | null;
          og_description: string | null;
          og_image: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          category_id?: string | null;
          tags?: string[];
          featured?: boolean;
          views?: number;
          created_at?: string;
          updated_at?: string;
          meta_title?: string | null;
          meta_description?: string | null;
          meta_keywords?: string | null;
          slug?: string | null;
          canonical_url?: string | null;
          og_title?: string | null;
          og_description?: string | null;
          og_image?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          category_id?: string | null;
          tags?: string[];
          featured?: boolean;
          views?: number;
          created_at?: string;
          updated_at?: string;
          meta_title?: string | null;
          meta_description?: string | null;
          meta_keywords?: string | null;
          slug?: string | null;
          canonical_url?: string | null;
          og_title?: string | null;
          og_description?: string | null;
          og_image?: string | null;
        };
      };
      smtp_settings: {
        Row: {
          id: string;
          host: string;
          port: number;
          username: string;
          password: string;
          from_email: string;
          from_name: string | null;
          encryption: 'none' | 'tls' | 'ssl';
          enabled: boolean;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          host?: string;
          port?: number;
          username?: string;
          password?: string;
          from_email?: string;
          from_name?: string | null;
          encryption?: 'none' | 'tls' | 'ssl';
          enabled?: boolean;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          host?: string;
          port?: number;
          username?: string;
          password?: string;
          from_email?: string;
          from_name?: string | null;
          encryption?: 'none' | 'tls' | 'ssl';
          enabled?: boolean;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      admin_profiles: {
        Row: {
          id: string;
          user_id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string | null;
          location: string | null;
          bio: string | null;
          avatar_url: string | null;
          role: string;
          join_date: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string;
          first_name?: string;
          last_name?: string;
          email?: string;
          phone?: string | null;
          location?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          role?: string;
          join_date?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          first_name?: string;
          last_name?: string;
          email?: string;
          phone?: string | null;
          location?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          role?: string;
          join_date?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      chat_sessions: {
        Row: {
          id: string;
          user_name: string;
          user_email: string;
          status: string | null;
          created_at: string | null;
          updated_at: string | null;
          session_duration: number | null;
          user_ip: string | null;
          user_agent: string | null;
        };
        Insert: {
          id?: string;
          user_name: string;
          user_email: string;
          status?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          session_duration?: number | null;
          user_ip?: string | null;
          user_agent?: string | null;
        };
        Update: {
          id?: string;
          user_name?: string;
          user_email?: string;
          status?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          session_duration?: number | null;
          user_ip?: string | null;
          user_agent?: string | null;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          session_id: string | null;
          message: string;
          sender: string;
          is_read: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          session_id?: string | null;
          message: string;
          sender: string;
          is_read?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          session_id?: string | null;
          message?: string;
          sender?: string;
          is_read?: boolean | null;
          created_at?: string | null;
        };
      };
      comments: {
        Row: {
          id: string;
          article_id: string;
          user_name: string;
          user_email: string;
          content: string;
          status: string;
          admin_reply: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          article_id: string;
          user_name: string;
          user_email: string;
          content: string;
          status?: string;
          admin_reply?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          article_id?: string;
          user_name?: string;
          user_email?: string;
          content?: string;
          status?: string;
          admin_reply?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
    };
  };
}