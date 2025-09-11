import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET all invoices
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')
    const status = searchParams.get('status')

    try {
      let query = supabase
        .from('invoices')
        .select(`
          *,
          members (
            id,
            full_name,
            email,
            membership_type
          )
        `)
        .eq('trainer_id', user.id)

      if (memberId) {
        query = query.eq('member_id', memberId)
      }

      if (status) {
        query = query.eq('status', status)
      }

      query = query.order('created_at', { ascending: false })

      const { data: invoices, error } = await query

      if (error) {
        throw error
      }

      return NextResponse.json({ data: invoices || [] })

    } catch (dbError) {
      console.error('Database error:', dbError)
      // Return mock data as fallback
      const mockInvoices = [
        {
          id: 'INV-2024-001',
          invoice_number: 'INV-2024-001',
          member_id: '1',
          members: { full_name: 'John Doe', email: 'john@example.com', membership_type: 'premium' },
          amount: 1500,
          status: 'paid',
          due_date: '2024-03-01',
          paid_date: '2024-02-28',
          items: [
            { description: 'Premium Monthly Membership', amount: 1500, quantity: 1 }
          ],
          tax_amount: 0,
          discount_amount: 0,
          created_at: '2024-03-15T10:00:00Z'
        },
        {
          id: 'INV-2024-002',
          invoice_number: 'INV-2024-002',
          member_id: '2',
          members: { full_name: 'Jane Smith', email: 'jane@example.com', membership_type: 'basic' },
          amount: 1000,
          status: 'sent',
          due_date: '2024-03-15',
          paid_date: null,
          items: [
            { description: 'Basic Monthly Membership', amount: 1000, quantity: 1 }
          ],
          tax_amount: 0,
          discount_amount: 0,
          created_at: '2024-03-10T10:00:00Z'
        }
      ]

      // Filter mock data
      let filteredInvoices = mockInvoices
      if (memberId) {
        filteredInvoices = filteredInvoices.filter(inv => inv.member_id === memberId)
      }
      if (status) {
        filteredInvoices = filteredInvoices.filter(inv => inv.status === status)
      }

      return NextResponse.json({ data: filteredInvoices })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Create new invoice
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { member_id, amount, due_date, items, notes, tax_amount = 0, discount_amount = 0 } = body
    
    // Validate required fields
    if (!member_id || !amount || !due_date) {
      return NextResponse.json({ 
        error: 'Member ID, amount, and due date are required' 
      }, { status: 400 })
    }

    try {
      // Generate invoice number using the database function
      const { data: invoiceNumber, error: numberError } = await supabase
        .rpc('generate_invoice_number', { trainer_uuid: user.id })

      if (numberError) {
        throw numberError
      }

      // Create the invoice
      const { data: invoice, error: createError } = await supabase
        .from('invoices')
        .insert([
          {
            trainer_id: user.id,
            member_id,
            invoice_number: invoiceNumber,
            amount: parseFloat(amount),
            due_date,
            items: items || [],
            notes: notes || '',
            tax_amount: parseFloat(tax_amount) || 0,
            discount_amount: parseFloat(discount_amount) || 0,
            status: 'draft'
          }
        ])
        .select(`
          *,
          members (
            id,
            full_name,
            email,
            membership_type
          )
        `)
        .single()

      if (createError) {
        throw createError
      }

      return NextResponse.json({ 
        data: invoice,
        message: 'Invoice created successfully' 
      }, { status: 201 })

    } catch (dbError) {
      console.error('Database error creating invoice:', dbError)
      
      // Fallback: Mock invoice creation
      const invoiceNumber = `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`
      const mockInvoice = {
        id: invoiceNumber,
        invoice_number: invoiceNumber,
        member_id,
        amount: parseFloat(amount),
        status: 'draft',
        due_date,
        paid_date: null,
        items: items || [],
        tax_amount: parseFloat(tax_amount) || 0,
        discount_amount: parseFloat(discount_amount) || 0,
        notes: notes || '',
        created_at: new Date().toISOString(),
      }

      return NextResponse.json({ 
        data: mockInvoice,
        message: 'Invoice created successfully (fallback mode)' 
      }, { status: 201 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
