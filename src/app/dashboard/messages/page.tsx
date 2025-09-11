'use client'

import { useState } from 'react'
import { 
  MessageSquare,
  Plus,
  Send,
  Search,
  Users,
  Clock,
  CheckCircle,
  Edit,
  Copy,
  Trash2,
  Mail,
  Phone,
  Bell
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DibsCard } from '@/components/dibs/DibsCard'

// Mock data
const mockTemplates = [
  { id: 1, name: 'Welcome Message', type: 'email', category: 'Onboarding', uses: 156 },
  { id: 2, name: 'Session Reminder', type: 'sms', category: 'Scheduling', uses: 324 },
  { id: 3, name: 'Payment Reminder', type: 'email', category: 'Billing', uses: 89 },
  { id: 4, name: 'Birthday Wishes', type: 'email', category: 'Engagement', uses: 45 },
  { id: 5, name: 'Class Cancellation', type: 'sms', category: 'Scheduling', uses: 12 },
]

const mockHistory = [
  { id: 1, recipient: 'All Members', message: 'Holiday Schedule Update', type: 'broadcast', date: '2024-03-10', status: 'delivered', count: 127 },
  { id: 2, recipient: 'Sarah Johnson', message: 'Session Confirmation', type: 'individual', date: '2024-03-09', status: 'delivered', count: 1 },
  { id: 3, recipient: 'Active Members', message: 'New Class Announcement', type: 'broadcast', date: '2024-03-08', status: 'delivered', count: 84 },
  { id: 4, recipient: 'Mike Chen', message: 'Payment Reminder', type: 'individual', date: '2024-03-07', status: 'failed', count: 1 },
]

export default function MessagesPage() {
  const [activeTab, setActiveTab] = useState('templates')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSendMessageModal, setShowSendMessageModal] = useState(false)
  const [showNewTemplateModal, setShowNewTemplateModal] = useState(false)

  // Handler functions
  const handleSendMessage = () => {
    setShowSendMessageModal(true)
  }

  const handleNewTemplate = () => {
    setShowNewTemplateModal(true)
  }

  const handleEditTemplate = (templateId: number) => {
    console.log('Edit template:', templateId)
  }

  const handleDuplicateTemplate = (templateId: number) => {
    console.log('Duplicate template:', templateId)
  }

  const handleSendTemplate = (templateId: number) => {
    console.log('Send template:', templateId)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Messages & Communications
          </h1>
          <p className="text-gray-600 mt-1">Manage templates and send messages to members</p>
        </div>
        <Button 
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          onClick={handleSendMessage}
        >
          <Send className="h-4 w-4 mr-2" />
          Send Message
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <div className="text-2xl font-bold text-gray-900">567</div>
          </div>
          <div className="text-sm text-gray-600">Messages Sent</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div className="text-2xl font-bold text-green-700">98%</div>
          </div>
          <div className="text-sm text-gray-600">Delivery Rate</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            <div className="text-2xl font-bold text-purple-700">127</div>
          </div>
          <div className="text-sm text-gray-600">Recipients</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            <div className="text-2xl font-bold text-yellow-700">5</div>
          </div>
          <div className="text-sm text-gray-600">Scheduled</div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full sm:w-auto grid-cols-2 sm:inline-flex">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="history">Message History</TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <DibsCard className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search templates..."
                  className="pl-10"
                />
              </div>
              <Button 
                variant="outline"
                onClick={handleNewTemplate}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Template
              </Button>
            </div>
          </DibsCard>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockTemplates.map((template) => (
              <DibsCard key={template.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{template.category}</p>
                  </div>
                  <Badge className={template.type === 'email' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}>
                    {template.type === 'email' ? <Mail className="h-3 w-3 mr-1" /> : <Phone className="h-3 w-3 mr-1" />}
                    {template.type}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  Used {template.uses} times
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleEditTemplate(template.id)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDuplicateTemplate(template.id)}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Duplicate
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleSendTemplate(template.id)}
                  >
                    <Send className="h-3 w-3 mr-1" />
                    Send
                  </Button>
                </div>
              </DibsCard>
            ))}
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <DibsCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-700">Recipient</th>
                    <th className="text-left p-4 font-medium text-gray-700">Message</th>
                    <th className="text-left p-4 font-medium text-gray-700">Type</th>
                    <th className="text-left p-4 font-medium text-gray-700">Date</th>
                    <th className="text-left p-4 font-medium text-gray-700">Status</th>
                    <th className="text-left p-4 font-medium text-gray-700">Recipients</th>
                  </tr>
                </thead>
                <tbody>
                  {mockHistory.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-gray-900">{item.recipient}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-600">{item.message}</div>
                      </td>
                      <td className="p-4">
                        <Badge className={item.type === 'broadcast' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}>
                          {item.type}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-600">{item.date}</div>
                      </td>
                      <td className="p-4">
                        <Badge className={item.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                          {item.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-medium">{item.count}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DibsCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}
