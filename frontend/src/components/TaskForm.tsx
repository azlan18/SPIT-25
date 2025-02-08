import { useState } from 'react'
import type { Task } from '../types'

interface TaskFormProps {
  onClose: () => void
  onSubmit: (task: Omit<Task, 'id'>) => void
}

export function TaskForm({ onClose, onSubmit }: TaskFormProps) {
  const [task, setTask] = useState({
    title: '',
    description: '',
    status: 'todo' as Task['status'],
    notes: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(task)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Add New Task</h2>
              <p className="mt-1 text-sm text-gray-500">Create a new task with details</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 
                       hover:bg-gray-100 rounded-full"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="px-8 py-6 space-y-6">
            {/* Title Input */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-900 mb-2">
                Task Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={task.title}
                onChange={e => setTask({ ...task, title: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl
                          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                          shadow-sm transition-all duration-200
                          placeholder-gray-400 text-gray-900"
                placeholder="Enter task title"
                required
              />
            </div>

            {/* Description Input */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={task.description}
                onChange={e => setTask({ ...task, description: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl
                          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                          shadow-sm transition-all duration-200
                          placeholder-gray-400 text-gray-900
                          min-h-[120px] resize-none"
                placeholder="Describe the task in detail..."
                rows={4}
              />
            </div>

            {/* Notes Input */}
            <div>
              <label htmlFor="notes" className="block text-sm font-semibold text-gray-900 mb-2">
                Additional Notes
              </label>
              <textarea
                id="notes"
                value={task.notes}
                onChange={e => setTask({ ...task, notes: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl
                          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                          shadow-sm transition-all duration-200
                          placeholder-gray-400 text-gray-900
                          resize-none"
                placeholder="Any additional notes or context..."
                rows={2}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 bg-gray-50 rounded-b-2xl border-t border-gray-200">
            <div className="flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-sm font-medium text-gray-700 
                          bg-white border border-gray-300 rounded-xl
                          hover:bg-gray-50 focus:outline-none focus:ring-2 
                          focus:ring-offset-2 focus:ring-gray-200 
                          transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 text-sm font-medium text-white 
                          bg-blue-600 rounded-xl hover:bg-blue-700 
                          focus:outline-none focus:ring-2 focus:ring-offset-2 
                          focus:ring-blue-500 transition-colors shadow-sm"
              >
                Create Task
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 