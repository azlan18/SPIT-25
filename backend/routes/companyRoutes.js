const express = require('express')
const companyController = require('../controllers/companyController')
const router = express.Router()

// Company routes
router.get('/', companyController.getAll)
router.post('/', companyController.create)
router.put('/:id', companyController.update)

module.exports = router