'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface Member {
  id: string
  trainer_id?: string
  full_name: string
  email?: string
  phone?: string
  status: 'active' | 'paused' | 'expired'
  membership_type?: 'basic' | 'premium' | 'elite' | 'custom'
  monthly_fees?: number
  avatar_url?: string
  date_of_birth?: string
  emergency_contact?: any
  medical_notes?: string
  join_date: string
  last_session_date?: string
  total_sessions: number
  notes?: string
  tags?: string[]
  created_at: string
  updated_at: string
}

export function useMembers() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      
      // Use API route instead of direct Supabase
      const response = await fetch('/api/members')
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch members')
      }
      
      setMembers(result.data || [])
      
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  const createMember = async (member: Partial<Member>) => {
    try {
      // Use API route instead of direct Supabase
      const response = await fetch('/api/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(member)
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create member')
      }
      
      // Add to local state
      setMembers([result.data, ...members])
      return { data: result.data, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  }

  const updateMember = async (id: string, updates: Partial<Member>) => {
    try {
      const response = await fetch(`/api/members/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update member')
      }
      
      setMembers(members.map(m => m.id === id ? result.data : m))
      return { data: result.data, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  }

  const deleteMember = async (id: string) => {
    try {
      const response = await fetch(`/api/members/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to delete member')
      }
      
      setMembers(members.filter(m => m.id !== id))
      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  }

  return {
    members,
    loading,
    error,
    fetchMembers,
    createMember,
    updateMember,
    deleteMember,
  }
}
