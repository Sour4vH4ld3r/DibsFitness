import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  console.log('OAuth callback started')
  
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const error = requestUrl.searchParams.get('error')
    
    console.log('OAuth params:', { code: !!code, error })

    // If there's an error from OAuth provider
    if (error) {
      console.error('OAuth provider error:', error)
      return NextResponse.redirect(new URL('/auth/sign-in?error=oauth_provider_error', requestUrl.origin))
    }

    // If no code, redirect to sign-in
    if (!code) {
      console.error('No code in OAuth callback')
      return NextResponse.redirect(new URL('/auth/sign-in?error=no_code', requestUrl.origin))
    }

    console.log('Creating Supabase client')
    const supabase = await createClient()
    
    console.log('Exchanging code for session')
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (exchangeError) {
      console.error('OAuth exchange error:', exchangeError)
      return NextResponse.redirect(new URL('/auth/sign-in?error=exchange_failed', requestUrl.origin))
    }

    console.log('OAuth callback successful, redirecting to dashboard')
    return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
    
  } catch (error) {
    console.error('OAuth callback exception:', error)
    return NextResponse.redirect(new URL('/auth/sign-in?error=callback_exception', new URL(request.url).origin))
  }
}
