'use client'

import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface DibsStatsProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon?: React.ReactNode
  className?: string
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'primary'
}

export function DibsStats({
  title,
  value,
  change,
  changeLabel,
  icon,
  className,
  variant = 'default',
}: DibsStatsProps) {
  const variants = {
    default: 'gradient-surface border-white/20 hover:shadow-soft hover:scale-[1.02]',
    primary: 'bg-gradient-to-br from-blue-50/80 to-blue-100/60 border-blue-200/50 hover:shadow-glow hover:scale-[1.02]',
    success: 'bg-gradient-to-br from-green-50/80 to-green-100/60 border-green-200/50 hover:shadow-glow-green hover:scale-[1.02]',
    warning: 'bg-gradient-to-br from-amber-50/80 to-amber-100/60 border-amber-200/50 hover:shadow-glow-yellow hover:scale-[1.02]',
    danger: 'bg-gradient-to-br from-red-50/80 to-red-100/60 border-red-200/50 hover:shadow-medium hover:scale-[1.02]',
  }

  const iconBg = {
    default: 'bg-gradient-to-br from-slate-500 to-slate-600 shadow-medium',
    primary: 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-glow',
    success: 'bg-gradient-to-br from-green-500 to-green-600 shadow-glow-green',
    warning: 'bg-gradient-to-br from-amber-500 to-amber-600 shadow-glow-yellow',
    danger: 'bg-gradient-to-br from-red-500 to-red-600 shadow-medium',
  }

  const getTrendIcon = () => {
    if (!change) return null
    if (change > 0) return <ArrowUpRight className="h-4 w-4" />
    return <ArrowDownRight className="h-4 w-4" />
  }

  const getTrendColor = () => {
    if (!change) return 'text-slate-500'
    if (change > 0) return 'text-green-700 bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200/50'
    return 'text-red-700 bg-gradient-to-r from-red-100 to-rose-100 border border-red-200/50'
  }

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border p-6 transition-all duration-300 cursor-pointer backdrop-blur-sm animate-in',
        variants[variant],
        className
      )}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          {/* Title */}
          <p className="text-sm font-medium text-slate-600 mb-2 tracking-wide">{title}</p>
          
          {/* Value */}
          <div className="flex items-baseline gap-3 mb-3">
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight group-hover:text-slate-800 transition-colors">
              {value}
            </h3>
            
            {/* Change Badge */}
            {change !== undefined && (
              <div className={cn(
                'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm transition-all duration-200 group-hover:scale-105',
                getTrendColor()
              )}>
                {getTrendIcon()}
                <span>
                  {change > 0 ? '+' : ''}{change}%
                </span>
              </div>
            )}
          </div>
          
          {/* Change Label */}
          {changeLabel && (
            <p className="text-xs text-slate-500">{changeLabel}</p>
          )}
        </div>
        
        {/* Icon */}
        {icon && (
          <div className={cn(
            'rounded-xl p-3 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3',
            iconBg[variant]
          )}>
            <div className="text-white">
              {icon}
            </div>
          </div>
        )}
      </div>
      
    </div>
  )
}
