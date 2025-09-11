/**
 * PostgREST API Service
 * 
 * This service provides direct access to the database through PostgREST,
 * which is built into Supabase. All queries use the Supabase client
 * which automatically handles authentication and RLS policies.
 */

import { createClient } from '@/lib/supabase/client'
import { SupabaseClient } from '@supabase/supabase-js'

export class PostgRESTService {
  private supabase: SupabaseClient

  constructor() {
    this.supabase = createClient()
  }

  // ============ MEMBERS ============
  
  /**
   * Get all members with optional filters
   */
  async getMembers(filters?: {
    status?: 'active' | 'paused' | 'expired'
    search?: string
    limit?: number
    offset?: number
  }) {
    let query = this.supabase
      .from('members')
      .select('*', { count: 'exact' })
      
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    
    if (filters?.search) {
      query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
    }
    
    if (filters?.limit) {
      query = query.limit(filters.limit)
    }
    
    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }
    
    return query.order('created_at', { ascending: false })
  }

  /**
   * Get a single member with related data
   */
  async getMember(id: string) {
    return this.supabase
      .from('members')
      .select(`
        *,
        member_plans (
          *,
          plan:plans(*)
        ),
        sessions (
          id,
          title,
          start_time,
          end_time,
          status
        )
      `)
      .eq('id', id)
      .single()
  }

  /**
   * Create a new member
   */
  async createMember(data: any) {
    return this.supabase
      .from('members')
      .insert(data)
      .select()
      .single()
  }

  /**
   * Update a member
   */
  async updateMember(id: string, data: any) {
    return this.supabase
      .from('members')
      .update(data)
      .eq('id', id)
      .select()
      .single()
  }

  /**
   * Delete a member (soft delete if configured)
   */
  async deleteMember(id: string) {
    return this.supabase
      .from('members')
      .delete()
      .eq('id', id)
  }

  // ============ SESSIONS ============
  
  /**
   * Get sessions with filters
   */
  async getSessions(filters?: {
    startDate?: string
    endDate?: string
    memberId?: string
    status?: string
    trainerId?: string
  }) {
    let query = this.supabase
      .from('sessions')
      .select(`
        *,
        member:members(full_name, email, phone),
        participants:session_participants(
          *,
          member:members(full_name, email)
        )
      `)
    
    if (filters?.startDate) {
      query = query.gte('start_time', filters.startDate)
    }
    
    if (filters?.endDate) {
      query = query.lte('end_time', filters.endDate)
    }
    
    if (filters?.memberId) {
      query = query.eq('member_id', filters.memberId)
    }
    
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    
    if (filters?.trainerId) {
      query = query.eq('trainer_id', filters.trainerId)
    }
    
    return query.order('start_time', { ascending: true })
  }

  /**
   * Create a new session
   */
  async createSession(data: any) {
    return this.supabase
      .from('sessions')
      .insert(data)
      .select()
      .single()
  }

  /**
   * Update a session
   */
  async updateSession(id: string, data: any) {
    return this.supabase
      .from('sessions')
      .update(data)
      .eq('id', id)
      .select()
      .single()
  }

  /**
   * Delete a session
   */
  async deleteSession(id: string) {
    return this.supabase
      .from('sessions')
      .delete()
      .eq('id', id)
  }

  // ============ PAYMENTS ============
  
  /**
   * Get payments with filters
   */
  async getPayments(filters?: {
    memberId?: string
    status?: string
    startDate?: string
    endDate?: string
  }) {
    let query = this.supabase
      .from('payments')
      .select(`
        *,
        member:members(full_name, email),
        invoice:invoices(invoice_number)
      `)
    
    if (filters?.memberId) {
      query = query.eq('member_id', filters.memberId)
    }
    
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    
    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate)
    }
    
    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate)
    }
    
    return query.order('created_at', { ascending: false })
  }

  /**
   * Process a payment
   */
  async processPayment(data: any) {
    // Start a transaction
    const payment = await this.supabase
      .from('payments')
      .insert({
        ...data,
        status: 'pending'
      })
      .select()
      .single()
    
    if (payment.error) return payment
    
    // In production, integrate with payment gateway here
    // For now, just mark as completed
    return this.supabase
      .from('payments')
      .update({ status: 'completed', paid_at: new Date().toISOString() })
      .eq('id', payment.data.id)
      .select()
      .single()
  }

  // ============ INVOICES ============
  
  /**
   * Get invoices with filters
   */
  async getInvoices(filters?: {
    memberId?: string
    status?: string
    startDate?: string
    endDate?: string
  }) {
    let query = this.supabase
      .from('invoices')
      .select(`
        *,
        member:members(full_name, email, phone),
        payments(id, amount, status, paid_at)
      `)
    
    if (filters?.memberId) {
      query = query.eq('member_id', filters.memberId)
    }
    
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    
    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate)
    }
    
    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate)
    }
    
    return query.order('created_at', { ascending: false })
  }

  /**
   * Create an invoice
   */
  async createInvoice(data: any) {
    // Generate invoice number using RPC function if available
    // or use a simple format
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`
    
    return this.supabase
      .from('invoices')
      .insert({
        ...data,
        invoice_number: invoiceNumber,
        status: 'pending'
      })
      .select()
      .single()
  }

  // ============ REAL-TIME SUBSCRIPTIONS ============
  
  /**
   * Subscribe to member changes
   */
  subscribeMembersChanges(callback: (payload: any) => void) {
    return this.supabase
      .channel('members-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'members' },
        callback
      )
      .subscribe()
  }

  /**
   * Subscribe to session changes
   */
  subscribeSessionsChanges(callback: (payload: any) => void) {
    return this.supabase
      .channel('sessions-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'sessions' },
        callback
      )
      .subscribe()
  }

  /**
   * Subscribe to payment changes
   */
  subscribePaymentsChanges(memberId: string, callback: (payload: any) => void) {
    return this.supabase
      .channel(`payments-${memberId}`)
      .on('postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'payments',
          filter: `member_id=eq.${memberId}`
        },
        callback
      )
      .subscribe()
  }

  // ============ RPC FUNCTIONS ============
  
  /**
   * Call a database function (RPC)
   */
  async callRPC(functionName: string, params?: any) {
    return this.supabase.rpc(functionName, params)
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    // This could be an RPC function that aggregates data
    const [members, sessions, payments] = await Promise.all([
      this.supabase.from('members').select('*', { count: 'exact', head: true }),
      this.supabase.from('sessions').select('*', { count: 'exact', head: true }),
      this.supabase.from('payments').select('amount').eq('status', 'completed'),
    ])
    
    return {
      totalMembers: members.count || 0,
      totalSessions: sessions.count || 0,
      totalRevenue: payments.data?.reduce((sum, p) => sum + p.amount, 0) || 0,
    }
  }

  // ============ BATCH OPERATIONS ============
  
  /**
   * Bulk insert members
   */
  async bulkInsertMembers(members: any[]) {
    return this.supabase
      .from('members')
      .insert(members)
      .select()
  }

  /**
   * Bulk update member status
   */
  async bulkUpdateMemberStatus(memberIds: string[], status: string) {
    return this.supabase
      .from('members')
      .update({ status })
      .in('id', memberIds)
      .select()
  }
}

// Export singleton instance
export const postgrest = new PostgRESTService()
