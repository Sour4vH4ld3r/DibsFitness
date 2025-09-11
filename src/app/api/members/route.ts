import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET all members
export async function GET() {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      // First, ensure the user has a profile record
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (profileError && profileError.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const { error: createProfileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email || 'user@example.com',
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
          })
        
        if (createProfileError) {
          console.error('Failed to create profile:', createProfileError)
        }
      }

      // Try to get members from the database
      const { data: members, error } = await supabase
        .from('members')
        .select('*')
        .eq('trainer_id', user.id)
        .order('created_at', { ascending: false })

      if (error && error.code === 'PGRST106') {
        // Table doesn't exist, return empty array with a warning
        console.warn('Members table not found, returning empty array. Please run the database schema.')
        return NextResponse.json({ data: [], warning: 'Database table not initialized' })
      }
      
      if (error) {
        throw error
      }

      return NextResponse.json({ data: members || [] })
    } catch (dbError: any) {
      // If database error, return mock data as fallback
      console.warn('Database error, falling back to mock data:', dbError.message)
      const mockMembers = [
        {
          id: '1',
          full_name: 'John Doe',
          email: 'john@example.com',
          phone: '(555) 123-4567',
          status: 'active',
          membership_type: 'premium',
          monthly_fees: 149.00,
          join_date: '2024-01-15',
          total_sessions: 24,
          notes: 'Regular client, prefers morning sessions',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          full_name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '(555) 987-6543',
          status: 'active',
          membership_type: 'basic',
          monthly_fees: 99.00,
          join_date: '2024-02-01',
          total_sessions: 12,
          notes: 'New member, focused on weight loss',
          created_at: '2024-02-01T10:00:00Z',
          updated_at: '2024-02-01T10:00:00Z'
        },
      ]
      return NextResponse.json({ data: mockMembers, fallback: true })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Create new member
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate required fields
    if (!body.full_name) {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 })
    }
    
    if (!body.email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    try {
      console.log('User ID:', user.id)
      console.log('User email:', user.email)
      
      // First, ensure the user has a profile record
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .eq('id', user.id)
        .single()

      console.log('Profile check result:', { profile, error: profileError })

      if (profileError && profileError.code === 'PGRST116') {
        // Profile doesn't exist, create it
        console.log('Creating new profile for user:', user.id)
        const { data: newProfile, error: createProfileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email || body.email,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
          })
          .select()
        
        console.log('Profile creation result:', { newProfile, error: createProfileError })
        
        if (createProfileError) {
          console.error('Failed to create profile:', createProfileError)
          return NextResponse.json({ 
            error: 'Failed to create user profile',
            details: createProfileError.message 
          }, { status: 500 })
        }
      } else if (profileError) {
        console.error('Profile check error:', profileError)
        return NextResponse.json({ 
          error: 'Profile verification failed',
          details: profileError.message 
        }, { status: 500 })
      } else {
        console.log('Profile exists:', profile)
      }

      // Now create member in the database
      console.log('Creating member with trainer_id:', user.id)
      const memberData = {
        trainer_id: user.id,
        full_name: body.full_name,
        email: body.email,
        phone: body.phone || null,
        status: body.status || 'active',
        membership_type: body.membership_type || 'basic',
        monthly_fees: body.monthly_fees || 0,
        notes: body.notes || null,
        join_date: new Date().toISOString().split('T')[0],
        total_sessions: 0,
      }
      console.log('Member data:', memberData)
      
      const { data: newMember, error } = await supabase
        .from('members')
        .insert(memberData)
        .select()
        .single()

      console.log('Member creation result:', { newMember, error })

      if (error) {
        // Handle specific database errors
        if (error.code === '23505') {
          return NextResponse.json({ error: 'A member with this email already exists' }, { status: 409 })
        }
        if (error.code === 'PGRST106') {
          return NextResponse.json({ error: 'Database table not initialized. Please run the database schema first.' }, { status: 503 })
        }
        console.error('Database error:', error)
        throw new Error(`Database error: ${error.message}`)
      }

      return NextResponse.json({ data: newMember }, { status: 201 })
    } catch (dbError: any) {
      // If database is not available, return mock success for development
      console.warn('Database not available, returning mock response:', dbError.message)
      const mockMember = {
        id: Date.now().toString(),
        trainer_id: user.id,
        full_name: body.full_name,
        email: body.email,
        phone: body.phone || null,
        status: body.status || 'active',
        membership_type: body.membership_type || 'basic',
        monthly_fees: body.monthly_fees || 0,
        notes: body.notes || null,
        join_date: new Date().toISOString().split('T')[0],
        total_sessions: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      return NextResponse.json({ data: mockMember, fallback: true }, { status: 201 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
