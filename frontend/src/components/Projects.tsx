import { useState } from 'react'
import type { Project, Task } from '../types'

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'AI Healthcare Solution',
    description: 'Healthcare startup developing AI diagnostic tools',
    startDate: '2024-03-15',
    companyName: 'HealthTech AI',
    status: 'active',
  },
  // Add more mock projects as needed
]

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Complete MVP Development',
    description: 'Finish the minimum viable product for initial testing',
    status: 'in-progress',
    deadline: '2024-03-30',
    projectId: '1',
    notes: 'Need to focus on core features first',
  },
  // Add more mock tasks as needed
]

export function Projects() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [showAddTask, setShowAddTask] = useState(false)

  const projectTasks = mockTasks.filter(
    task => task.projectId === selectedProject,
  )

  return (
    <div className="projects-container">
      <div className="projects-list">
        <div className="projects-header">
          <h2>Projects</h2>
          <button className="add-button">+ New Project</button>
        </div>
        <div className="project-cards">
          {mockProjects.map(project => (
            <div
              key={project.id}
              className={`project-card ${
                selectedProject === project.id ? 'selected' : ''
              }`}
              onClick={() => setSelectedProject(project.id)}
            >
              <h3>{project.name}</h3>
              <p className="company-name">{project.companyName}</p>
              <span className={`status-badge ${project.status}`}>
                {project.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {selectedProject && (
        <div className="tasks-section">
          <div className="tasks-header">
            <h2>Tasks</h2>
            <button
              className="add-button"
              onClick={() => setShowAddTask(!showAddTask)}
            >
              + New Task
            </button>
          </div>
          <div className="tasks-grid">
            {projectTasks.map(task => (
              <div key={task.id} className="task-card">
                <div className="task-header">
                  <h4>{task.title}</h4>
                  <span className={`status-badge ${task.status}`}>
                    {task.status}
                  </span>
                </div>
                <p>{task.description}</p>
                <div className="task-footer">
                  <span className="deadline">
                    Due: {new Date(task.deadline).toLocaleDateString()}
                  </span>
                  {task.notes && (
                    <div className="notes">
                      <strong>Notes:</strong>
                      <p>{task.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 