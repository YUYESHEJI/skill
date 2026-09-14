import express from 'express'
import { body, validationResult } from 'express-validator'
import { getDatabase } from '../database.js'

const router = express.Router()

// Validation middleware
const bookingValidation = [
  body('name').trim().notEmpty().withMessage('姓名不能为空'),
  body('email').isEmail().withMessage('请输入有效的邮箱地址'),
  body('phone').matches(/^1[3-9]\d{9}$/).withMessage('请输入有效的手机号'),
  body('date').notEmpty().withMessage('请选择预约日期'),
  body('time').notEmpty().withMessage('请选择预约时间'),
  body('type').notEmpty().withMessage('请选择预约类型')
]

// GET /api/bookings - Get all bookings
router.get('/', (req, res) => {
  try {
    const db = getDatabase()
    const bookings = db.prepare(`
      SELECT * FROM bookings 
      ORDER BY created_at DESC
    `).all()
    
    res.json({
      success: true,
      data: bookings
    })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    res.status(500).json({
      success: false,
      error: '获取预约列表失败'
    })
  }
})

// GET /api/bookings/:id - Get single booking
router.get('/:id', (req, res) => {
  try {
    const db = getDatabase()
    const booking = db.prepare(`
      SELECT * FROM bookings WHERE id = ?
    `).get(req.params.id)
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: '预约记录不存在'
      })
    }
    
    res.json({
      success: true,
      data: booking
    })
  } catch (error) {
    console.error('Error fetching booking:', error)
    res.status(500).json({
      success: false,
      error: '获取预约信息失败'
    })
  }
})

// POST /api/bookings - Create new booking
router.post('/', bookingValidation, (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      })
    }

    const { name, email, phone, date, time, type, message } = req.body

    const db = getDatabase()
    
    // Check if slot is available (max 5 bookings per time slot)
    const existingBookings = db.prepare(`
      SELECT COUNT(*) as count FROM bookings 
      WHERE visit_date = ? AND visit_time = ? AND status != 'cancelled'
    `).get(date, time)

    if (existingBookings.count >= 5) {
      return res.status(400).json({
        success: false,
        error: '该时间段预约已满，请选择其他时间'
      })
    }

    // Insert booking
    const result = db.prepare(`
      INSERT INTO bookings (name, email, phone, visit_date, visit_time, visit_type, message)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(name, email, phone, date, time, type, message || null)

    // Get the created booking
    const newBooking = db.prepare(`
      SELECT * FROM bookings WHERE id = ?
    `).get(result.lastInsertRowid)

    res.status(201).json({
      success: true,
      message: '预约成功！我们将在24小时内与你确认。',
      data: newBooking
    })
  } catch (error) {
    console.error('Error creating booking:', error)
    res.status(500).json({
      success: false,
      error: '创建预约失败，请稍后重试'
    })
  }
})

// PUT /api/bookings/:id - Update booking status
router.put('/:id', (req, res) => {
  try {
    const { status } = req.body
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed']
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: '无效的状态值'
      })
    }

    const db = getDatabase()
    
    db.prepare(`
      UPDATE bookings 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, req.params.id)

    const updatedBooking = db.prepare(`
      SELECT * FROM bookings WHERE id = ?
    `).get(req.params.id)

    if (!updatedBooking) {
      return res.status(404).json({
        success: false,
        error: '预约记录不存在'
      })
    }

    res.json({
      success: true,
      message: '预约状态已更新',
      data: updatedBooking
    })
  } catch (error) {
    console.error('Error updating booking:', error)
    res.status(500).json({
      success: false,
      error: '更新预约失败'
    })
  }
})

// DELETE /api/bookings/:id - Delete booking
router.delete('/:id', (req, res) => {
  try {
    const db = getDatabase()
    
    const result = db.prepare(`
      DELETE FROM bookings WHERE id = ?
    `).run(req.params.id)

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: '预约记录不存在'
      })
    }

    res.json({
      success: true,
      message: '预约已删除'
    })
  } catch (error) {
    console.error('Error deleting booking:', error)
    res.status(500).json({
      success: false,
      error: '删除预约失败'
    })
  }
})

// GET /api/bookings/availability/:date - Check availability for a date
router.get('/availability/:date', (req, res) => {
  try {
    const { date } = req.params
    const db = getDatabase()

    const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '19:00', '20:00']
    
    const availability = timeSlots.map(time => {
      const count = db.prepare(`
        SELECT COUNT(*) as count FROM bookings 
        WHERE visit_date = ? AND visit_time = ? AND status != 'cancelled'
      `).get(date, time)
      
      return {
        time,
        available: count.count < 5,
        remaining: 5 - count.count
      }
    })

    res.json({
      success: true,
      data: availability
    })
  } catch (error) {
    console.error('Error checking availability:', error)
    res.status(500).json({
      success: false,
      error: '查询可用时间失败'
    })
  }
})

export default router
