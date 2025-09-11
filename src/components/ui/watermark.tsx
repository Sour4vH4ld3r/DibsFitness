'use client'

import { Code2, Sparkles } from 'lucide-react'

interface WatermarkProps {
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
  size?: 'sm' | 'md' | 'lg'
  opacity?: number
}

export function Watermark({ 
  position = 'bottom-right', 
  size = 'sm',
  opacity = 0.6 
}: WatermarkProps) {
  const positions = {
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
  }

  const sizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4', 
    lg: 'h-5 w-5',
  }

  return (
    <div 
      className={`fixed ${positions[position]} z-10 select-none`}
      style={{ opacity }}
    >
      <div className="flex flex-col items-end gap-1 text-gray-500">
        {/* OrbitDynamix Branding */}
        <div className={`flex items-center gap-1.5 font-semibold ${sizes[size]}`}>
          <Sparkles className={`${iconSizes[size]} text-blue-500`} />
          <a 
            href="https://orbitdynamix.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all duration-200 cursor-pointer pointer-events-auto"
          >
            OrbitDynamix
          </a>
        </div>
        
        {/* Developer Credit */}
        <div className={`flex items-center gap-1 ${sizes[size]} text-gray-400 pointer-events-none`}>
          <Code2 className={`${iconSizes[size]}`} />
          <span>Developed by Sourav Halder</span>
        </div>
      </div>
    </div>
  )
}

// Subtle watermark variant for forms/modals
export function SubtleWatermark() {
  return (
    <div className="fixed bottom-2 right-2 z-50 select-none opacity-30">
      <div className="flex items-center gap-1 text-[10px] text-gray-400">
        <Sparkles className="h-2.5 w-2.5 text-blue-400" />
        <a 
          href="https://orbitdynamix.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="font-medium hover:text-blue-500 transition-colors cursor-pointer pointer-events-auto"
        >
          OrbitDynamix
        </a>
        <span className="text-gray-300 pointer-events-none">•</span>
        <span className="pointer-events-none">by Sourav</span>
      </div>
    </div>
  )
}

// Watermark for printed pages/invoices
export function PrintWatermark() {
  return (
    <div className="print:block hidden fixed inset-0 flex items-center justify-center pointer-events-none select-none z-0">
      <div 
        className="text-gray-100 text-6xl font-bold transform -rotate-45 opacity-10"
        style={{ fontSize: '8rem', lineHeight: '1' }}
      >
        OrbitDynamix
      </div>
      <div className="absolute bottom-4 right-4 text-gray-400 text-xs">
        Visit: https://orbitdynamix.com
      </div>
    </div>
  )
}