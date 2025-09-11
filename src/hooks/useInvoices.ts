import { useState, useEffect } from 'react'

export interface Invoice {
  id: string
  trainer_id: string
  member_id: string
  invoice_number: string
  amount: number
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  due_date: string
  paid_date: string | null
  items: InvoiceItem[]
  tax_amount: number
  discount_amount: number
  notes: string
  created_at: string
  updated_at: string
  members?: {
    id: string
    full_name: string
    email: string
    membership_type: string
  }
}

export interface InvoiceItem {
  description: string
  amount: number
  quantity: number
}

export interface CreateInvoiceData {
  member_id: string
  amount: number
  due_date: string
  items?: InvoiceItem[]
  notes?: string
  tax_amount?: number
  discount_amount?: number
}

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInvoices = async (filters?: { memberId?: string; status?: string }) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (filters?.memberId) params.append('memberId', filters.memberId)
      if (filters?.status) params.append('status', filters.status)

      const response = await fetch(`/api/invoices?${params.toString()}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch invoices')
      }

      setInvoices(result.data || [])
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching invoices:', err)
    } finally {
      setLoading(false)
    }
  }

  const createInvoice = async (invoiceData: CreateInvoiceData) => {
    try {
      setError(null)
      
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create invoice')
      }

      // Refresh invoices list
      await fetchInvoices()

      return { data: result.data, error: null }
    } catch (err: any) {
      setError(err.message)
      return { data: null, error: err.message }
    }
  }

  const updateInvoiceStatus = async (invoiceId: string, status: string) => {
    try {
      setError(null)
      
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update invoice')
      }

      // Update local state
      setInvoices(prev => 
        prev.map(invoice => 
          invoice.id === invoiceId 
            ? { ...invoice, status: status as any }
            : invoice
        )
      )

      return { data: result.data, error: null }
    } catch (err: any) {
      setError(err.message)
      return { data: null, error: err.message }
    }
  }

  const getInvoicesByMember = (memberId: string) => {
    return invoices.filter(invoice => invoice.member_id === memberId)
  }

  const getInvoiceStats = () => {
    const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.amount, 0)
    const paidAmount = invoices
      .filter(invoice => invoice.status === 'paid')
      .reduce((sum, invoice) => sum + invoice.amount, 0)
    const pendingAmount = invoices
      .filter(invoice => ['sent', 'draft'].includes(invoice.status))
      .reduce((sum, invoice) => sum + invoice.amount, 0)
    const overdueAmount = invoices
      .filter(invoice => invoice.status === 'overdue')
      .reduce((sum, invoice) => sum + invoice.amount, 0)

    return {
      total: invoices.length,
      totalAmount,
      paidAmount,
      pendingAmount,
      overdueAmount,
      draftCount: invoices.filter(i => i.status === 'draft').length,
      sentCount: invoices.filter(i => i.status === 'sent').length,
      paidCount: invoices.filter(i => i.status === 'paid').length,
      overdueCount: invoices.filter(i => i.status === 'overdue').length,
    }
  }

  // Load invoices on mount
  useEffect(() => {
    fetchInvoices()
  }, [])

  return {
    invoices,
    loading,
    error,
    fetchInvoices,
    createInvoice,
    updateInvoiceStatus,
    getInvoicesByMember,
    getInvoiceStats,
  }
}