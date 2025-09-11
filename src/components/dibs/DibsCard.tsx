'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface DibsCardProps {
  title?: string
  description?: string
  icon?: LucideIcon
  iconColor?: string
  children?: React.ReactNode
  footer?: React.ReactNode
  className?: string
  variant?: 'default' | 'gradient' | 'success' | 'warning' | 'info'
}

export function DibsCard({
  title,
  description,
  icon: Icon,
  iconColor,
  children,
  footer,
  className,
  variant = 'default',
}: DibsCardProps) {
  const variants = {
    default: 'gradient-surface border-white/20 hover:shadow-soft hover:scale-[1.01]',
    gradient: 'bg-gradient-to-br from-blue-50/80 via-purple-50/60 to-amber-50/80 border-gradient backdrop-blur-sm hover:shadow-strong hover:scale-[1.02]',
    success: 'bg-gradient-to-br from-green-50/80 to-emerald-100/60 border-green-200/50 hover:shadow-glow-green hover:scale-[1.01]',
    warning: 'bg-gradient-to-br from-amber-50/80 to-orange-100/60 border-amber-200/50 hover:shadow-glow-yellow hover:scale-[1.01]',
    info: 'bg-gradient-to-br from-blue-50/80 to-cyan-100/60 border-blue-200/50 hover:shadow-glow hover:scale-[1.01]',
  }

  const iconVariants = {
    default: iconColor || 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-glow',
    gradient: iconColor || 'bg-gradient-to-br from-purple-500 via-blue-500 to-amber-500 shadow-strong',
    success: iconColor || 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-glow-green',
    warning: iconColor || 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-glow-yellow',
    info: iconColor || 'bg-gradient-to-br from-blue-500 to-cyan-600 shadow-glow',
  }

  return (
    <Card className={cn(
      'group relative transition-all duration-300 overflow-hidden backdrop-blur-sm animate-in',
      variants[variant],
      className
    )}>
      {/* Subtle animated overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {(title || description || Icon) && (
        <CardHeader className="relative">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              {title && (
                <CardTitle className="text-slate-900 group-hover:text-slate-800 transition-colors text-lg font-bold tracking-tight">
                  {title}
                </CardTitle>
              )}
              {description && (
                <CardDescription className="text-slate-600 text-sm leading-relaxed">
                  {description}
                </CardDescription>
              )}
            </div>
            {Icon && (
              <div className={cn(
                'flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3',
                iconVariants[variant]
              )}>
                <Icon className="h-6 w-6 text-white" />
              </div>
            )}
          </div>
        </CardHeader>
      )}
      
      {children && (
        <CardContent className="relative">
          {children}
        </CardContent>
      )}
      
      {footer && (
        <CardFooter className="border-t border-white/20 bg-gradient-to-r from-white/30 to-white/10 backdrop-blur-sm relative">
          {footer}
        </CardFooter>
      )}
    </Card>
  )
}
