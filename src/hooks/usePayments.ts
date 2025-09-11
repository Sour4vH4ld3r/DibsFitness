import { useState, useEffect } from 'react'

export interface Payment {
  id: string
  trainer_id: string
  member_id: string
  amount: number
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded'
  payment_method: 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'upi' | 'paypal' | 'other'
  payment_date: string
  description: string
  transaction_id?: string
  notes?: string
  created_at: string
  updated_at: string
  members?: {
    id: string
    full_name: string
    email: string
    membership_type: string
  }
}

export interface PaymentStats {
  totalRevenue: number
  thisMonth: number
  pendingAmount: number
  completedCount: number
  pendingCount: number
  failedCount: number
}

export interface CreatePaymentData {
  member_id: string
  amount: number
  status?: string
  payment_method?: string
  payment_date?: string
  description?: string
  transaction_id?: string
  notes?: string
}

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPayments = async (filters?: { memberId?: string; status?: string }) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (filters?.memberId) params.append('memberId', filters.memberId)
      if (filters?.status) params.append('status', filters.status)

      const response = await fetch(`/api/payments?${params.toString()}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch payments')
      }

      setPayments(result.data || [])
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching payments:', err)
    } finally {
      setLoading(false)
    }
  }

  const createPayment = async (paymentData: CreatePaymentData) => {
    try {
      setError(null)
      
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create payment')
      }

      // Refresh payments list
      await fetchPayments()

      return { data: result.data, error: null }
    } catch (err: any) {
      setError(err.message)
      return { data: null, error: err.message }
    }
  }

  const updatePaymentStatus = async (paymentId: string, status: string) => {
    try {
      setError(null)
      
      const response = await fetch(`/api/payments/${paymentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update payment')
      }

      // Update local state
      setPayments(prev => 
        prev.map(payment => 
          payment.id === paymentId 
            ? { ...payment, status: status as any }
            : payment
        )
      )

      return { data: result.data, error: null }
    } catch (err: any) {
      setError(err.message)
      return { data: null, error: err.message }
    }
  }

  const calculateStats = (): PaymentStats => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const completedPayments = payments.filter(p => p.status === 'completed')
    const pendingPayments = payments.filter(p => p.status === 'pending')
    const failedPayments = payments.filter(p => p.status === 'failed')

    const thisMonthPayments = completedPayments.filter(p => {
      const paymentDate = new Date(p.payment_date)
      return paymentDate.getMonth() === currentMonth && 
             paymentDate.getFullYear() === currentYear
    })

    return {
      totalRevenue: completedPayments.reduce((sum, p) => sum + p.amount, 0),
      thisMonth: thisMonthPayments.reduce((sum, p) => sum + p.amount, 0),
      pendingAmount: pendingPayments.reduce((sum, p) => sum + p.amount, 0),
      completedCount: completedPayments.length,
      pendingCount: pendingPayments.length,
      failedCount: failedPayments.length,
    }
  }

  const getPaymentsByMember = (memberId: string) => {
    return payments.filter(p => p.member_id === memberId)
  }

  const getMemberBalance = (memberId: string, monthlyFee: number) => {
    const memberPayments = getPaymentsByMember(memberId)
    const totalPaid = memberPayments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0)
    
    // Simple calculation - can be enhanced with invoice logic
    const now = new Date()
    const monthsSinceJoining = 3 // This should come from member data
    const totalDue = monthlyFee * monthsSinceJoining
    
    return {
      totalPaid,
      totalDue,
      balance: totalDue - totalPaid,
      isOverdue: totalDue > totalPaid
    }
  }

  // Load payments on mount
  useEffect(() => {
    fetchPayments()
  }, [])

  return {
    payments,
    loading,
    error,
    fetchPayments,
    createPayment,
    updatePaymentStatus,
    calculateStats,
    getPaymentsByMember,
    getMemberBalance,
  }
}