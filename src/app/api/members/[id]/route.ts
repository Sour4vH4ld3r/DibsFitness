import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET single member
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get member from the database
    const { data: member, error } = await supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .eq('trainer_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Member not found' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ data: member })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Update member
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Update member in the database
    const { data: updatedMember, error } = await supabase
      .from('members')
      .update({
        full_name: body.full_name,
        email: body.email,
        phone: body.phone,
        status: body.status,
        membership_type: body.membership_type,
        monthly_fees: body.monthly_fees,
        notes: body.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('trainer_id', user.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Member not found' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ data: updatedMember })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE member
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete member from the database
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', id)
      .eq('trainer_id', user.id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, message: `Member ${id} deleted` })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
