import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          user_type: 'kol' | 'project'
          twitter_username: string | null
          twitter_id: string | null
          twitter_verified: boolean
          twitter_followers_count: number
          avatar_url: string | null
          bio: string | null
          website_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_type: 'kol' | 'project'
          twitter_username?: string | null
          twitter_id?: string | null
          twitter_verified?: boolean
          twitter_followers_count?: number
          avatar_url?: string | null
          bio?: string | null
          website_url?: string | null
        }
        Update: {
          user_type?: 'kol' | 'project'
          twitter_username?: string | null
          twitter_id?: string | null
          twitter_verified?: boolean
          twitter_followers_count?: number
          avatar_url?: string | null
          bio?: string | null
          website_url?: string | null
          updated_at?: string
        }
      }
      kol_profiles: {
        Row: {
          id: string
          user_id: string
          display_name: string
          specialties: string[]
          hourly_rate: number | null
          rating: number
          total_campaigns: number
          total_earnings: number
          languages: string[]
          time_zone: string
          availability: boolean
          verification_status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          display_name: string
          specialties?: string[]
          hourly_rate?: number | null
          rating?: number
          total_campaigns?: number
          total_earnings?: number
          languages?: string[]
          time_zone?: string
          availability?: boolean
          verification_status?: string
        }
        Update: {
          display_name?: string
          specialties?: string[]
          hourly_rate?: number | null
          rating?: number
          total_campaigns?: number
          total_earnings?: number
          languages?: string[]
          time_zone?: string
          availability?: boolean
          verification_status?: string
          updated_at?: string
        }
      }
      project_profiles: {
        Row: {
          id: string
          user_id: string
          company_name: string
          industry: string | null
          company_size: string | null
          website_url: string | null
          description: string | null
          verification_status: string
          total_campaigns: number
          total_spent: number
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          company_name: string
          industry?: string | null
          company_size?: string | null
          website_url?: string | null
          description?: string | null
          verification_status?: string
          total_campaigns?: number
          total_spent?: number
        }
        Update: {
          company_name?: string
          industry?: string | null
          company_size?: string | null
          website_url?: string | null
          description?: string | null
          verification_status?: string
          total_campaigns?: number
          total_spent?: number
          updated_at?: string
        }
      }
      campaigns: {
        Row: {
          id: string
          project_id: string
          title: string
          description: string
          requirements: string[]
          budget_min: number | null
          budget_max: number | null
          duration_days: number | null
          deliverables: string[]
          status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
          application_deadline: string | null
          campaign_start_date: string | null
          campaign_end_date: string | null
          applications_count: number
          created_at: string
          updated_at: string
        }
      }
      campaign_applications: {
        Row: {
          id: string
          campaign_id: string
          kol_id: string
          proposed_rate: number
          cover_letter: string | null
          deliverables: string[]
          status: 'pending' | 'accepted' | 'rejected' | 'completed'
          applied_at: string
          updated_at: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          recipient_id: string
          campaign_id: string | null
          subject: string | null
          content: string
          read: boolean
          created_at: string
        }
      }
      analytics: {
        Row: {
          id: string
          campaign_id: string
          kol_id: string | null
          metric_name: string
          metric_value: number
          recorded_at: string
        }
      }
    }
  }
}