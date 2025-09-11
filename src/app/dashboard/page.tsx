'use client'

import { useSupabase } from '@/providers/supabase-provider'
import { useMembers } from '@/hooks/useMembers'
import { usePayments } from '@/hooks/usePayments'
import { useExpenses } from '@/hooks/useExpenses'
import { useProfile } from '@/hooks/useProfile'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Receipt,
  TrendingUp,
  TrendingDown,
  UserPlus,
  FileText,
  Activity,
  Loader2
} from 'lucide-react'
import { DibsStats } from '@/components/dibs/DibsStats'
import { DibsCard } from '@/components/dibs/DibsCard'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useSupabase()
  const { profile, getDisplayName } = useProfile()
  const { members, loading: membersLoading } = useMembers()
  const { payments, calculateStats, loading: paymentsLoading } = usePayments()
  const { expenses, thisMonthExpenses, totalExpenses, loading: expensesLoading } = useExpenses()
  
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Set loading to false once all data is loaded
    if (!membersLoading && !paymentsLoading && !expensesLoading) {
      setIsLoading(false)
    }
  }, [membersLoading, paymentsLoading, expensesLoading])

  // Calculate dynamic stats
  const paymentStats = calculateStats()
  const activeMembers = members.filter(m => m.status === 'active').length
  const pendingPayments = payments.filter(p => p.status === 'pending').length
  const netProfit = paymentStats.thisMonth - thisMonthExpenses

  const stats = {
    totalMembers: members.length,
    activeMembers,
    monthlyRevenue: paymentStats.thisMonth,
    monthlyExpenses: thisMonthExpenses,
    netProfit,
    pendingPayments,
  }

  // Recent activity from actual data
  const getRecentActivity = () => {
    const activities = []
    
    // Recent members (last 5)
    const recentMembers = [...members]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 3)
    
    recentMembers.forEach(member => {
      activities.push({
        id: `member-${member.id}`,
        action: 'New member joined',
        member: member.full_name,
        time: formatTimeAgo(member.created_at)
      })
    })

    // Recent payments (last 5 completed)
    const recentPayments = [...payments]
      .filter(p => p.status === 'completed')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 2)
    
    recentPayments.forEach(payment => {
      const member = payment.members?.full_name || 'Unknown Member'
      activities.push({
        id: `payment-${payment.id}`,
        action: 'Payment received',
        member: `${member} - ₹${payment.amount}`,
        time: formatTimeAgo(payment.created_at)
      })
    })

    return activities.slice(0, 4)
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  }

  const recentActivity = getRecentActivity()

  // Navigation handlers
  const handleAddMember = () => {
    router.push('/dashboard/members')
  }

  const handleCreateInvoice = () => {
    router.push('/dashboard/payments') // Navigate to payments where invoices are managed
  }

  const handleRecordPayment = () => {
    router.push('/dashboard/payments')
  }

  const handleViewMember = (memberId: string) => {
    router.push(`/dashboard/members?member=${memberId}`)
  }

  // Today's active members (showing recent members instead of sessions)
  const todaysMembers = members
    .filter(m => m.status === 'active')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4)
    .map((member, index) => ({
      id: member.id,
      time: `${9 + index}:00 AM`,
      member: member.full_name,
      type: `${member.membership_type} Member`
    }))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-6">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6 lg:p-8 animate-in">
      {/* Header */}
      <div className="flex flex-col space-y-6 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 lg:gap-6">
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-blue-700 to-green-700 bg-clip-text text-transparent animate-in">
            Welcome back, {getDisplayName()}! 👋
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
            You have <strong>{stats.totalMembers}</strong> members with <strong>{stats.activeMembers}</strong> active.
            {stats.pendingPayments > 0 && (
              <span className="text-amber-600 font-medium"> {stats.pendingPayments} payment{stats.pendingPayments > 1 ? 's' : ''} pending.</span>
            )}
          </p>
        </div>
        <div className="flex justify-end">
          <Button 
            size="lg" 
            className="gap-2 bg-gradient-to-r from-blue-500 via-blue-600 to-green-600 hover:from-blue-600 hover:via-blue-700 hover:to-green-700 text-white shadow-glow hover:shadow-glow-green transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
            onClick={handleAddMember}
          >
            <UserPlus className="h-4 w-4" />
            Add Member
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <DibsStats
          title="Total Members"
          value={stats.totalMembers}
          change={stats.activeMembers > 0 ? Math.round((stats.activeMembers / stats.totalMembers) * 100) : 0}
          changeLabel={`${stats.activeMembers} active members`}
          icon={<Users className="h-5 w-5" />}
          variant="default"
          className="animate-in animate-stagger-1"
        />
        <DibsStats
          title="Monthly Revenue"
          value={`₹${stats.monthlyRevenue.toLocaleString()}`}
          change={paymentStats.completedCount > 0 ? Math.round((paymentStats.completedCount / (paymentStats.completedCount + paymentStats.pendingCount)) * 100) : 0}
          changeLabel={`${paymentStats.completedCount} payments received`}
          icon={<DollarSign className="h-5 w-5" />}
          variant="success"
          className="animate-in animate-stagger-2"
        />
        <DibsStats
          title="Monthly Expenses"
          value={`₹${stats.monthlyExpenses.toLocaleString()}`}
          change={expenses.length > 0 ? Math.round((expenses.length / Math.max(1, stats.totalMembers)) * 100) : 0}
          changeLabel={`${expenses.length} expense entries`}
          icon={<Receipt className="h-5 w-5" />}
          variant="warning"
          className="animate-in animate-stagger-3"
        />
        <DibsStats
          title="Net Profit"
          value={`₹${stats.netProfit.toLocaleString()}`}
          change={stats.netProfit > 0 ? 100 : 0}
          changeLabel={stats.netProfit > 0 ? 'Profitable this month' : 'Break even'}
          icon={stats.netProfit > 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
          variant={stats.netProfit > 0 ? "success" : "danger"}
          className="animate-in animate-stagger-4"
        />
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 xl:grid-cols-2 animate-in">
        {/* Active Members */}
        <DibsCard
          title="Active Members"
          description={`Your ${stats.activeMembers} active members`}
          icon={Users}
        >
          <div className="space-y-3">
            {todaysMembers.length > 0 ? todaysMembers.map((member, index) => (
              <div
                key={member.id}
                className={`group flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-white/80 to-slate-50/60 hover:from-white hover:to-slate-50 transition-all duration-300 hover:shadow-soft hover:scale-[1.01] border border-slate-100 animate-in animate-stagger-${index + 1}`}
              >
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className="flex flex-col items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-soft group-hover:shadow-glow group-hover:scale-105 transition-all duration-300 shrink-0">
                    <div className="text-xs font-semibold">
                      {member.member.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 group-hover:text-slate-800 transition-colors truncate">{member.member}</p>
                    <p className="text-xs text-slate-600 font-medium truncate">{member.type}</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 shrink-0"
                  onClick={() => handleViewMember(member.id)}
                >
                  <span className="hidden sm:inline">View</span>
                  <span className="sm:hidden text-xs">View</span>
                </Button>
              </div>
            )) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No active members yet</p>
                <p className="text-xs mt-1">Add your first member to get started</p>
              </div>
            )}
          </div>
        </DibsCard>

        {/* Recent Activity */}
        <DibsCard
          title="Recent Activity"
          description="Latest updates from your fitness business"
          icon={Activity}
        >
          <div className="space-y-3">
            {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
              <div
                key={activity.id}
                className={`group flex items-start gap-4 p-4 rounded-lg bg-gradient-to-r from-white/60 to-slate-50/40 hover:from-white hover:to-slate-50 transition-all duration-300 hover:shadow-soft hover:scale-[1.01] border border-slate-100 animate-in animate-stagger-${index + 1}`}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-500 shadow-soft group-hover:shadow-glow-green group-hover:scale-110 transition-all duration-300 mt-0.5 shrink-0">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-900 group-hover:text-slate-800 transition-colors">
                    <span className="font-semibold">{activity.action}</span>
                  </p>
                  <p className="text-xs text-slate-600 font-medium mt-1 truncate">
                    <span className="text-slate-800">{activity.member}</span> • {activity.time}
                  </p>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No recent activity</p>
                <p className="text-xs mt-1">Activity will appear here as you use the app</p>
              </div>
            )}
          </div>
        </DibsCard>
      </div>

      {/* Quick Actions */}
      <div className="animate-in">
        <DibsCard
          title="Quick Actions"
          description="Frequently used actions for your convenience"
          variant="gradient"
          className="hover:shadow-strong transition-all duration-500 transform hover:scale-[1.02]"
        >
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Button 
            variant="outline" 
            className="h-auto flex-col gap-2 py-4 sm:py-6 hover:shadow-soft hover:bg-blue-50/50 transition-all duration-300 transform hover:scale-105 group"
            onClick={handleAddMember}
          >
            <UserPlus className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-center">Add Member</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto flex-col gap-2 py-4 sm:py-6 hover:shadow-soft hover:bg-amber-50/50 transition-all duration-300 transform hover:scale-105 group"
            onClick={handleCreateInvoice}
          >
            <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-center">Create Invoice</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto flex-col gap-2 py-4 sm:py-6 hover:shadow-soft hover:bg-green-50/50 transition-all duration-300 transform hover:scale-105 group"
            onClick={handleRecordPayment}
          >
            <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-center">Record Payment</span>
          </Button>
          </div>
        </DibsCard>
      </div>
    </div>
  )
}
