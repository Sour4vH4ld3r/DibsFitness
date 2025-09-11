'use client'

import { useState, useEffect } from 'react'
import { useExpenses } from '@/hooks/useExpenses'
import { X, Receipt, DollarSign, Calendar, Tag, FileText } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface AddExpenseFormProps {
  onClose: () => void
  onSuccess?: () => void
}

const categories = [
  { value: 'equipment', label: 'Equipment', description: 'Gym equipment, weights, mats' },
  { value: 'rent', label: 'Rent', description: 'Gym space, office rent' },
  { value: 'utilities', label: 'Utilities', description: 'Electricity, water, internet' },
  { value: 'marketing', label: 'Marketing', description: 'Advertising, promotions' },
  { value: 'food', label: 'Food & Supplements', description: 'Meals, protein, supplements' },
  { value: 'transport', label: 'Transport', description: 'Travel, fuel, parking' },
  { value: 'other', label: 'Other', description: 'Miscellaneous expenses' },
]

export function AddExpenseForm({ onClose, onSuccess }: AddExpenseFormProps) {
  const { createExpense } = useExpenses()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState<{
    category: string
    description: string
    amount: string
    expense_date: string
  }>({
    category: 'other',
    description: '',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0], // Today's date
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await createExpense({
        ...formData,
        amount: parseFloat(formData.amount)
      })
      
      if (error) throw error
      
      // Success animation
      setSuccess(true)
      setTimeout(() => {
        onSuccess?.()
        onClose()
      }, 1000)
      
    } catch (err: any) {
      setError(err.message || 'Failed to create expense')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        onClose()
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [loading, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center animate-in zoom-in duration-300">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Receipt className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Expense Added!</h3>
          <p className="text-gray-600">Your expense has been successfully recorded.</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/20 backdrop-blur-sm animate-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-expense-title"
      aria-describedby="add-expense-description"
    >
      {/* Mobile: Full screen bottom sheet, Desktop: Centered modal */}
      <div className="bg-white w-full h-full sm:h-auto sm:max-w-lg lg:max-w-xl sm:rounded-2xl shadow-2xl animate-in border border-white/20 sm:max-h-[85vh] overflow-hidden slide-in-from-bottom sm:zoom-in duration-300 sm:m-4">
        {/* Header - Sticky on mobile */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-lg border-b border-gray-100 px-4 sm:px-6 py-4 sm:py-6 sm:rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 pr-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shrink-0">
                <Receipt className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h2 id="add-expense-title" className="text-xl sm:text-2xl font-bold text-gray-900">Add New Expense</h2>
                <p id="add-expense-description" className="text-xs sm:text-sm text-gray-600 mt-0.5">Track your business expenses</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable form content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <X className="h-3 w-3 text-white" />
                </div>
                <p className="text-red-700 font-medium text-sm sm:text-base">{error}</p>
              </div>
            </div>
          )}

          <form id="add-expense-form" onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 pb-4 sm:pb-8">

          <div className="space-y-4 sm:space-y-6">
            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm sm:text-base font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <Tag className="h-4 w-4 text-slate-500" />
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-4 sm:py-3 text-base rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 font-medium min-h-[48px]"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label} - {cat.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm sm:text-base font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-500" />
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={3}
                placeholder="e.g., Bought new dumbbells for gym"
                className="w-full px-4 py-4 sm:py-3 text-base rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none font-medium"
              />
            </div>

            {/* Amount */}
            <div>
              <label htmlFor="amount" className="block text-sm sm:text-base font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-slate-500" />
                Amount <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-medium">₹</span>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-4 sm:py-3 text-base rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 font-medium min-h-[48px]"
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label htmlFor="expense_date" className="block text-sm sm:text-base font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-500" />
                Date <span className="text-red-500">*</span>
              </label>
              <input
                id="expense_date"
                name="expense_date"
                type="date"
                value={formData.expense_date}
                onChange={handleChange}
                required
                className="w-full px-4 py-4 sm:py-3 text-base rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 font-medium min-h-[48px]"
              />
            </div>
          </div>

          </form>
        </div>

        {/* Sticky footer for mobile with buttons */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-lg border-t border-gray-100 px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              type="button"
              onClick={onClose}
              className="order-2 sm:order-1 flex-1 px-6 py-4 sm:py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 bg-white/70 backdrop-blur-sm font-semibold min-h-[52px] text-base"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="add-expense-form"
              disabled={loading || !formData.description || !formData.amount}
              className={`order-1 sm:order-2 flex-1 px-6 py-4 sm:py-3 text-white rounded-xl transition-all disabled:cursor-not-allowed hover:shadow-glow hover:scale-[1.02] flex items-center justify-center gap-2 font-semibold min-h-[52px] text-base ${
                loading || !formData.description || !formData.amount
                  ? 'bg-gray-400'
                  : 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700'
              }`}
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Adding...
                </>
              ) : (
                <>
                  <Receipt className="h-4 w-4" />
                  Add Expense
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}