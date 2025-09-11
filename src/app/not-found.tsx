import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft } from 'lucide-react'
import { DibsLogo } from '@/components/dibs/DibsLogo'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dibs-blue/5 via-white to-dibs-green/5 flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <DibsLogo size="lg" />
        
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-dibs-navy">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900">Page not found</h2>
          <p className="text-gray-600">
            Looks like someone already called dibs on this page... or it doesn&apos;t exist!
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go back
            </Button>
          </Link>
          <Link href="/">
            <Button className="bg-dibs-blue hover:bg-dibs-blue/90">
              <Home className="h-4 w-4 mr-2" />
              Go home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
