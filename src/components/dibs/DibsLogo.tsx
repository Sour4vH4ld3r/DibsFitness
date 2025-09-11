'use client'

import { Dumbbell } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

interface DibsLogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  href?: string
}

export function DibsLogo({ size = 'md', showText = true, href = '/' }: DibsLogoProps) {
  const sizes = {
    sm: { icon: 'h-6 w-6', text: 'text-xl' },
    md: { icon: 'h-8 w-8', text: 'text-2xl' },
    lg: { icon: 'h-10 w-10', text: 'text-3xl' },
  }

  const LogoContent = () => (
    <div className="flex items-center gap-3 group cursor-pointer">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
        <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-2.5 rounded-xl shadow-lg group-hover:shadow-xl transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">
          <Dumbbell 
            className={`${sizes[size].icon} text-white drop-shadow-md`} 
          />
        </div>
      </div>
      {showText && (
        <div className="flex items-baseline">
          <span className={`font-montserrat font-extrabold ${sizes[size].text} bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
            Dibs
          </span>
          <span className={`font-montserrat font-bold ${sizes[size].text} text-gray-800 ml-1.5`}>
            Fitness
          </span>
        </div>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="inline-block">
        <LogoContent />
      </Link>
    )
  }

  return <LogoContent />
}
