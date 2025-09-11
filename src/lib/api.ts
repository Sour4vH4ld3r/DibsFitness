// API helper functions for client-side usage

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

class ApiClient {
  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error: any) {
      console.error('API request failed:', error)
      return { error: error.message || 'An error occurred' }
    }
  }

  // Auth
  async signOut() {
    return this.request('/auth/signout', { method: 'POST' })
  }

  // Members
  async getMembers() {
    return this.request('/members')
  }

  async getMember(id: string) {
    return this.request(`/members/${id}`)
  }

  async createMember(data: any) {
    return this.request('/members', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateMember(id: string, data: any) {
    return this.request(`/members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteMember(id: string) {
    return this.request(`/members/${id}`, {
      method: 'DELETE',
    })
  }

  // Sessions
  async getSessions(params?: { startDate?: string; endDate?: string }) {
    const queryParams = new URLSearchParams(params as any).toString()
    return this.request(`/sessions${queryParams ? `?${queryParams}` : ''}`)
  }

  async createSession(data: any) {
    return this.request('/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateSession(id: string, data: any) {
    return this.request(`/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteSession(id: string) {
    return this.request(`/sessions/${id}`, {
      method: 'DELETE',
    })
  }

  // Payments
  async getPayments(params?: { memberId?: string; status?: string }) {
    const queryParams = new URLSearchParams(params as any).toString()
    return this.request(`/payments${queryParams ? `?${queryParams}` : ''}`)
  }

  async processPayment(data: any) {
    return this.request('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Invoices
  async getInvoices(params?: { memberId?: string; status?: string }) {
    const queryParams = new URLSearchParams(params as any).toString()
    return this.request(`/invoices${queryParams ? `?${queryParams}` : ''}`)
  }

  async createInvoice(data: any) {
    return this.request('/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getInvoice(id: string) {
    return this.request(`/invoices/${id}`)
  }

  async updateInvoice(id: string, data: any) {
    return this.request(`/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }
}

export const api = new ApiClient()
