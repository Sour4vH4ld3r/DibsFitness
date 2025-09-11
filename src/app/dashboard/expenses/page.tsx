'use client'

import { useState } from 'react'
import { 
  Receipt, 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  TrendingDown,
  MoreVertical,
  Edit,
  Trash2,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
import { DibsCard } from '@/components/dibs/DibsCard'
import { DibsStats } from '@/components/dibs/DibsStats'
import { useExpenses } from '@/hooks/useExpenses'
import { AddExpenseForm } from '@/components/expenses/AddExpenseForm'

const categoryColors = {
  equipment: 'bg-blue-100 text-blue-700 border-blue-200',
  rent: 'bg-purple-100 text-purple-700 border-purple-200',
  utilities: 'bg-green-100 text-green-700 border-green-200',
  marketing: 'bg-pink-100 text-pink-700 border-pink-200',
  food: 'bg-orange-100 text-orange-700 border-orange-200',
  transport: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  other: 'bg-gray-100 text-gray-700 border-gray-200',
}

const categoryLabels = {
  equipment: 'Equipment',
  rent: 'Rent',
  utilities: 'Utilities',
  marketing: 'Marketing',
  food: 'Food & Supplements',
  transport: 'Transport',
  other: 'Other',
}

export default function ExpensesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const { expenses, loading, error, fetchExpenses, deleteExpense, totalExpenses, thisMonthExpenses } = useExpenses()

  const getCategoryBadge = (category: string) => {
    const colorClass = categoryColors[category as keyof typeof categoryColors] || categoryColors.other
    const label = categoryLabels[category as keyof typeof categoryLabels] || 'Other'
    
    return (
      <Badge className={`${colorClass} font-medium`}>
        {label}
      </Badge>
    )
  }

  const handleDeleteExpense = async (id: string, description: string) => {
    if (confirm(`Are you sure you want to delete "${description}"?`)) {
      const { error } = await deleteExpense(id)
      if (!error) {
        fetchExpenses() // Refresh the list
      } else {
        alert(`Failed to delete expense: ${error.message}`)
      }
    }
  }

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const stats = {
    total: expenses.length,
    thisMonth: expenses.filter(expense => {
      const expenseDate = new Date(expense.expense_date)
      const now = new Date()
      return expenseDate.getMonth() === now.getMonth() && 
             expenseDate.getFullYear() === now.getFullYear()
    }).length,
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Expense Management
          </h1>
          <p className="text-muted-foreground mt-1">Track and manage your business expenses</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)}
          variant="gradient"
          className="gap-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <DibsStats
          title="Total Expenses"
          value={`₹${totalExpenses.toLocaleString()}`}
          icon={<Receipt className="h-5 w-5" />}
          variant="danger"
          className="animate-in animate-stagger-1"
        />
        <DibsStats
          title="This Month"
          value={`₹${thisMonthExpenses.toLocaleString()}`}
          icon={<TrendingDown className="h-5 w-5" />}
          variant="warning"
          className="animate-in animate-stagger-2"
        />
        <div className="bg-card border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-foreground">{stats.total}</div>
          <div className="text-sm text-muted-foreground">Total Records</div>
        </div>
        <div className="bg-info-50 border border-info-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-info-700">{stats.thisMonth}</div>
          <div className="text-sm text-muted-foreground">This Month</div>
        </div>
      </div>

      {/* Filters */}
      <DibsCard className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search expenses by description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="equipment">Equipment</SelectItem>
              <SelectItem value="rent">Rent</SelectItem>
              <SelectItem value="utilities">Utilities</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="food">Food & Supplements</SelectItem>
              <SelectItem value="transport">Transport</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </DibsCard>

      {/* Expenses List */}
      <DibsCard className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="p-6 text-center text-danger-600">
            Error loading expenses: {error.message}
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No expenses found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || categoryFilter !== 'all' 
                ? 'Try adjusting your filters'
                : 'Get started by adding your first expense'}
            </p>
            {!searchQuery && categoryFilter === 'all' && (
              <Button 
                onClick={() => setShowAddForm(true)}
                variant="gradient"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Expense
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 font-medium text-foreground">Description</th>
                  <th className="text-left p-4 font-medium text-foreground">Category</th>
                  <th className="text-left p-4 font-medium text-foreground">Amount</th>
                  <th className="text-left p-4 font-medium text-foreground">Date</th>
                  <th className="text-left p-4 font-medium text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="border-b border-gray-200 hover:bg-muted/50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-foreground">{expense.description}</div>
                      <div className="text-sm text-muted-foreground">
                        Added {new Date(expense.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                      {getCategoryBadge(expense.category)}
                    </td>
                    <td className="p-4">
                      <div className="text-lg font-bold text-red-600">
                        ₹{expense.amount.toFixed(2)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">
                          {new Date(expense.expense_date).toLocaleDateString()}
                        </span>
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
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Expense
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-danger-600"
                            onClick={() => handleDeleteExpense(expense.id, expense.description)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Expense
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DibsCard>

      {/* Add Expense Form Modal */}
      {showAddForm && (
        <AddExpenseForm 
          onClose={() => setShowAddForm(false)}
          onSuccess={() => {
            setShowAddForm(false)
            fetchExpenses() // Refresh the list
          }}
        />
      )}
    </div>
  )
}