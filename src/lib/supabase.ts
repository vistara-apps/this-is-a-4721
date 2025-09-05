import { createClient } from '@supabase/supabase-js'
import { config } from '../config'
import type { Database } from '../types/database'

// Create Supabase client
export const supabase = createClient<Database>(
  config.supabase.url,
  config.supabase.anonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
)

// Database helper functions
export const db = {
  // User operations
  users: {
    async create(userData: {
      email: string
      subscription_tier: 'free' | 'pro'
      state_preference?: string
    }) {
      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single()
      
      if (error) throw error
      return data
    },

    async getById(userId: string) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      if (error) throw error
      return data
    },

    async updateSubscription(userId: string, tier: 'free' | 'pro') {
      const { data, error } = await supabase
        .from('users')
        .update({ subscription_tier: tier, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .select()
        .single()
      
      if (error) throw error
      return data
    }
  },

  // Rights cards operations
  rightsCards: {
    async create(cardData: {
      state: string
      title: string
      content: string
      language: 'en' | 'es'
    }) {
      const { data, error } = await supabase
        .from('rights_cards')
        .insert([cardData])
        .select()
        .single()
      
      if (error) throw error
      return data
    },

    async getByState(state: string, language: 'en' | 'es' = 'en') {
      const { data, error } = await supabase
        .from('rights_cards')
        .select('*')
        .eq('state', state)
        .eq('language', language)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single()
      
      if (error) throw error
      return data
    },

    async getAll(language: 'en' | 'es' = 'en') {
      const { data, error } = await supabase
        .from('rights_cards')
        .select('*')
        .eq('language', language)
        .order('state')
      
      if (error) throw error
      return data
    }
  },

  // Incident records operations
  incidentRecords: {
    async create(recordData: {
      user_id?: string
      file_path: string
      storage_type: 'local' | 'ipfs'
      status: 'recording' | 'complete' | 'uploaded'
    }) {
      const { data, error } = await supabase
        .from('incident_records')
        .insert([recordData])
        .select()
        .single()
      
      if (error) throw error
      return data
    },

    async getByUserId(userId: string) {
      const { data, error } = await supabase
        .from('incident_records')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    },

    async updateStatus(recordId: string, status: 'recording' | 'complete' | 'uploaded') {
      const { data, error } = await supabase
        .from('incident_records')
        .update({ status })
        .eq('record_id', recordId)
        .select()
        .single()
      
      if (error) throw error
      return data
    },

    async delete(recordId: string) {
      const { error } = await supabase
        .from('incident_records')
        .delete()
        .eq('record_id', recordId)
      
      if (error) throw error
    }
  }
}

// Auth helper functions
export const auth = {
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })
    
    if (error) throw error
    return data
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    return data
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },

  async getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  }
}

export default supabase
