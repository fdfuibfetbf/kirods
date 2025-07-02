export interface Article {
  id: string;
  title: string;
  content: string;
  category_id: string | null;
  category?: Category;
  tags: string[];
  featured: boolean;
  views: number;
  created_at: string;
  updated_at: string;
  // SEO fields
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  slug?: string;
  canonical_url?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  article_count?: number;
}

export interface AdminProfile {
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
  join_date: string;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  article_id: string;
  user_name: string;
  user_email: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_reply?: string;
  created_at: string;
  updated_at: string;
  article?: Article;
}

export interface SMTPSettings {
  id: string;
  host: string;
  port: number;
  username: string;
  password: string;
  from_email: string;
  from_name: string;
  encryption: 'none' | 'tls' | 'ssl';
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  description?: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailLog {
  id: string;
  template_id: string;
  recipient_email: string;
  recipient_name: string;
  subject: string;
  body: string;
  status: 'pending' | 'sent' | 'failed';
  error_message?: string;
  sent_at?: string;
  created_at: string;
  template?: EmailTemplate;
}

export interface ChatSession {
  id: string;
  user_name: string;
  user_email: string;
  status: 'active' | 'pending' | 'closed';
  created_at: string;
  updated_at: string;
  session_duration?: number;
  user_ip?: string;
  user_agent?: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  message: string;
  sender: 'user' | 'admin';
  is_read: boolean;
  created_at: string;
}

export interface AnalyticsData {
  totalViews: number;
  activeUsers: number;
  articlesViewed: number;
  topArticles: Array<{
    id: string;
    title: string;
    views: number;
    change: string;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    message: string;
    time: string;
    status: string;
  }>;
}