const errorHandler = (err, req, res, next) => {
  console.error(err.stack)

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: Object.values(err.errors).map(e => e.message)
    })
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID',
      details: 'The provided ID is not valid'
    })
  }

  res.status(500).json({
    error: 'Internal Server Error',
    details: err.message
  })
}

module.exports = errorHandler 