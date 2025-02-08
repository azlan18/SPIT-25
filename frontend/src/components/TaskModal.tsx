import { useState } from 'react'
import type { Task, Project } from '../types'

interface TaskModalProps {
  projects: Project[]
  onClose: () => void
  onSave: (task: Omit<Task, 'id'>) => void
  initialTask?: Task
}

export function TaskModal({ projects, onClose, onSave, initialTask }: TaskModalProps) {
  const [task, setTask] = useState({
    title: initialTask?.title || '',
    description: initialTask?.description || '',
    status: initialTask?.status || 'todo',
    date: initialTask?.date || new Date().toISOString().split('T')[0],
    notes: initialTask?.notes || '',
    projectId: initialTask?.projectId || projects[0]?.id || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(task)
    onClose()
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{initialTask ? 'Edit Task' : 'New Task'}</h3>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              value={task.title}
              onChange={e => setTask({ ...task, title: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="project">Project</label>
            <select
              id="project"
              value={task.projectId}
              onChange={e => setTask({ ...task, projectId: e.target.value })}
              required
            >
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={task.description}
              onChange={e => setTask({ ...task, description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={task.status}
              onChange={e =>
                setTask({
                  ...task,
                  status: e.target.value as Task['status'],
                })
              }
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              id="date"
              type="date"
              value={task.date}
              onChange={e => setTask({ ...task, date: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              value={task.notes}
              onChange={e => setTask({ ...task, notes: e.target.value })}
              rows={2}
            />
          </div>
          <div className="modal-footer">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-button">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 