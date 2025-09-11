'use client'

import { useState, useEffect } from 'react'
import { useMembers } from '@/hooks/useMembers'
import { X, User, Mail, Phone, CreditCard, Shield, FileText } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { SubtleWatermark } from '@/components/ui/watermark'

interface AddMemberFormProps {
  onClose: () => void
  onSuccess?: () => void
}

export function AddMemberForm({ onClose, onSuccess }: AddMemberFormProps) {
  const { createMember } = useMembers()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState<{
    full_name: string
    email: string
    phone: string
    status: 'active' | 'paused' | 'expired'
    membership_type: 'basic' | 'premium' | 'elite' | 'custom'
    monthly_fees: string
    notes: string
  }>({
    full_name: '',
    email: 'noemail@example.com',
    phone: '',
    status: 'active',
    membership_type: 'basic',
    monthly_fees: '',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await createMember({
        ...formData,
        monthly_fees: formData.monthly_fees ? parseFloat(formData.monthly_fees) : 0
      })
      
      if (error) throw error
      
      // Success animation
      setSuccess(true)
      
      // Wait for animation then close
      setTimeout(() => {
        onSuccess?.()
        onClose()
      }, 1000)
      
    } catch (err: any) {
      setError(err.message || 'Failed to add member')
    } finally {
      setLoading(false)
    }
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

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center z-50 animate-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-member-title"
      aria-describedby="add-member-description"
    >
      {/* Mobile: Full screen bottom sheet, Desktop: Centered modal */}
      <div className="gradient-surface w-full h-full sm:h-auto sm:max-w-lg lg:max-w-2xl sm:rounded-2xl shadow-strong animate-in border border-white/20 sm:max-h-[85vh] overflow-hidden slide-in-from-bottom sm:zoom-in duration-300 sm:m-4">
        {/* Header - Sticky on mobile */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-lg border-b border-slate-200/50 px-4 sm:px-8 py-4 sm:py-6 sm:rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex-1 pr-4">
              <h2 id="add-member-title" className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">Add New Member</h2>
              <p id="add-member-description" className="text-xs sm:text-sm text-slate-600 mt-1">Fill in the details below to add a new member</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/60 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-soft min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0"
              aria-label="Close modal"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Scrollable form content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 sm:py-6">
          {error && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200/50 text-red-700 rounded-xl text-sm animate-in shadow-soft">
              <div className="flex items-center gap-2">
                <span className="text-red-500">⚠️</span>
                <span className="font-semibold">Error:</span> {error}
              </div>
            </div>
          )}

          {success && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 text-green-700 rounded-xl text-sm animate-in shadow-soft">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span className="font-semibold">Success!</span> Member added successfully
              </div>
            </div>
          )}

          <form id="add-member-form" onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 pb-4 sm:pb-8">
          {/* Personal Information Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">Personal Information</h3>
            
            <div>
              <label htmlFor="full_name" className="block text-sm sm:text-base font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <User className="h-4 w-4 text-slate-500" />
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="full_name"
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-4 py-4 sm:py-3 text-base border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-slate-300 bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md min-h-[48px]"
                placeholder="John Doe"
              />
            </div>

            {/* Mobile: Stack vertically, Desktop: Grid layout */}
            <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm sm:text-base font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-500" />
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  inputMode="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-4 sm:py-3 text-base border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-slate-300 bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md min-h-[48px]"
                  placeholder="Enter email or leave default"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm sm:text-base font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-500" />
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-4 sm:py-3 text-base border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-slate-300 bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md min-h-[48px]"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
          </div>

          {/* Membership & Billing Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">Membership & Billing</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="membership_type" className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-slate-500" />
                  Membership Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="membership_type"
                  value={formData.membership_type}
                  onChange={(e) => setFormData({ ...formData, membership_type: e.target.value as 'basic' | 'premium' | 'elite' | 'custom' })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-slate-300 bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md"
                >
                  <option value="basic">Basic Plan</option>
                  <option value="premium">Premium Plan</option>
                  <option value="elite">Elite Plan</option>
                  <option value="custom">Custom Plan</option>
                </select>
              </div>

              <div>
                <label htmlFor="monthly_fees" className="block text-sm font-semibold text-slate-700 mb-2">
                  Monthly Fees <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-medium">₹</span>
                  <input
                    id="monthly_fees"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.monthly_fees}
                    onChange={(e) => setFormData({ ...formData, monthly_fees: e.target.value })}
                    className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-slate-300 bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md"
                    placeholder="99.99"
                  />
                </div>
              </div>
            </div>

            <div className="pb-4">
              <label htmlFor="status" className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4 text-slate-500" />
                Account Status
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'paused' | 'expired' })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-slate-300 bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md"
              >
                <option value="active">✅ Active</option>
                <option value="paused">⏸️ Paused</option>
                <option value="expired">❌ Expired</option>
              </select>
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">Additional Information</h3>
            
            <div>
              <label htmlFor="notes" className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-500" />
                Additional Notes <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-slate-300 bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md resize-none"
                rows={3}
                placeholder="Medical conditions, dietary restrictions, goals, etc..."
              />
            </div>
          </div>

          </form>
        </div>

        {/* Sticky footer for mobile with buttons */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-lg border-t border-slate-200/50 px-4 sm:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              type="button"
              onClick={onClose}
              className="order-2 sm:order-1 flex-1 px-6 py-4 sm:py-3 border-2 border-slate-200 text-slate-700 rounded-xl hover:bg-white hover:border-slate-300 hover:shadow-soft transition-all duration-200 bg-white/70 backdrop-blur-sm font-semibold min-h-[52px] text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="add-member-form"
              disabled={loading || success}
              className={`order-1 sm:order-2 flex-1 px-6 py-4 sm:py-3 text-white rounded-xl transition-all disabled:cursor-not-allowed hover:shadow-glow hover:scale-[1.02] flex items-center justify-center gap-2 font-semibold min-h-[52px] text-base ${
                success 
                  ? 'bg-gradient-to-r from-green-500 to-green-600' 
                  : loading
                    ? 'bg-gradient-to-r from-blue-400 to-green-400 opacity-75'
                    : 'bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700'
              }`}
            >
              {success ? (
                <>
                  <span className="text-green-100">✅</span>
                  <span>Member Added!</span>
                </>
              ) : loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Adding Member...
                </>
              ) : (
                <>
                  <span>Add Member</span>
                  <span className="text-white/80">✨</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Subtle watermark for forms */}
        <SubtleWatermark />
      </div>
    </div>
  )
}
