'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface Session {
  id: string
  trainer_id?: string
  member_id?: string
  type: string
  title: string
  description?: string
  start_time: string
  end_time: string
  location?: string
  is_online: boolean
  meeting_link?: string
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show'
  is_group_session: boolean
  max_participants: number
  notes?: string
  created_at: string
  updated_at: string
  member?: {
    full_name: string
    email: string
    phone?: string
  }
}

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async (startDate?: Date, endDate?: Date) => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('sessions')
        .select(`
          *,
          member:members(full_name, email, phone)
        `)
        .order('start_time', { ascending: true })
      
      if (startDate) {
        query = query.gte('start_time', startDate.toISOString())
      }
      
      if (endDate) {
        query = query.lte('start_time', endDate.toISOString())
      }
      
      const { data, error } = await query
      
      if (error) throw error
      setSessions(data || [])
      
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  const createSession = async (session: Partial<Session>) => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Not authenticated')
      
      const { data, error } = await supabase
        .from('sessions')
        .insert({
          ...session,
          trainer_id: userData.user.id
        })
        .select()
        .single()
      
      if (error) throw error
      
      setSessions([...sessions, data])
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  }

  const updateSession = async (id: string, updates: Partial<Session>) => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      
      setSessions(sessions.map(s => s.id === id ? data : s))
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  }

  const deleteSession = async (id: string) => {
    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      setSessions(sessions.filter(s => s.id !== id))
      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  }

  return {
    sessions,
    loading,
    error,
    fetchSessions,
    createSession,
    updateSession,
    deleteSession,
  }
}
