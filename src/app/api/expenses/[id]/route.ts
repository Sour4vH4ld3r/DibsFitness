import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET single expense
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: expense, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', id)
      .eq('trainer_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ data: expense })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Update expense
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate required fields
    if (body.description !== undefined && !body.description) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 })
    }
    
    if (body.amount !== undefined && (body.amount <= 0)) {
      return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 })
    }

    // Build update object
    const updateData: any = {}
    if (body.category !== undefined) updateData.category = body.category
    if (body.description !== undefined) updateData.description = body.description
    if (body.amount !== undefined) updateData.amount = parseFloat(body.amount)
    if (body.expense_date !== undefined) updateData.expense_date = body.expense_date
    if (body.receipt_url !== undefined) updateData.receipt_url = body.receipt_url

    const { data: expense, error } = await supabase
      .from('expenses')
      .update(updateData)
      .eq('id', id)
      .eq('trainer_id', user.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ data: expense })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE expense
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
      .eq('trainer_id', user.id)

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ success: true, message: `Expense ${id} deleted` })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}