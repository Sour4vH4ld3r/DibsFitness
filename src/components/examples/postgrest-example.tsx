'use client'

import { useEffect, useState } from 'react'
import { postgrest } from '@/lib/supabase/postgrest'

/**
 * Example component showing how to use PostgREST with Supabase
 * 
 * PostgREST provides a RESTful API directly from your PostgreSQL database.
 * With Supabase, you don't need to write backend code - just use the client!
 */
export function PostgRESTExample() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)

  // Example 1: Simple query
  const fetchMembers = async () => {
    setLoading(true)
    const { data, error } = await postgrest.getMembers({
      status: 'active',
      limit: 10
    })
    
    if (error) {
      console.error('Error fetching members:', error)
    } else {
      setData(data)
    }
    setLoading(false)
  }

  // Example 2: Complex query with joins
  const fetchMemberDetails = async (memberId: string) => {
    const { data, error } = await postgrest.getMember(memberId)
    
    if (!error && data) {
      // This will include related data from member_plans, plans, and sessions
      console.log('Member with related data:', data)
    }
  }

  // Example 3: Real-time subscription
  useEffect(() => {
    // Subscribe to real-time changes
    const channel = postgrest.subscribeMembersChanges((payload) => {
      console.log('Member change detected:', payload)
      
      if (payload.eventType === 'INSERT') {
        console.log('New member added:', payload.new)
      } else if (payload.eventType === 'UPDATE') {
        console.log('Member updated:', payload.new)
      } else if (payload.eventType === 'DELETE') {
        console.log('Member deleted:', payload.old)
      }
    })

    // Cleanup subscription
    return () => {
      channel.unsubscribe()
    }
  }, [])

  // Example 4: Create operation
  const createMember = async () => {
    const { data, error } = await postgrest.createMember({
      full_name: 'New Member',
      email: 'new@example.com',
      phone: '555-0000',
      status: 'active'
    })
    
    if (!error) {
      console.log('Member created:', data)
    }
  }

  // Example 5: Update operation
  const updateMember = async (id: string) => {
    const { data, error } = await postgrest.updateMember(id, {
      status: 'paused',
      notes: 'Taking a break'
    })
    
    if (!error) {
      console.log('Member updated:', data)
    }
  }

  // Example 6: Delete operation
  const deleteMember = async (id: string) => {
    const { error } = await postgrest.deleteMember(id)
    
    if (!error) {
      console.log('Member deleted successfully')
    }
  }

  // Example 7: Batch operations
  const bulkUpdateStatus = async () => {
    const memberIds = ['1', '2', '3']
    const { data, error } = await postgrest.bulkUpdateMemberStatus(
      memberIds,
      'active'
    )
    
    if (!error) {
      console.log('Bulk update successful:', data)
    }
  }

  // Example 8: Using RPC (Remote Procedure Call)
  const callCustomFunction = async () => {
    const { data, error } = await postgrest.callRPC('calculate_monthly_revenue', {
      month: '2024-03'
    })
    
    if (!error) {
      console.log('RPC result:', data)
    }
  }

  // Example 9: Dashboard stats
  const fetchDashboardStats = async () => {
    const stats = await postgrest.getDashboardStats()
    console.log('Dashboard stats:', stats)
  }

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">PostgREST Examples</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={fetchMembers}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Fetch Active Members
        </button>
        
        <button
          onClick={createMember}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Create Member
        </button>
        
        <button
          onClick={bulkUpdateStatus}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Bulk Update Status
        </button>
        
        <button
          onClick={fetchDashboardStats}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Get Dashboard Stats
        </button>
      </div>

      {loading && <p>Loading...</p>}
      
      {data && (
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  )
}
