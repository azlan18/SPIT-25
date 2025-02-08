const API_URL = 'http://localhost:5000/api'

export const api = {
  async getCompanies() {
    const response = await fetch(`${API_URL}/companies`)
    return response.json()
  },

  async createCompany(company: Omit<Company, 'id'>) {
    const response = await fetch(`${API_URL}/companies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(company),
    })
    return response.json()
  },

  async getTasks(companyId: string, date: string) {
    try {
      const response = await fetch(
        `${API_URL}/tasks?companyId=${companyId}&date=${date}`,
      )
      if (!response.ok) {
        throw new Error('Failed to fetch tasks')
      }
      return response.json()
    } catch (error) {
      console.error('Error fetching tasks:', error)
      throw error
    }
  },

  async createTask(task: Omit<Task, 'id'>) {
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...task,
          companyId: task.companyId,
        }),
      })
      if (!response.ok) {
        throw new Error('Failed to create task')
      }
      return response.json()
    } catch (error) {
      console.error('Error creating task:', error)
      throw error
    }
  },

  async updateTaskStatus(taskId: string, update: TaskUpdate) {
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}/updates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(update),
      })
      if (!response.ok) {
        throw new Error('Failed to update task status')
      }
      return response.json()
    } catch (error) {
      console.error('Error updating task status:', error)
      throw error
    }
  },

  async generateReport(prompt: string) {
    try {
      const response = await fetch(`${API_URL}/generate-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: 'Failed to generate report',
          details: 'Server error occurred'
        }))
        throw new Error(errorData.details || 'Failed to generate report')
      }

      const data = await response.json()
      if (!data.report) {
        throw new Error('Invalid response format from server')
      }

      return data
    } catch (error: any) {
      console.error('Report generation error:', error)
      throw new Error(error.message || 'Failed to generate report')
    }
  },
} 