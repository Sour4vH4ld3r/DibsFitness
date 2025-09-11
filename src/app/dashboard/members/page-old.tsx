'use client'

import { useState } from 'react'
import { 
  Search, 
  Filter, 
  UserPlus, 
  MoreVertical, 
  Mail, 
  Phone,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  Eye,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DibsCard } from '@/components/dibs/DibsCard'

// Mock data
const mockMembers = [
  {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '+1 234-567-8901',
    status: 'active',
    plan: 'Premium Monthly',
    joinDate: '2024-01-15',
    lastSession: '2024-03-10',
    totalSessions: 48,
    amountDue: 0,
    avatar: 'https://i.pravatar.cc/150?img=1',
    initials: 'SJ'
  },
  {
    id: 2,
    name: 'Mike Chen',
    email: 'mike.chen@email.com',
    phone: '+1 234-567-8902',
    status: 'active',
    plan: 'Basic Monthly',
    joinDate: '2024-02-01',
    lastSession: '2024-03-09',
    totalSessions: 24,
    amountDue: 150,
    avatar: 'https://i.pravatar.cc/150?img=2',
    initials: 'MC'
  },
  {
    id: 3,
    name: 'Emma Davis',
    email: 'emma.d@email.com',
    phone: '+1 234-567-8903',
    status: 'paused',
    plan: 'Premium Monthly',
    joinDate: '2023-11-20',
    lastSession: '2024-02-28',
    totalSessions: 72,
    amountDue: 0,
    avatar: 'https://i.pravatar.cc/150?img=3',
    initials: 'ED'
  },
  {
    id: 4,
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1 234-567-8904',
    status: 'active',
    plan: 'Elite Yearly',
    joinDate: '2023-06-10',
    lastSession: '2024-03-10',
    totalSessions: 156,
    amountDue: 0,
    avatar: 'https://i.pravatar.cc/150?img=4',
    initials: 'JS'
  },
  {
    id: 5,
    name: 'Lisa Wang',
    email: 'lisa.w@email.com',
    phone: '+1 234-567-8905',
    status: 'expired',
    plan: 'Basic Monthly',
    joinDate: '2023-09-15',
    lastSession: '2024-01-30',
    totalSessions: 36,
    amountDue: 300,
    avatar: 'https://i.pravatar.cc/150?img=5',
    initials: 'LW'
  },
  {
    id: 6,
    name: 'Tom Wilson',
    email: 'tom.wilson@email.com',
    phone: '+1 234-567-8906',
    status: 'active',
    plan: 'Premium Monthly',
    joinDate: '2024-01-01',
    lastSession: '2024-03-08',
    totalSessions: 32,
    amountDue: 0,
    avatar: 'https://i.pravatar.cc/150?img=6',
    initials: 'TW'
  },
]

export default function MembersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [members] = useState(mockMembers)

  const getStatusBadge = (status: string) => {
    const variants = {
      active: { icon: CheckCircle, class: 'bg-green-100 text-green-700 border-green-200' },
      paused: { icon: Clock, class: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      expired: { icon: XCircle, class: 'bg-red-100 text-red-700 border-red-200' },
    }
    const variant = variants[status as keyof typeof variants]
    const Icon = variant?.icon
    
    return (
      <Badge className={`${variant?.class} gap-1 font-medium`}>
        {Icon && <Icon className="h-3 w-3" />}
        {status}
      </Badge>
    )
  }

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          member.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: members.length,
    active: members.filter(m => m.status === 'active').length,
    paused: members.filter(m => m.status === 'paused').length,
    expired: members.filter(m => m.status === 'expired').length,
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Members Management
          </h1>
          <p className="text-gray-600 mt-1">Manage your fitness members and their subscriptions</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Members</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
          <div className="text-2xl font-bold text-green-700">{stats.active}</div>
          <div className="text-sm text-gray-600">Active</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-4">
          <div className="text-2xl font-bold text-yellow-700">{stats.paused}</div>
          <div className="text-sm text-gray-600">Paused</div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-xl p-4">
          <div className="text-2xl font-bold text-red-700">{stats.expired}</div>
          <div className="text-sm text-gray-600">Expired</div>
        </div>
      </div>

      {/* Filters */}
      <DibsCard className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search members by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </DibsCard>

      {/* Members List */}
      <DibsCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-medium text-gray-700">Member</th>
                <th className="text-left p-4 font-medium text-gray-700">Status</th>
                <th className="text-left p-4 font-medium text-gray-700">Plan</th>
                <th className="text-left p-4 font-medium text-gray-700">Sessions</th>
                <th className="text-left p-4 font-medium text-gray-700">Amount Due</th>
                <th className="text-left p-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          {member.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-gray-900">{member.name}</div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    {getStatusBadge(member.status)}
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-medium text-gray-900">{member.plan}</div>
                    <div className="text-xs text-gray-500">Since {member.joinDate}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium">{member.totalSessions}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className={`font-medium ${member.amountDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ₹{member.amountDue}
                    </div>
                  </td>
                  <td className="p-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Member
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Phone className="h-4 w-4 mr-2" />
                          Call Member
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <DollarSign className="h-4 w-4 mr-2" />
                          Create Invoice
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Member
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DibsCard>
    </div>
  )
}
