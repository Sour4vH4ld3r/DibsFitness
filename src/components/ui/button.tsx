import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group relative inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-[0.98] hover:scale-[1.02] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-soft hover:shadow-glow hover:from-blue-600 hover:to-blue-700 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100",
        destructive:
          "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-soft hover:shadow-medium hover:from-red-600 hover:to-red-700",
        outline:
          "border-2 border-slate-200 bg-white/70 backdrop-blur-sm hover:bg-white hover:border-slate-300 hover:shadow-soft",
        secondary:
          "bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 shadow-soft hover:from-slate-200 hover:to-slate-300 hover:shadow-medium",
        ghost:
          "hover:bg-slate-100 hover:text-slate-900 hover:shadow-soft",
        link: 
          "text-blue-600 underline-offset-4 hover:underline hover:text-blue-700",
        success:
          "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-soft hover:shadow-glow-green hover:from-green-600 hover:to-green-700",
        warning:
          "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-soft hover:shadow-glow-yellow hover:from-amber-600 hover:to-amber-700",
        gradient:
          "bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500 text-white shadow-strong hover:shadow-glow hover:from-blue-600 hover:via-purple-600 hover:to-amber-600 before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/10 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100",
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-md",
        default: "h-10 px-4 text-sm rounded-lg",
        lg: "h-12 px-6 text-base rounded-lg",
        xl: "h-14 px-8 text-lg rounded-xl",
        icon: "h-10 w-10 rounded-lg",
        "icon-sm": "h-8 w-8 rounded-md",
        "icon-lg": "h-12 w-12 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
