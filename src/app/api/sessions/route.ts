import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET all sessions
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Mock data for now
    const mockSessions = [
      {
        id: '1',
        title: 'Personal Training - John Doe',
        member: 'John Doe',
        memberId: '1',
        start: '2024-03-25T09:00:00',
        end: '2024-03-25T10:00:00',
        type: 'personal',
        status: 'scheduled',
        location: 'Main Gym',
      },
      {
        id: '2',
        title: 'Group Class - HIIT',
        start: '2024-03-25T17:00:00',
        end: '2024-03-25T18:00:00',
        type: 'group',
        status: 'scheduled',
        location: 'Studio A',
        participants: 8,
        maxParticipants: 12,
      },
      {
        id: '3',
        title: 'Personal Training - Jane Smith',
        member: 'Jane Smith',
        memberId: '2',
        start: '2024-03-26T11:00:00',
        end: '2024-03-26T12:00:00',
        type: 'personal',
        status: 'scheduled',
        location: 'Main Gym',
      },
    ]

    return NextResponse.json({ data: mockSessions })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Create new session
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
    if (!body.title || !body.start || !body.end) {
      return NextResponse.json({ 
        error: 'Title, start time, and end time are required' 
      }, { status: 400 })
    }

    // Mock response for now
    const newSession = {
      id: Date.now().toString(),
      ...body,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json({ data: newSession }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
