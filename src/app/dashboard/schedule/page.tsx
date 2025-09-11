'use client'

import { useState } from 'react'
import { 
  Calendar as CalendarIcon,
  Plus,
  Clock,
  Users,
  MapPin,
  Video,
  ChevronLeft,
  ChevronRight,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  UserCheck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DibsCard } from '@/components/dibs/DibsCard'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface SessionData {
  id: number
  time: string
  member: string
  type: string
  duration: number
  location: string
  status: string
  groupSize?: number
}

// Mock schedule data
const mockSchedule: Record<string, SessionData[]> = {
  Monday: [
    { id: 1, time: '09:00', member: 'Sarah Johnson', type: 'Personal Training', duration: 60, location: 'Gym Floor', status: 'confirmed' },
    { id: 2, time: '11:00', member: 'Mike Chen', type: 'Nutrition Consultation', duration: 30, location: 'Online', status: 'confirmed' },
    { id: 3, time: '14:00', member: 'Group Session', type: 'HIIT Class', duration: 45, location: 'Studio A', status: 'confirmed', groupSize: 8 },
    { id: 4, time: '16:00', member: 'Emma Davis', type: 'Yoga', duration: 60, location: 'Studio B', status: 'pending' },
  ],
  Tuesday: [
    { id: 5, time: '08:00', member: 'John Smith', type: 'Strength Training', duration: 60, location: 'Gym Floor', status: 'confirmed' },
    { id: 6, time: '10:00', member: 'Lisa Wang', type: 'Personal Training', duration: 60, location: 'Gym Floor', status: 'confirmed' },
    { id: 7, time: '15:00', member: 'Group Session', type: 'Pilates', duration: 60, location: 'Studio A', status: 'confirmed', groupSize: 6 },
    { id: 8, time: '17:00', member: 'Tom Wilson', type: 'Boxing', duration: 45, location: 'Boxing Ring', status: 'confirmed' },
  ],
  Wednesday: [
    { id: 9, time: '09:30', member: 'Sarah Johnson', type: 'Personal Training', duration: 60, location: 'Gym Floor', status: 'confirmed' },
    { id: 10, time: '11:30', member: 'Mike Chen', type: 'Cardio Session', duration: 45, location: 'Gym Floor', status: 'confirmed' },
    { id: 11, time: '14:30', member: 'Emma Davis', type: 'Recovery Session', duration: 30, location: 'Recovery Room', status: 'confirmed' },
    { id: 12, time: '18:00', member: 'Group Session', type: 'Spin Class', duration: 45, location: 'Spin Studio', status: 'confirmed', groupSize: 12 },
  ],
  Thursday: [
    { id: 13, time: '08:30', member: 'John Smith', type: 'Personal Training', duration: 60, location: 'Gym Floor', status: 'confirmed' },
    { id: 14, time: '10:30', member: 'Lisa Wang', type: 'Flexibility Training', duration: 45, location: 'Studio B', status: 'cancelled' },
    { id: 15, time: '13:00', member: 'Tom Wilson', type: 'Strength Training', duration: 60, location: 'Gym Floor', status: 'confirmed' },
    { id: 16, time: '16:30', member: 'Group Session', type: 'Zumba', duration: 60, location: 'Studio A', status: 'confirmed', groupSize: 15 },
  ],
  Friday: [
    { id: 17, time: '09:00', member: 'Sarah Johnson', type: 'Assessment', duration: 90, location: 'Assessment Room', status: 'confirmed' },
    { id: 18, time: '11:00', member: 'Mike Chen', type: 'Personal Training', duration: 60, location: 'Gym Floor', status: 'confirmed' },
    { id: 19, time: '14:00', member: 'Emma Davis', type: 'Meditation', duration: 30, location: 'Online', status: 'confirmed' },
    { id: 20, time: '15:30', member: 'John Smith', type: 'Personal Training', duration: 60, location: 'Gym Floor', status: 'pending' },
  ],
  Saturday: [
    { id: 21, time: '09:00', member: 'Group Session', type: 'Bootcamp', duration: 90, location: 'Outdoor', status: 'confirmed', groupSize: 20 },
    { id: 22, time: '11:00', member: 'Lisa Wang', type: 'Personal Training', duration: 60, location: 'Gym Floor', status: 'confirmed' },
    { id: 23, time: '13:00', member: 'Tom Wilson', type: 'Sports Conditioning', duration: 60, location: 'Field', status: 'confirmed' },
  ],
  Sunday: [
    { id: 24, time: '10:00', member: 'Group Session', type: 'Yoga Flow', duration: 75, location: 'Studio B', status: 'confirmed', groupSize: 10 },
    { id: 25, time: '12:00', member: 'Sarah Johnson', type: 'Recovery Session', duration: 45, location: 'Recovery Room', status: 'confirmed' },
  ],
}

const timeSlots = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', 
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
]

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function SchedulePage() {
  const [viewType, setViewType] = useState('week')
  const [selectedWeek, setSelectedWeek] = useState('current')
  const [showNewSessionModal, setShowNewSessionModal] = useState(false)

  // Navigation handlers
  const handleNewSession = () => {
    setShowNewSessionModal(true)
  }

  const handlePreviousWeek = () => {
    // Navigate to previous week
    console.log('Navigate to previous week')
  }

  const handleNextWeek = () => {
    // Navigate to next week
    console.log('Navigate to next week')
  }

  const handleFilter = () => {
    // Open filter modal
    console.log('Open filter modal')
  }

  const getSessionColor = (type: string) => {
    const colors: Record<string, string> = {
      'Personal Training': 'bg-primary-100 border-primary-300 text-primary-800',
      'Group Session': 'bg-secondary-100 border-secondary-300 text-secondary-800',
      'Nutrition Consultation': 'bg-success-100 border-success-300 text-success-800',
      'HIIT Class': 'bg-warning-100 border-warning-300 text-warning-800',
      'Yoga': 'bg-accent-100 border-accent-300 text-accent-800',
      'Strength Training': 'bg-danger-100 border-danger-300 text-danger-800',
      'Pilates': 'bg-info-100 border-info-300 text-info-800',
      'Boxing': 'bg-muted border-muted-foreground/30 text-muted-foreground',
      'Cardio Session': 'bg-primary-50 border-primary-200 text-primary-700',
      'Recovery Session': 'bg-success-50 border-success-200 text-success-700',
      'Spin Class': 'bg-warning-50 border-warning-200 text-warning-700',
      'Flexibility Training': 'bg-accent-50 border-accent-200 text-accent-700',
      'Zumba': 'bg-secondary-50 border-secondary-200 text-secondary-700',
      'Assessment': 'bg-muted border-gray-200 text-muted-foreground',
      'Meditation': 'bg-info-50 border-info-200 text-info-700',
      'Bootcamp': 'bg-warning-100 border-warning-300 text-warning-800',
      'Sports Conditioning': 'bg-success-100 border-success-300 text-success-800',
      'Yoga Flow': 'bg-accent-50 border-accent-200 text-accent-700',
    }
    return colors[type] || 'bg-muted border-gray-200 text-muted-foreground'
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      confirmed: 'bg-success-100 text-success-700',
      pending: 'bg-warning-100 text-warning-700',
      cancelled: 'bg-danger-100 text-danger-700',
    }
    return variants[status as keyof typeof variants] || 'bg-muted text-muted-foreground'
  }

  // Calculate stats
  const totalSessions = Object.values(mockSchedule).flat().length
  const confirmedSessions = Object.values(mockSchedule).flat().filter(s => s.status === 'confirmed').length
  const pendingSessions = Object.values(mockSchedule).flat().filter(s => s.status === 'pending').length
  const groupSessions = Object.values(mockSchedule).flat().filter(s => s.member === 'Group Session').length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Schedule Management
          </h1>
          <p className="text-muted-foreground mt-1">Manage your training sessions and appointments</p>
        </div>
        <Button 
          variant="gradient" 
          className="gap-2"
          onClick={handleNewSession}
        >
          <Plus className="h-4 w-4" />
          New Session
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            <div className="text-2xl font-bold text-foreground">{totalSessions}</div>
          </div>
          <div className="text-sm text-muted-foreground">Total Sessions</div>
        </div>
        <div className="bg-success-50 border border-success-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-success-600" />
            <div className="text-2xl font-bold text-success-700">{confirmedSessions}</div>
          </div>
          <div className="text-sm text-muted-foreground">Confirmed</div>
        </div>
        <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-warning-600" />
            <div className="text-2xl font-bold text-warning-700">{pendingSessions}</div>
          </div>
          <div className="text-sm text-muted-foreground">Pending</div>
        </div>
        <div className="bg-secondary-50 border border-secondary-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-secondary-600" />
            <div className="text-2xl font-bold text-secondary-700">{groupSessions}</div>
          </div>
          <div className="text-sm text-muted-foreground">Group Classes</div>
        </div>
      </div>

      {/* Controls */}
      <DibsCard className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={handlePreviousWeek}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium text-foreground">March 4-10, 2024</span>
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleNextWeek}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Select value={viewType} onValueChange={setViewType}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day View</SelectItem>
                <SelectItem value="week">Week View</SelectItem>
                <SelectItem value="month">Month View</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline"
              onClick={handleFilter}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>
      </DibsCard>

      {/* Calendar Grid */}
      <DibsCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[1200px]">
            {/* Days Header */}
            <div className="grid grid-cols-8 border-b bg-muted/50">
              <div className="p-3 font-medium text-foreground">Time</div>
              {days.map(day => (
                <div key={day} className="p-3 font-medium text-foreground text-center border-l border-gray-200">
                  {day}
                </div>
              ))}
            </div>

            {/* Time Slots */}
            {timeSlots.map(time => (
              <div key={time} className="grid grid-cols-8 border-b border-gray-200 hover:bg-muted/30">
                <div className="p-3 text-sm font-medium text-muted-foreground">{time}</div>
                {days.map(day => {
                  const session = mockSchedule[day as keyof typeof mockSchedule]?.find(s => s.time === time)
                  return (
                    <div key={`${day}-${time}`} className="p-2 border-l border-gray-200 min-h-[80px] relative">
                      {session && (
                        <div className={`rounded-lg border-2 p-2 ${getSessionColor(session.type)} cursor-pointer hover:shadow-md transition-shadow`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-xs truncate">
                                {session.member}
                              </p>
                              <p className="text-xs opacity-75 truncate">
                                {session.type}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                {session.location === 'Online' ? (
                                  <Video className="h-3 w-3" />
                                ) : (
                                  <MapPin className="h-3 w-3" />
                                )}
                                <span className="text-xs">{session.duration}min</span>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  <MoreVertical className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-danger-600">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Cancel
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          {session.groupSize && (
                            <div className="flex items-center gap-1 mt-1">
                              <Users className="h-3 w-3" />
                              <span className="text-xs">{session.groupSize} members</span>
                            </div>
                          )}
                          <Badge className={`${getStatusBadge(session.status)} text-xs mt-1`}>
                            {session.status}
                          </Badge>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </DibsCard>
    </div>
  )
}
