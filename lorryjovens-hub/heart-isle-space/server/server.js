import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import bookingRoutes from './routes/bookings.js'
import eventRoutes from './routes/events.js'
import { initDatabase } from './database.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

// Initialize database
initDatabase()

// API Routes
app.use('/api/bookings', bookingRoutes)
app.use('/api/events', eventRoutes)

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'Heart Isle Space API'
  })
})

// Serve static files from public directory
app.use(express.static(join(__dirname, 'public')))

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

// Serve React app for all non-API routes
app.use((req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`🌿 Heart Isle Space API Server running on port ${PORT}`)
  console.log(`📚 API Documentation:`)
  console.log(`   - GET  /api/health     - Health check`)
  console.log(`   - GET  /api/events     - List all events`)
  console.log(`   - POST /api/bookings   - Create a booking`)
  console.log(`   - GET  /api/bookings   - List all bookings`)
})

export default app
