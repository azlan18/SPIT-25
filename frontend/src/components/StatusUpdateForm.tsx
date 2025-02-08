import { useState } from 'react'
import type { Task } from '../types'

interface StatusUpdateFormProps {
  task: Task
  onUpdate: (taskId: string, status: Task['status'], notes: string) => void
}

export function StatusUpdateForm({ task, onUpdate }: StatusUpdateFormProps) {
  const [status, setStatus] = useState<Task['status']>(task.status)
  const [notes, setNotes] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!notes.trim()) return
    
    setIsUpdating(true)
    try {
      await onUpdate(task._id, status, notes)
      setNotes('') // Clear notes only on successful update
    } catch (error) {
      console.error('Failed to update task:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-4">
        <select
          value={status}
          onChange={e => setStatus(e.target.value as Task['status'])}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="todo">Todo</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <input
          type="text"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Add notes about the progress..."
          className="flex-[2] px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <button
          type="submit"
          disabled={isUpdating || !notes.trim()}
          className={`px-4 py-2 text-white rounded-md transition-colors
            ${isUpdating || !notes.trim() 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isUpdating ? 'Updating...' : 'Update'}
        </button>
      </div>
    </form>
  )
} 