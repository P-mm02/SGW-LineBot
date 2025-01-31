const express = require('express')
const bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.json())

// Import webhook routes
const webhookRoutes = require('./webhook')
app.use('/', webhookRoutes)

// Debugging: Check if LINE_ACCESS_TOKEN is loaded
console.log('Environment Variables:', process.env)
console.log(
  'LINE_ACCESS_TOKEN:',
  process.env.LINE_ACCESS_TOKEN ? 'Loaded ✅' : 'Not Found'
)

// Keep server alive & prevent Railway from stopping
process.on('SIGTERM', () => {
  console.log('⚠️ Received SIGTERM. Shutting down gracefully...')
  process.exit(0)
})

app.listen(process.env.PORT || 3000, () =>
  console.log('Server running on Railway ✅')
)
