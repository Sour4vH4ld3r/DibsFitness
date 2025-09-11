'use client'

import { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  UserPlus, 
  MoreVertical, 
  Mail, 
  Phone,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  Eye,
  Trash2,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DibsCard } from '@/components/dibs/DibsCard'
import { useMembers } from '@/hooks/useMembers'
import { usePayments } from '@/hooks/usePayments'
import { AddMemberForm } from '@/components/members/AddMemberForm'
import { AddPaymentForm } from '@/components/payments/AddPaymentForm'
import { CreateInvoiceForm } from '@/components/invoices/CreateInvoiceForm'

export default function MembersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [showInvoiceForm, setShowInvoiceForm] = useState(false)
  const [selectedMemberForPayment, setSelectedMemberForPayment] = useState<string>('')
  const [selectedMemberForInvoice, setSelectedMemberForInvoice] = useState<string>('')
  
  const { members, loading, error, fetchMembers, deleteMember } = useMembers()
  const { getPaymentsByMember, getMemberBalance } = usePayments()

  const getMembershipBadge = (type?: string) => {
    const membershipType = type || 'basic'
    const styles = {
      basic: 'bg-muted text-muted-foreground',
      premium: 'bg-primary-100 text-primary-700',
      elite: 'bg-secondary-100 text-secondary-700',
      custom: 'bg-warning-100 text-warning-700',
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${styles[membershipType as keyof typeof styles] || styles.basic}`}>
        {membershipType}
      </span>
    )
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: { icon: CheckCircle, class: 'bg-success-100 text-success-700 border-success-200' },
      paused: { icon: Clock, class: 'bg-warning-100 text-warning-700 border-warning-200' },
      expired: { icon: XCircle, class: 'bg-danger-100 text-danger-700 border-danger-200' },
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

  const getPaymentStatus = (memberId: string, monthlyFee: number) => {
    const balance = getMemberBalance(memberId, monthlyFee)
    const recentPayments = getPaymentsByMember(memberId).slice(0, 3)
    
    return {
      balance,
      recentPayments,
      isOverdue: balance.isOverdue,
      lastPayment: recentPayments[0]
    }
  }

  const handleRecordPayment = (memberId: string) => {
    setSelectedMemberForPayment(memberId)
    setShowPaymentForm(true)
  }

  const handleCreateInvoice = (memberId: string) => {
    setSelectedMemberForInvoice(memberId)
    setShowInvoiceForm(true)
  }

  const handleDeleteMember = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      const { error } = await deleteMember(id)
      if (!error) {
        fetchMembers() // Refresh the list
      } else {
        alert(`Failed to delete member: ${error.message}`)
      }
    }
  }

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (member.email?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: members.length,
    active: members.filter(m => m.status === 'active').length,
    paused: members.filter(m => m.status === 'paused').length,
    expired: members.filter(m => m.status === 'expired').length,
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Members Management
          </h1>
          <p className="text-muted-foreground mt-1">Manage your fitness members and their subscriptions</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)}
          variant="gradient"
          className="gap-2"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-foreground">{stats.total}</div>
          <div className="text-sm text-muted-foreground">Total Members</div>
        </div>
        <div className="bg-success-50 border border-success-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-success-700">{stats.active}</div>
          <div className="text-sm text-muted-foreground">Active</div>
        </div>
        <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-warning-700">{stats.paused}</div>
          <div className="text-sm text-muted-foreground">Paused</div>
        </div>
        <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-danger-700">{stats.expired}</div>
          <div className="text-sm text-muted-foreground">Expired</div>
        </div>
      </div>

      {/* Filters */}
      <DibsCard className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search members by name or email..."
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
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </DibsCard>

      {/* Members List */}
      <DibsCard className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="p-6 text-center text-danger-600">
            Error loading members: {error.message}
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="p-12 text-center">
            <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No members found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your filters'
                : 'Get started by adding your first member'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Button 
                onClick={() => setShowAddForm(true)}
                variant="gradient"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Your First Member
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 font-medium text-foreground">Member</th>
                  <th className="text-left p-4 font-medium text-foreground">Status</th>
                  <th className="text-left p-4 font-medium text-foreground">Membership</th>
                  <th className="text-left p-4 font-medium text-foreground">Monthly Fee</th>
                  <th className="text-left p-4 font-medium text-foreground">Payment Status</th>
                  <th className="text-left p-4 font-medium text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="border-b border-gray-200 hover:bg-muted/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={member.avatar_url} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {getInitials(member.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-foreground">{member.full_name}</div>
                          {member.email && (
                            <div className="text-sm text-muted-foreground">{member.email}</div>
                          )}
                          {member.phone && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <Phone className="h-3 w-3" />
                              {member.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(member.status)}
                    </td>
                    <td className="p-4">
                      <div>
                        {getMembershipBadge(member.membership_type)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Since {new Date(member.join_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-bold text-foreground">
                        ₹{member.monthly_fees?.toFixed(2) || '0.00'}
                      </div>
                    </td>
                    <td className="p-4">
                      {(() => {
                        const paymentStatus = getPaymentStatus(member.id, member.monthly_fees || 0)
                        return (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3 text-muted-foreground" />
                              <span className={`text-xs font-medium ${
                                paymentStatus.isOverdue ? 'text-red-600' : 'text-green-600'
                              }`}>
                                {paymentStatus.isOverdue ? 'Overdue' : 'Current'}
                              </span>
                            </div>
                            {paymentStatus.lastPayment && (
                              <div className="text-xs text-muted-foreground">
                                Last: {new Date(paymentStatus.lastPayment.payment_date).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        )
                      })()}
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
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Member
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4 mr-2" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Calendar className="h-4 w-4 mr-2" />
                            Schedule Session
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCreateInvoice(member.id)}>
                            <DollarSign className="h-4 w-4 mr-2" />
                            Create Invoice
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRecordPayment(member.id)}>
                            <DollarSign className="h-4 w-4 mr-2" />
                            Record Payment
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-danger-600"
                            onClick={() => handleDeleteMember(member.id, member.full_name)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DibsCard>

      {/* Add Member Form Modal */}
      {showAddForm && (
        <AddMemberForm 
          onClose={() => setShowAddForm(false)}
          onSuccess={() => {
            setShowAddForm(false)
            fetchMembers() // Refresh the list
          }}
        />
      )}

      {/* Payment Form Modal */}
      {showPaymentForm && (
        <AddPaymentForm
          preselectedMemberId={selectedMemberForPayment}
          onClose={() => {
            setShowPaymentForm(false)
            setSelectedMemberForPayment('')
          }}
          onSuccess={() => {
            // Refresh members data to update payment status
            fetchMembers()
          }}
        />
      )}

      {/* Invoice Form Modal */}
      {showInvoiceForm && (
        <CreateInvoiceForm
          preselectedMemberId={selectedMemberForInvoice}
          onClose={() => {
            setShowInvoiceForm(false)
            setSelectedMemberForInvoice('')
          }}
          onSuccess={() => {
            // Refresh members data
            fetchMembers()
          }}
        />
      )}
    </div>
  )
}
