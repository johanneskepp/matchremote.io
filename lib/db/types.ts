export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          plan: 'free' | 'premium'
          stripe_customer_id: string | null
          last_login: string | null
          preferences: Record<string, any>
          is_guest: boolean
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
          plan?: 'free' | 'premium'
          stripe_customer_id?: string | null
          last_login?: string | null
          preferences?: Record<string, any>
          is_guest?: boolean
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          plan?: 'free' | 'premium'
          stripe_customer_id?: string | null
          last_login?: string | null
          preferences?: Record<string, any>
          is_guest?: boolean
        }
      }
      quiz_responses: {
        Row: {
          id: string
          user_id: string
          timezone: string
          async_need: number
          meeting_tolerance: number
          is_parent: boolean
          is_neurodiv: string | null
          salary_min: number
          salary_max: number
          skills: string[]
          experience_level: number
          company_size_pref: string[]
          work_schedule: string
          industry_pref: string[]
          remote_only: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          timezone: string
          async_need: number
          meeting_tolerance: number
          is_parent?: boolean
          is_neurodiv?: string | null
          salary_min: number
          salary_max: number
          skills?: string[]
          experience_level: number
          company_size_pref?: string[]
          work_schedule?: string
          industry_pref?: string[]
          remote_only?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          timezone?: string
          async_need?: number
          meeting_tolerance?: number
          is_parent?: boolean
          is_neurodiv?: string | null
          salary_min?: number
          salary_max?: number
          skills?: string[]
          experience_level?: number
          company_size_pref?: string[]
          work_schedule?: string
          industry_pref?: string[]
          remote_only?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          title: string
          company: string
          description: string
          salary_min: number | null
          salary_max: number | null
          timezone: string | null
          async_score: number | null
          job_type: 'full-time' | 'contract' | 'part-time' | 'freelance'
          location: string | null
          source: string
          url: string
          posted_date: string
          created_at: string
          updated_at: string
          scraped_at: string | null
          expires_at: string | null
          is_active: boolean
          tags: string[]
          company_size: string | null
          industries: string[]
          posted_to_bluesky_at: string | null
        }
        Insert: {
          id?: string
          title: string
          company: string
          description: string
          salary_min?: number | null
          salary_max?: number | null
          timezone?: string | null
          async_score?: number | null
          job_type: 'full-time' | 'contract' | 'part-time' | 'freelance'
          location?: string | null
          source: string
          url: string
          posted_date?: string
          created_at?: string
          updated_at?: string
          scraped_at?: string | null
          expires_at?: string | null
          is_active?: boolean
          tags?: string[]
          company_size?: string | null
          industries?: string[]
          posted_to_bluesky_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          company?: string
          description?: string
          salary_min?: number | null
          salary_max?: number | null
          timezone?: string | null
          async_score?: number | null
          job_type?: 'full-time' | 'contract' | 'part-time' | 'freelance'
          location?: string | null
          source?: string
          url?: string
          posted_date?: string
          created_at?: string
          updated_at?: string
          scraped_at?: string | null
          expires_at?: string | null
          is_active?: boolean
          tags?: string[]
          company_size?: string | null
          industries?: string[]
          posted_to_bluesky_at?: string | null
        }
      }
      matches: {
        Row: {
          id: string
          user_id: string
          job_id: string
          match_score: number
          match_reasons: Record<string, any>
          created_at: string
          updated_at: string
          notified_at: string | null
          seen_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          job_id: string
          match_score: number
          match_reasons?: Record<string, any>
          created_at?: string
          updated_at?: string
          notified_at?: string | null
          seen_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          job_id?: string
          match_score?: number
          match_reasons?: Record<string, any>
          created_at?: string
          updated_at?: string
          notified_at?: string | null
          seen_at?: string | null
        }
      }
      email_logs: {
        Row: {
          id: string
          user_id: string
          email: string
          subject: string
          email_type: string
          sent_at: string
          status: 'sent' | 'failed' | 'bounced'
          resend_id: string | null
          error_message: string | null
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          subject: string
          email_type: string
          sent_at?: string
          status?: 'sent' | 'failed' | 'bounced'
          resend_id?: string | null
          error_message?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          subject?: string
          email_type?: string
          sent_at?: string
          status?: 'sent' | 'failed' | 'bounced'
          resend_id?: string | null
          error_message?: string | null
        }
      }
      saved_jobs: {
        Row: {
          id: string
          user_id: string
          job_id: string
          saved_at: string
          archived: boolean
          notes: string | null
        }
        Insert: {
          id?: string
          user_id: string
          job_id: string
          saved_at?: string
          archived?: boolean
          notes?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          job_id?: string
          saved_at?: string
          archived?: boolean
          notes?: string | null
        }
      }
      email_alerts: {
        Row: {
          id: string
          user_id: string
          email: string
          frequency: 'daily' | 'weekly' | 'never'
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          frequency?: 'daily' | 'weekly' | 'never'
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          frequency?: 'daily' | 'weekly' | 'never'
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          paddle_subscription_id: string | null
          paddle_customer_id: string | null
          status: 'active' | 'paused' | 'canceled' | 'past_due' | 'trialing'
          current_period_end: string | null
          cancel_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          paddle_subscription_id?: string | null
          paddle_customer_id?: string | null
          status?: 'active' | 'paused' | 'canceled' | 'past_due' | 'trialing'
          current_period_end?: string | null
          cancel_at?: string | null
        }
        Update: {
          paddle_subscription_id?: string | null
          paddle_customer_id?: string | null
          status?: 'active' | 'paused' | 'canceled' | 'past_due' | 'trialing'
          current_period_end?: string | null
          cancel_at?: string | null
          updated_at?: string
        }
      }
      otp_codes: {
        Row: {
          id: string
          email: string
          code_hash: string
          expires_at: string
          attempts: number
          consumed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          code_hash: string
          expires_at: string
          attempts?: number
          consumed_at?: string | null
          created_at?: string
        }
        Update: {
          attempts?: number
          consumed_at?: string | null
        }
      }
      sessions: {
        Row: {
          id: string
          user_id: string
          token_hash: string
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          token_hash: string
          expires_at: string
          created_at?: string
        }
        Update: {
          expires_at?: string
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}

// Common types
export type User = Database['public']['Tables']['users']['Row']
export type QuizResponse = Database['public']['Tables']['quiz_responses']['Row']
export type Job = Database['public']['Tables']['jobs']['Row']
export type Match = Database['public']['Tables']['matches']['Row']
export type SavedJob = Database['public']['Tables']['saved_jobs']['Row']
export type EmailAlert = Database['public']['Tables']['email_alerts']['Row']
export type Subscription = Database['public']['Tables']['subscriptions']['Row']
