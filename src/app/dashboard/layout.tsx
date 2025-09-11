'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSupabase } from '@/providers/supabase-provider'
import { useProfile } from '@/hooks/useProfile'
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Receipt,
  Menu,
  X,
  ChevronRight,
  LogOut,
  User
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { DibsLogo } from '@/components/dibs/DibsLogo'
import { Button } from '@/components/ui/button'
import { Watermark } from '@/components/ui/watermark'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Members', href: '/dashboard/members', icon: Users },
  { name: 'Payments', href: '/dashboard/payments', icon: CreditCard },
  { name: 'Expenses', href: '/dashboard/expenses', icon: Receipt },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, signOut } = useSupabase()
  const { profile, getDisplayName, getInitials, loading: profileLoading } = useProfile()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-0 z-50 lg:hidden",
        sidebarOpen ? "block" : "hidden"
      )}>
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-72 flex-col gradient-surface border-r-0 shadow-strong">
          <div className="flex h-16 items-center justify-between px-6 border-b">
            <DibsLogo size="sm" />
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <nav className="flex-1 space-y-2 px-4 py-6">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-glow transform scale-[1.02]"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60 hover:shadow-soft hover:transform hover:scale-[1.01]"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          {/* Mobile user section */}
          <div className="border-t p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-semibold shadow-sm">
                {!profileLoading ? getInitials() : 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {!profileLoading ? getDisplayName() : (user?.email || 'Guest')}
                </p>
                <p className="text-xs text-muted-foreground">Trainer</p>
                <button
                  onClick={signOut}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors mt-1"
                >
                  <LogOut className="h-3 w-3" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-1 flex-col gradient-surface border-r-0 shadow-soft">
          <div className="flex h-16 items-center px-6 border-b">
            <DibsLogo />
          </div>
          <nav className="flex-1 space-y-2 px-4 py-6 scrollbar-thin overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 group overflow-hidden",
                    isActive
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-glow transform scale-[1.02]"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60 hover:shadow-soft hover:transform hover:scale-[1.01]"
                  )}
                >
                  {/* Animated background on hover */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                  )}
                  
                  <item.icon className="h-5 w-5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 relative z-10" />
                  <span className="relative z-10">{item.name}</span>
                  {isActive && (
                    <ChevronRight className="ml-auto h-4 w-4 relative z-10 animate-pulse" />
                  )}
                </Link>
              )
            })}
          </nav>
          
          {/* User section */}
          <div className="border-t border-white/20 bg-gradient-to-r from-primary-50/50 to-secondary-50/50 p-4">
            <div className="flex items-center gap-3 rounded-xl p-3 hover:bg-white/60 transition-all duration-300 cursor-pointer backdrop-blur-sm group">
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold shadow-medium group-hover:shadow-lg transition-all duration-300">
                  {!profileLoading ? getInitials() : 'U'}
                </div>
                {!profileLoading && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {!profileLoading ? getDisplayName() : (user?.email || 'Guest')}
                </p>
                <p className="text-xs text-muted-foreground">Fitness Trainer</p>
                {profile?.email && (
                  <p className="text-xs text-muted-foreground/80 truncate mt-0.5">{profile.email}</p>
                )}
              </div>
            </div>
            <Button
              onClick={signOut}
              variant="ghost"
              size="sm"
              className="w-full mt-2 justify-start gap-2 text-muted-foreground hover:text-foreground hover:bg-red-50 transition-all duration-200"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Mobile header */}
        <div className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-card/95 backdrop-blur-sm px-4 lg:hidden">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setSidebarOpen(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <DibsLogo size="sm" showText={false} />
          <div className="ml-auto">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="relative h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-semibold text-sm shadow-sm hover:shadow-md transition-all"
            >
              {!profileLoading ? getInitials() : 'U'}
              {!profileLoading && (
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border border-white rounded-full"></div>
              )}
            </button>
          </div>
        </div>

        {/* Page content */}
        <main className="min-h-[calc(100vh-4rem)] lg:min-h-screen bg-transparent">
          <div className="h-full">
            {children}
          </div>
        </main>

        {/* Watermark */}
        <Watermark position="bottom-right" size="sm" opacity={0.7} />
      </div>
    </div>
  )
}
