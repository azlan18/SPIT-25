import { useState, useEffect } from 'react'
import type { Company, Task } from '../types'
import { TaskForm } from './TaskForm'
import { StatusUpdateForm } from './StatusUpdateForm'
import { ReportGenerator } from './ReportGenerator'
import { companiesApi, tasksApi } from '../services/api'

export function Dashboard() {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  )
  const [tasks, setTasks] = useState<Task[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)

  // Fetch companies on component mount
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const companiesData = await companiesApi.getCompanies();
        setCompanies(companiesData);
      } catch (error) {
        console.error('Failed to fetch companies:', error);
      }
    }
    fetchCompanies()
  }, [])

  // Fetch tasks when company or date changes
  useEffect(() => {
    const fetchTasks = async () => {
      if (!selectedCompany) return
      
      setLoading(true)
      try {
        const tasksData = await tasksApi.getTasks(selectedCompany._id, selectedDate);
        setTasks(tasksData)
      } catch (error) {
        console.error('Failed to fetch tasks:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchTasks()
  }, [selectedCompany, selectedDate])

  const handleTaskSubmit = async (task: Omit<Task, 'id'>) => {
    try {
      const newTask = await tasksApi.createTask({
        ...task,
        companyId: selectedCompany!._id,
        date: selectedDate,
      })
      setTasks(prev => [...prev, newTask])
      setShowTaskForm(false)
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }

  const handleStatusUpdate = async (taskId: string, status: Task['status'], notes: string) => {
    try {
      const updatedTask = await tasksApi.updateTaskStatus(taskId, {
        status,
        notes,
        date: selectedDate,
        taskId,
        id: `${Date.now()}`,
        timeStamp: new Date().toISOString()
      })
      
      setTasks(prev =>
        prev.map(task =>
          task._id === taskId ? {
            ...updatedTask,
            id: updatedTask._id
          } : task
        )
      )
    } catch (error) {
      console.error('Failed to update task status:', error)
      throw error
    }
  }

  // Format date for display
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900">Daily Task Management</h1>
            <p className="text-sm text-gray-500">
              Tasks for {formatDate(selectedDate)}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={selectedCompany?._id || ''}
              onChange={e => {
                const company = companies.find(c => c._id === e.target.value)
                setSelectedCompany(company || null)
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                       focus:ring-blue-500 focus:border-blue-500 bg-white min-w-[200px]"
              aria-label="Select Company"
            >
              <option value="">Select Company</option>
              {companies.map(company => (
                <option key={company._id} value={company._id}>
                  {company.name}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                       focus:ring-blue-500 focus:border-blue-500 bg-white"
              aria-label="Select Date"
            />
            {selectedCompany && (
              <button
                onClick={() => setShowReportModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 
                         transition-colors flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Generate Report
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Task List Section */}
      {selectedCompany && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">
                Tasks for {selectedCompany.name} - {formatDate(selectedDate)}
              </h2>
              <button
                onClick={() => setShowTaskForm(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 
                         rounded-lg hover:bg-blue-700 focus:outline-none 
                         focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add Task
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {tasks.length > 0 ? (
              tasks.map(task => (
                <div key={task._id} className="p-6 border-b border-gray-200 last:border-b-0">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {task.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {task.description}
                      </p>
                      {task.notes && (
                        <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          Latest Note: {task.notes}
                        </p>
                      )}
                    </div>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        task.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : task.status === 'in-progress'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>
                  
                  <StatusUpdateForm task={task} onUpdate={handleStatusUpdate} />
                  
                  {/* Task Updates History */}
                  {task.updates && task.updates.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Update History</h4>
                      <div className="space-y-2">
                        {task.updates.map(update => (
                          <div 
                            key={update.id} 
                            className="text-sm bg-gray-50 p-2 rounded flex justify-between items-center"
                          >
                            <div>
                              <span className={`font-medium ${
                                update.status === 'completed' ? 'text-green-600' :
                                update.status === 'in-progress' ? 'text-yellow-600' :
                                'text-gray-600'
                              }`}>
                                {update.status}
                              </span>
                              <span className="mx-2">-</span>
                              {update.notes}
                            </div>
                            <span className="text-gray-400 text-xs">
                              {new Date(update.timeStamp).toLocaleTimeString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">
                No tasks found for {formatDate(selectedDate)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          onClose={() => setShowTaskForm(false)}
          onSubmit={handleTaskSubmit}
        />
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Add Report Generator Modal */}
      {showReportModal && selectedCompany && (
        <ReportGenerator
          companyName={selectedCompany.name}
          tasks={tasks}
          selectedDate={selectedDate}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  )
} 