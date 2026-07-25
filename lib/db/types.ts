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
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
          plan?: 'free' | 'premium'
          stripe_customer_id?: string | null
          last_login?: string | null
          preferences?: Record<string, any>
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          plan?: 'free' | 'premium'
          stripe_customer_id?: string | null
          last_login?: string | null
          preferences?: Record<string, any>
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
          is_active: boolean
          tags: string[]
          company_size: string | null
          industries: string[]
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
          is_active?: boolean
          tags?: string[]
          company_size?: string | null
          industries?: string[]
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
          is_active?: boolean
          tags?: string[]
          company_size?: string | null
          industries?: string[]
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
        }
        Insert: {
          id?: string
          user_id: string
          job_id: string
          match_score: number
          match_reasons?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          job_id?: string
          match_score?: number
          match_reasons?: Record<string, any>
          created_at?: string
          updated_at?: string
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
