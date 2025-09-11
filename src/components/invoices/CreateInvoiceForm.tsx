'use client'

import { useState, useEffect } from 'react'
import { useInvoices, CreateInvoiceData, InvoiceItem } from '@/hooks/useInvoices'
import { useMembers } from '@/hooks/useMembers'
import { X, FileText, User, Calendar, DollarSign, Plus, Trash2 } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { SubtleWatermark } from '@/components/ui/watermark'

interface CreateInvoiceFormProps {
  onClose: () => void
  onSuccess?: () => void
  preselectedMemberId?: string
}

export function CreateInvoiceForm({ onClose, onSuccess, preselectedMemberId }: CreateInvoiceFormProps) {
  const { createInvoice } = useInvoices()
  const { members, loading: membersLoading, fetchMembers } = useMembers()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState<CreateInvoiceData>({
    member_id: preselectedMemberId || '',
    amount: 0,
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    items: [
      { description: 'Monthly Membership', amount: 0, quantity: 1 }
    ],
    notes: '',
    tax_amount: 0,
    discount_amount: 0,
  })

  // Load members on mount
  useEffect(() => {
    if (members.length === 0) {
      fetchMembers()
    }
  }, [])

  // Auto-populate amount when member is selected
  useEffect(() => {
    if (formData.member_id) {
      const selectedMember = members.find(m => m.id === formData.member_id)
      if (selectedMember && selectedMember.monthly_fees && formData.amount === 0) {
        const membershipAmount = selectedMember.monthly_fees
        setFormData(prev => ({
          ...prev,
          amount: membershipAmount,
          items: [
            {
              description: `${selectedMember.membership_type} Monthly Membership - ${selectedMember.full_name}`,
              amount: membershipAmount,
              quantity: 1
            }
          ]
        }))
      }
    }
  }, [formData.member_id, members])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error: invoiceError } = await createInvoice(formData)
      
      if (invoiceError) throw new Error(invoiceError)
      
      // Success animation
      setSuccess(true)
      setTimeout(() => {
        onSuccess?.()
        onClose()
      }, 1000)
      
    } catch (err: any) {
      setError(err.message || 'Failed to create invoice')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ 
      ...prev, 
      [name]: ['amount', 'tax_amount', 'discount_amount'].includes(name) 
        ? parseFloat(value) || 0 
        : value 
    }))
  }

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...formData.items!]
    newItems[index] = {
      ...newItems[index],
      [field]: field === 'amount' || field === 'quantity' ? parseFloat(value.toString()) || 0 : value
    }
    
    // Update total amount
    const totalAmount = newItems.reduce((sum, item) => sum + (item.amount * item.quantity), 0)
    
    setFormData(prev => ({
      ...prev,
      items: newItems,
      amount: totalAmount + prev.tax_amount! - prev.discount_amount!
    }))
  }

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...(prev.items || []), { description: '', amount: 0, quantity: 1 }]
    }))
  }

  const removeItem = (index: number) => {
    if (formData.items!.length > 1) {
      const newItems = formData.items!.filter((_, i) => i !== index)
      const totalAmount = newItems.reduce((sum, item) => sum + (item.amount * item.quantity), 0)
      
      setFormData(prev => ({
        ...prev,
        items: newItems,
        amount: totalAmount + prev.tax_amount! - prev.discount_amount!
      }))
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

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center animate-in zoom-in duration-300">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Invoice Created!</h3>
          <p className="text-gray-600">Invoice has been successfully created and saved.</p>
        </div>
      </div>
    )
  }

  const subtotal = formData.items?.reduce((sum, item) => sum + (item.amount * item.quantity), 0) || 0
  const totalAmount = subtotal + (formData.tax_amount || 0) - (formData.discount_amount || 0)

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/20 backdrop-blur-sm animate-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-invoice-title"
    >
      {/* Mobile: Full screen bottom sheet, Desktop: Centered modal */}
      <div className="bg-white w-full h-full sm:h-auto sm:max-w-2xl sm:rounded-2xl shadow-2xl animate-in border border-white/20 sm:max-h-[90vh] overflow-hidden slide-in-from-bottom sm:zoom-in duration-300 sm:m-4">
        {/* Header - Sticky on mobile */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-lg border-b border-gray-100 px-4 sm:px-6 py-4 sm:py-6 sm:rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 pr-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shrink-0">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h2 id="create-invoice-title" className="text-xl sm:text-2xl font-bold text-gray-900">Create Invoice</h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5">Generate invoice for member</p>
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

          <form id="create-invoice-form" onSubmit={handleSubmit} className="space-y-6 pb-4 sm:pb-8">
            {/* Member Selection */}
            <div>
              <label htmlFor="member_id" className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <User className="h-4 w-4 text-slate-500" />
                Member <span className="text-red-500">*</span>
              </label>
              {membersLoading ? (
                <div className="w-full px-4 py-4 text-base rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  Loading members...
                </div>
              ) : (
                <select
                  id="member_id"
                  name="member_id"
                  value={formData.member_id}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-4 text-base rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 font-medium min-h-[48px]"
                >
                  <option value="">Select a member</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.full_name} - {member.membership_type} (₹{member.monthly_fees})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Due Date */}
            <div>
              <label htmlFor="due_date" className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-500" />
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                id="due_date"
                name="due_date"
                type="date"
                value={formData.due_date}
                onChange={handleChange}
                required
                className="w-full px-4 py-4 text-base rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 font-medium min-h-[48px]"
              />
            </div>

            {/* Invoice Items */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-slate-500" />
                  Invoice Items
                </label>
                <button
                  type="button"
                  onClick={addItem}
                  className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium"
                >
                  <Plus className="h-4 w-4" />
                  Add Item
                </button>
              </div>
              
              <div className="space-y-4">
                {formData.items?.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">Item {index + 1}</span>
                      {formData.items!.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-500 hover:text-red-600 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="md:col-span-2">
                        <input
                          type="text"
                          placeholder="Description"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <input
                            type="number"
                            placeholder="Amount"
                            value={item.amount || ''}
                            onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            placeholder="Qty"
                            value={item.quantity || ''}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            min="1"
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tax and Discount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="tax_amount" className="block text-sm font-semibold text-slate-700 mb-2">
                  Tax Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-medium">₹</span>
                  <input
                    id="tax_amount"
                    name="tax_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.tax_amount || ''}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 text-base rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 font-medium"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="discount_amount" className="block text-sm font-semibold text-slate-700 mb-2">
                  Discount Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-medium">₹</span>
                  <input
                    id="discount_amount"
                    name="discount_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.discount_amount || ''}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 text-base rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-semibold text-slate-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Additional notes for the invoice..."
                className="w-full px-4 py-3 text-base rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none font-medium"
              />
            </div>

            {/* Total Summary */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax:</span>
                <span>₹{(formData.tax_amount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Discount:</span>
                <span>-₹{(formData.discount_amount || 0).toFixed(2)}</span>
              </div>
              <hr className="border-gray-300" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </form>
        </div>

        {/* Sticky footer with buttons */}
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
              form="create-invoice-form"
              disabled={loading || !formData.member_id || totalAmount <= 0}
              className={`order-1 sm:order-2 flex-1 px-6 py-4 sm:py-3 text-white rounded-xl transition-all disabled:cursor-not-allowed hover:shadow-glow hover:scale-[1.02] flex items-center justify-center gap-2 font-semibold min-h-[52px] text-base ${
                loading || !formData.member_id || totalAmount <= 0
                  ? 'bg-gray-400'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
              }`}
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Creating...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Create Invoice
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