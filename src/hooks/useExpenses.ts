'use client'

import { useState, useEffect } from 'react'

export interface Expense {
  id: string
  trainer_id?: string
  category: 'equipment' | 'rent' | 'utilities' | 'marketing' | 'food' | 'transport' | 'other'
  description: string
  amount: number
  expense_date: string
  receipt_url?: string
  created_at: string
  updated_at: string
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    try {
      setLoading(true)
      
      // Use API route instead of direct Supabase
      const response = await fetch('/api/expenses')
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch expenses')
      }
      
      setExpenses(result.data || [])
      
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  const createExpense = async (expense: Partial<Expense>) => {
    try {
      // Use API route instead of direct Supabase
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expense)
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create expense')
      }
      
      // Add to local state
      setExpenses([result.data, ...expenses])
      return { data: result.data, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  }

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update expense')
      }
      
      setExpenses(expenses.map(e => e.id === id ? result.data : e))
      return { data: result.data, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  }

  const deleteExpense = async (id: string) => {
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to delete expense')
      }
      
      setExpenses(expenses.filter(e => e.id !== id))
      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  }

  // Calculate totals
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  
  const thisMonthExpenses = expenses
    .filter(expense => {
      const expenseDate = new Date(expense.expense_date)
      const now = new Date()
      return expenseDate.getMonth() === now.getMonth() && 
             expenseDate.getFullYear() === now.getFullYear()
    })
    .reduce((sum, expense) => sum + expense.amount, 0)

  const expensesByCategory = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount
    return acc
  }, {} as Record<string, number>)

  return {
    expenses,
    loading,
    error,
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    totalExpenses,
    thisMonthExpenses,
    expensesByCategory,
  }
}