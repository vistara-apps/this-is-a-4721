export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          user_id: string
          email: string
          subscription_tier: 'free' | 'pro'
          created_at: string
          updated_at: string
          state_preference: string | null
        }
        Insert: {
          user_id?: string
          email: string
          subscription_tier?: 'free' | 'pro'
          created_at?: string
          updated_at?: string
          state_preference?: string | null
        }
        Update: {
          user_id?: string
          email?: string
          subscription_tier?: 'free' | 'pro'
          created_at?: string
          updated_at?: string
          state_preference?: string | null
        }
      }
      rights_cards: {
        Row: {
          card_id: string
          state: string
          title: string
          content: string
          language: 'en' | 'es'
          created_at: string
          updated_at: string
        }
        Insert: {
          card_id?: string
          state: string
          title: string
          content: string
          language?: 'en' | 'es'
          created_at?: string
          updated_at?: string
        }
        Update: {
          card_id?: string
          state?: string
          title?: string
          content?: string
          language?: 'en' | 'es'
          created_at?: string
          updated_at?: string
        }
      }
      incident_records: {
        Row: {
          record_id: string
          user_id: string | null
          timestamp: string
          file_path: string
          storage_type: 'local' | 'ipfs'
          status: 'recording' | 'complete' | 'uploaded'
          created_at: string
        }
        Insert: {
          record_id?: string
          user_id?: string | null
          timestamp?: string
          file_path: string
          storage_type: 'local' | 'ipfs'
          status?: 'recording' | 'complete' | 'uploaded'
          created_at?: string
        }
        Update: {
          record_id?: string
          user_id?: string | null
          timestamp?: string
          file_path?: string
          storage_type?: 'local' | 'ipfs'
          status?: 'recording' | 'complete' | 'uploaded'
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      subscription_tier: 'free' | 'pro'
      storage_type: 'local' | 'ipfs'
      record_status: 'recording' | 'complete' | 'uploaded'
      language: 'en' | 'es'
    }
  }
}
