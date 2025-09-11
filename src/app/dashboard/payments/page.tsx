'use client'

import { useState, useEffect } from 'react'
import { usePayments } from '@/hooks/usePayments'
import { useMembers } from '@/hooks/useMembers'
import { useInvoices } from '@/hooks/useInvoices'
import { 
  DollarSign,
  Plus,
  Download,
  Send,
  Search,
  Filter,
  CreditCard,
  Receipt,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Eye,
  MoreVertical,
  Printer,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DibsCard } from '@/components/dibs/DibsCard'
import { DibsStats } from '@/components/dibs/DibsStats'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AddPaymentForm } from '@/components/payments/AddPaymentForm'
import { CreateInvoiceForm } from '@/components/invoices/CreateInvoiceForm'
import { PrintWatermark } from '@/components/ui/watermark'

// Using dynamic data from hooks - no mock data needed

export default function PaymentsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('payments')
  const [selectedMember, setSelectedMember] = useState<string>('all')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)

  // Hooks
  const { payments, loading: paymentsLoading, error: paymentsError, fetchPayments, calculateStats } = usePayments()
  const { members, fetchMembers } = useMembers()
  const { invoices, loading: invoicesLoading, error: invoicesError, fetchInvoices } = useInvoices()

  // Load data on mount
  useEffect(() => {
    fetchMembers()
    fetchInvoices()
  }, [])

  const getStatusBadge = (status: string) => {
    const variants = {
      paid: { icon: CheckCircle, class: 'bg-green-100 text-green-700 border-green-200' },
      completed: { icon: CheckCircle, class: 'bg-green-100 text-green-700 border-green-200' },
      pending: { icon: Clock, class: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      overdue: { icon: AlertCircle, class: 'bg-red-100 text-red-700 border-red-200' },
      cancelled: { icon: XCircle, class: 'bg-gray-100 text-gray-700 border-gray-200' },
      failed: { icon: XCircle, class: 'bg-red-100 text-red-700 border-red-200' },
    }
    const variant = variants[status as keyof typeof variants]
    const Icon = variant?.icon
    
    return (
      <Badge className={`${variant?.class} gap-1 font-medium`}>
        {Icon && <Icon className="h-3 w-3" />}
        {status}
      </Badge>
    )
  }

  const getMethodIcon = (method: string) => {
    if (method === 'Credit Card') return <CreditCard className="h-4 w-4" />
    if (method === 'PayPal') return <DollarSign className="h-4 w-4" />
    return <DollarSign className="h-4 w-4" />
  }

  // Calculate stats from real data
  const stats = calculateStats()
  
  // Filter payments based on search and status
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = !searchQuery || 
      payment.members?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.transaction_id?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter
    const matchesMember = selectedMember === 'all' || payment.member_id === selectedMember
    
    return matchesSearch && matchesStatus && matchesMember
  })

  // Filter invoices
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = searchQuery === '' || 
      invoice.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.members?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
    const matchesMember = selectedMember === 'all' || invoice.member_id === selectedMember
    
    return matchesSearch && matchesStatus && matchesMember
  })

  // Filter transactions (payments) for transaction tab
  const filteredTransactions = payments.filter(payment => {
    const matchesSearch = !searchQuery || 
      payment.members?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesSearch
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Payments & Billing
          </h1>
          <p className="text-gray-600 mt-1">Manage invoices, transactions and payment tracking</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline"
            onClick={() => setShowPaymentModal(true)}
            className="border-blue-200 text-blue-600 hover:bg-blue-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Record Payment
          </Button>
          <Button 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => setShowInvoiceModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <DibsStats
          title="Total Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          change={15}
          changeLabel="vs last month"
          icon={<DollarSign className="h-6 w-6" />}
          variant="success"
        />
        <DibsStats
          title="This Month"
          value={`₹${stats.thisMonth.toLocaleString()}`}
          change={8}
          changeLabel="vs last month"
          icon={<TrendingUp className="h-6 w-6" />}
          variant="primary"
        />
        <DibsStats
          title="Pending"
          value={`₹${stats.pendingAmount.toLocaleString()}`}
          icon={<Clock className="h-6 w-6" />}
          variant="warning"
        />
        <DibsStats
          title="Completed"
          value={stats.completedCount.toString()}
          icon={<CheckCircle className="h-6 w-6" />}
          variant="success"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full sm:w-auto grid-cols-3 sm:inline-flex">
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-4">
          {/* Filters */}
          <DibsCard className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search payments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedMember} onValueChange={setSelectedMember}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Members</SelectItem>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </DibsCard>

          {/* Loading State */}
          {paymentsLoading && (
            <DibsCard className="p-8 text-center">
              <div className="flex items-center justify-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Loading payments...
              </div>
            </DibsCard>
          )}

          {/* Error State */}
          {paymentsError && (
            <DibsCard className="p-4">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-red-700">Error: {paymentsError}</span>
                </div>
              </div>
            </DibsCard>
          )}

          {/* Payments List */}
          {!paymentsLoading && !paymentsError && (
            <DibsCard className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-4 font-medium text-gray-700">Payment ID</th>
                      <th className="text-left p-4 font-medium text-gray-700">Member</th>
                      <th className="text-left p-4 font-medium text-gray-700">Amount</th>
                      <th className="text-left p-4 font-medium text-gray-700">Status</th>
                      <th className="text-left p-4 font-medium text-gray-700">Method</th>
                      <th className="text-left p-4 font-medium text-gray-700">Date</th>
                      <th className="text-left p-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-gray-500">
                          No payments found. {payments.length === 0 ? 'Record your first payment!' : 'Try adjusting your filters.'}
                        </td>
                      </tr>
                    ) : (
                      filteredPayments.map((payment) => (
                        <tr key={payment.id} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Receipt className="h-4 w-4 text-gray-400" />
                              <span className="font-medium text-gray-900 text-sm">
                                {payment.transaction_id || payment.id.slice(0, 8)}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div>
                              <div className="font-medium text-gray-900">{payment.members?.full_name || 'Unknown Member'}</div>
                              <div className="text-sm text-gray-500">{payment.members?.membership_type || 'N/A'}</div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="font-semibold text-gray-900">₹{payment.amount.toLocaleString()}</div>
                          </td>
                          <td className="p-4">
                            {getStatusBadge(payment.status)}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {getMethodIcon(payment.payment_method)}
                              <span className="text-sm text-gray-600 capitalize">{payment.payment_method.replace('_', ' ')}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm text-gray-600">{payment.payment_date}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(payment.created_at).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="p-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="h-4 w-4 mr-2" />
                                  Download Receipt
                                </DropdownMenuItem>
                                {payment.status === 'completed' && (
                                  <DropdownMenuItem>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Issue Refund
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </DibsCard>
          )}
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-4">
          {/* Filters */}
          <DibsCard className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search invoices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </DibsCard>

          {/* Invoices List */}
          <DibsCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-700">Invoice ID</th>
                    <th className="text-left p-4 font-medium text-gray-700">Member</th>
                    <th className="text-left p-4 font-medium text-gray-700">Amount</th>
                    <th className="text-left p-4 font-medium text-gray-700">Status</th>
                    <th className="text-left p-4 font-medium text-gray-700">Due Date</th>
                    <th className="text-left p-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoicesLoading ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center">
                        <div className="text-gray-500">Loading invoices...</div>
                      </td>
                    </tr>
                  ) : invoicesError ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center">
                        <div className="text-red-500">Error loading invoices: {invoicesError}</div>
                      </td>
                    </tr>
                  ) : filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center">
                        <div className="text-gray-500">No invoices found</div>
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{invoice.invoice_number}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="font-medium text-gray-900">{invoice.members?.full_name || 'Unknown Member'}</div>
                          <div className="text-sm text-gray-500">{invoice.members?.membership_type || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-gray-900">₹{invoice.amount?.toLocaleString()}</div>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(invoice.status)}
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-600">{new Date(invoice.due_date).toLocaleDateString()}</div>
                        {invoice.paid_date && (
                          <div className="text-xs text-gray-500">Paid: {new Date(invoice.paid_date).toLocaleDateString()}</div>
                        )}
                      </td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Send className="h-4 w-4 mr-2" />
                              Send Reminder
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Printer className="h-4 w-4 mr-2" />
                              Print
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Download PDF
                            </DropdownMenuItem>
                            {invoice.status === 'paid' && (
                              <DropdownMenuItem>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Issue Refund
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                  )}
                </tbody>
              </table>
            </div>
          </DibsCard>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          {/* Filters */}
          <DibsCard className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </DibsCard>

          {/* Transactions List */}
          <DibsCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-700">Transaction ID</th>
                    <th className="text-left p-4 font-medium text-gray-700">Date & Time</th>
                    <th className="text-left p-4 font-medium text-gray-700">Member</th>
                    <th className="text-left p-4 font-medium text-gray-700">Type</th>
                    <th className="text-left p-4 font-medium text-gray-700">Amount</th>
                    <th className="text-left p-4 font-medium text-gray-700">Method</th>
                    <th className="text-left p-4 font-medium text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Receipt className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{transaction.transaction_id || `PAY-${transaction.id.slice(0, 8)}`}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-600">{new Date(transaction.payment_date || transaction.created_at).toLocaleDateString()}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-gray-900">{transaction.members?.full_name || 'Unknown Member'}</div>
                      </td>
                      <td className="p-4">
                        <Badge className="bg-blue-100 text-blue-700">
                          Payment
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-green-600">
                          +₹{transaction.amount?.toLocaleString()}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {getMethodIcon(transaction.payment_method)}
                          <span className="text-sm text-gray-600 capitalize">{transaction.payment_method?.replace('_', ' ')}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(transaction.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DibsCard>
        </TabsContent>
      </Tabs>

      {/* Payment Modal */}
      {showPaymentModal && (
        <AddPaymentForm
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => {
            // Refresh payments data
            fetchPayments()
          }}
        />
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && (
        <CreateInvoiceForm
          onClose={() => setShowInvoiceModal(false)}
          onSuccess={() => {
            // Refresh invoices and payments data, then switch to invoices tab
            fetchInvoices()
            fetchPayments()
            setActiveTab('invoices')
            setShowInvoiceModal(false)
          }}
        />
      )}

      {/* Print watermark for invoices/receipts */}
      <PrintWatermark />
    </div>
  )
}
