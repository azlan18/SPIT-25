const express = require('express')
const taskController = require('../controllers/taskController')
const router = express.Router()

// Task routes
router.get('/', taskController.getByCompany)
router.post('/', taskController.create)
router.post('/:id/updates', taskController.addUpdate)
router.delete('/:id', taskController.delete)

module.exports = router 