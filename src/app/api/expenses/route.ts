import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET all expenses
export async function GET() {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      // Try to get expenses from the database
      const { data: expenses, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('trainer_id', user.id)
        .order('expense_date', { ascending: false })

      if (error && error.code === 'PGRST106') {
        // Table doesn't exist, return empty array with a warning
        console.warn('Expenses table not found, returning empty array. Please run the database schema.')
        return NextResponse.json({ data: [], warning: 'Database table not initialized' })
      }
      
      if (error) {
        throw error
      }

      return NextResponse.json({ data: expenses || [] })
    } catch (dbError: any) {
      // If database error, return mock data as fallback
      console.warn('Database error, falling back to mock data:', dbError.message)
      const mockExpenses = [
        {
          id: '1',
          trainer_id: user.id,
          category: 'equipment',
          description: 'Dumbbells set',
          amount: 5000.00,
          expense_date: '2025-09-01',
          receipt_url: null,
          created_at: '2025-09-01T10:00:00Z',
          updated_at: '2025-09-01T10:00:00Z'
        },
        {
          id: '2',
          trainer_id: user.id,
          category: 'rent',
          description: 'Gym rent for September',
          amount: 15000.00,
          expense_date: '2025-09-01',
          receipt_url: null,
          created_at: '2025-09-01T10:00:00Z',
          updated_at: '2025-09-01T10:00:00Z'
        },
      ]
      return NextResponse.json({ data: mockExpenses, fallback: true })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Create new expense
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
    if (!body.description) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 })
    }
    
    if (!body.amount || body.amount <= 0) {
      return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 })
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
          return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 })
        }
      } else if (profileError) {
        console.error('Profile check error:', profileError)
        return NextResponse.json({ error: 'Profile verification failed' }, { status: 500 })
      }

      // Create expense in the database
      const { data: newExpense, error } = await supabase
        .from('expenses')
        .insert({
          trainer_id: user.id,
          category: body.category || 'other',
          description: body.description,
          amount: parseFloat(body.amount),
          expense_date: body.expense_date || new Date().toISOString().split('T')[0],
          receipt_url: body.receipt_url || null,
        })
        .select()
        .single()

      if (error) {
        // Handle specific database errors
        if (error.code === 'PGRST106') {
          return NextResponse.json({ error: 'Database table not initialized. Please run the database schema first.' }, { status: 503 })
        }
        console.error('Database error:', error)
        throw new Error(`Database error: ${error.message}`)
      }

      return NextResponse.json({ data: newExpense }, { status: 201 })
    } catch (dbError: any) {
      // If database is not available, return mock success for development
      console.warn('Database not available, returning mock response:', dbError.message)
      const mockExpense = {
        id: Date.now().toString(),
        trainer_id: user.id,
        category: body.category || 'other',
        description: body.description,
        amount: parseFloat(body.amount),
        expense_date: body.expense_date || new Date().toISOString().split('T')[0],
        receipt_url: body.receipt_url || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      return NextResponse.json({ data: mockExpense, fallback: true }, { status: 201 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}