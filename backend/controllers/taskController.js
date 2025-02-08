import { Task } from '../models/Task.js'

export const taskController = {
  // Get tasks by company and date
  async getByCompany(req, res) {
    try {
      const { companyId, date } = req.query
      if (!companyId) {
        return res.status(400).json({ error: 'Company ID is required' })
      }

      const query = { companyId }
      if (date) {
        query.date = date
      }

      const tasks = await Task.find(query).sort({ createdAt: -1 })
      res.json(tasks)
    } catch (error) {
      console.error('Error fetching tasks:', error)
      res.status(500).json({ error: 'Failed to fetch tasks' })
    }
  },

  // Create new task
  async create(req, res) {
    try {
      const { title, description, status, date, companyId } = req.body
      
      const task = new Task({
        title,
        description,
        status,
        date,
        companyId
      })

      await task.save()
      res.status(201).json(task)
    } catch (error) {
      console.error('Error creating task:', error)
      res.status(500).json({ error: 'Failed to create task' })
    }
  },

  // Add update to task
  async addUpdate(req, res) {
    try {
      const { id } = req.params
      const { status, notes, date } = req.body

      const task = await Task.findById(id)
      if (!task) {
        return res.status(404).json({ error: 'Task not found' })
      }

      // Add the new update
      task.updates.push({
        status,
        notes,
        date,
        timeStamp: new Date()
      })

      // Save will trigger the pre-save middleware to update main task fields
      const updatedTask = await task.save()
      res.json(updatedTask)
    } catch (error) {
      console.error('Error adding update:', error)
      res.status(500).json({ error: 'Failed to add update' })
    }
  },

  // Delete task
  async delete(req, res) {
    try {
      const { id } = req.params
      await Task.findByIdAndDelete(id)
      res.json({ message: 'Task deleted successfully' })
    } catch (error) {
      console.error('Error deleting task:', error)
      res.status(500).json({ error: 'Failed to delete task' })
    }
  },

  // Get task history
  async getTaskHistory(req, res) {
    try {
      const { id } = req.params
      const task = await Task.findById(id)
      if (!task) {
        return res.status(404).json({ error: 'Task not found' })
      }
      res.json(task.updates)
    } catch (error) {
      console.error('Error fetching task history:', error)
      res.status(500).json({ error: 'Failed to fetch task history' })
    }
  }
} 