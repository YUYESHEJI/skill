import express from 'express'
import { body, validationResult } from 'express-validator'
import { getDatabase } from '../database.js'

const router = express.Router()

// GET /api/events - Get all events
router.get('/', (req, res) => {
  try {
    const db = getDatabase()
    const { type, status = 'upcoming' } = req.query

    let query = 'SELECT * FROM events WHERE 1=1'
    const params = []

    if (type) {
      query += ' AND event_type = ?'
      params.push(type)
    }

    if (status) {
      query += ' AND status = ?'
      params.push(status)
    }

    query += ' ORDER BY event_date ASC, event_time ASC'

    const events = db.prepare(query).all(...params)

    res.json({
      success: true,
      count: events.length,
      data: events
    })
  } catch (error) {
    console.error('Error fetching events:', error)
    res.status(500).json({
      success: false,
      error: '获取活动列表失败'
    })
  }
})

// GET /api/events/:id - Get single event
router.get('/:id', (req, res) => {
  try {
    const db = getDatabase()
    
    const event = db.prepare(`
      SELECT e.*, 
        (SELECT COUNT(*) FROM event_registrations WHERE event_id = e.id) as registered_count
      FROM events e 
      WHERE e.id = ?
    `).get(req.params.id)

    if (!event) {
      return res.status(404).json({
        success: false,
        error: '活动不存在'
      })
    }

    // Get registered participants
    const participants = db.prepare(`
      SELECT name, email, created_at 
      FROM event_registrations 
      WHERE event_id = ?
      ORDER BY created_at DESC
    `).all(req.params.id)

    res.json({
      success: true,
      data: {
        ...event,
        participants
      }
    })
  } catch (error) {
    console.error('Error fetching event:', error)
    res.status(500).json({
      success: false,
      error: '获取活动信息失败'
    })
  }
})

// POST /api/events - Create new event (admin only)
router.post('/', [
  body('title').trim().notEmpty().withMessage('活动标题不能为空'),
  body('event_date').notEmpty().withMessage('活动日期不能为空'),
  body('event_time').notEmpty().withMessage('活动时间不能为空'),
  body('max_participants').isInt({ min: 1 }).withMessage('参与人数限制必须大于0')
], (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      })
    }

    const {
      title,
      description,
      event_date,
      event_time,
      duration,
      max_participants,
      event_type,
      image_url
    } = req.body

    const db = getDatabase()

    const result = db.prepare(`
      INSERT INTO events (title, description, event_date, event_time, duration, max_participants, event_type, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(title, description, event_date, event_time, duration, max_participants, event_type, image_url)

    const newEvent = db.prepare(`
      SELECT * FROM events WHERE id = ?
    `).get(result.lastInsertRowid)

    res.status(201).json({
      success: true,
      message: '活动创建成功',
      data: newEvent
    })
  } catch (error) {
    console.error('Error creating event:', error)
    res.status(500).json({
      success: false,
      error: '创建活动失败'
    })
  }
})

// POST /api/events/:id/register - Register for an event
router.post('/:id/register', [
  body('name').trim().notEmpty().withMessage('姓名不能为空'),
  body('email').isEmail().withMessage('请输入有效的邮箱地址'),
  body('phone').matches(/^1[3-9]\d{9}$/).withMessage('请输入有效的手机号')
], (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      })
    }

    const { name, email, phone } = req.body
    const eventId = req.params.id

    const db = getDatabase()

    // Check if event exists and has space
    const event = db.prepare(`
      SELECT * FROM events WHERE id = ?
    `).get(eventId)

    if (!event) {
      return res.status(404).json({
        success: false,
        error: '活动不存在'
      })
    }

    // Check if already registered
    const existingRegistration = db.prepare(`
      SELECT * FROM event_registrations 
      WHERE event_id = ? AND email = ?
    `).get(eventId, email)

    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        error: '你已经报名过这个活动了'
      })
    }

    // Check availability
    const registrationCount = db.prepare(`
      SELECT COUNT(*) as count FROM event_registrations WHERE event_id = ?
    `).get(eventId)

    if (registrationCount.count >= event.max_participants) {
      return res.status(400).json({
        success: false,
        error: '活动名额已满'
      })
    }

    // Create registration
    db.prepare(`
      INSERT INTO event_registrations (event_id, name, email, phone)
      VALUES (?, ?, ?, ?)
    `).run(eventId, name, email, phone)

    // Update current participants count
    db.prepare(`
      UPDATE events 
      SET current_participants = current_participants + 1
      WHERE id = ?
    `).run(eventId)

    res.status(201).json({
      success: true,
      message: '报名成功！我们会通过邮件发送活动详情。',
      data: {
        event_id: eventId,
        name,
        email
      }
    })
  } catch (error) {
    console.error('Error registering for event:', error)
    res.status(500).json({
      success: false,
      error: '报名失败，请稍后重试'
    })
  }
})

// PUT /api/events/:id - Update event
router.put('/:id', (req, res) => {
  try {
    const {
      title,
      description,
      event_date,
      event_time,
      duration,
      max_participants,
      event_type,
      image_url,
      status
    } = req.body

    const db = getDatabase()

    db.prepare(`
      UPDATE events 
      SET title = COALESCE(?, title),
          description = COALESCE(?, description),
          event_date = COALESCE(?, event_date),
          event_time = COALESCE(?, event_time),
          duration = COALESCE(?, duration),
          max_participants = COALESCE(?, max_participants),
          event_type = COALESCE(?, event_type),
          image_url = COALESCE(?, image_url),
          status = COALESCE(?, status)
      WHERE id = ?
    `).run(title, description, event_date, event_time, duration, max_participants, event_type, image_url, status, req.params.id)

    const updatedEvent = db.prepare(`
      SELECT * FROM events WHERE id = ?
    `).get(req.params.id)

    if (!updatedEvent) {
      return res.status(404).json({
        success: false,
        error: '活动不存在'
      })
    }

    res.json({
      success: true,
      message: '活动信息已更新',
      data: updatedEvent
    })
  } catch (error) {
    console.error('Error updating event:', error)
    res.status(500).json({
      success: false,
      error: '更新活动失败'
    })
  }
})

// DELETE /api/events/:id - Delete event
router.delete('/:id', (req, res) => {
  try {
    const db = getDatabase()

    // Delete related registrations first
    db.prepare(`
      DELETE FROM event_registrations WHERE event_id = ?
    `).run(req.params.id)

    // Delete event
    const result = db.prepare(`
      DELETE FROM events WHERE id = ?
    `).run(req.params.id)

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: '活动不存在'
      })
    }

    res.json({
      success: true,
      message: '活动已删除'
    })
  } catch (error) {
    console.error('Error deleting event:', error)
    res.status(500).json({
      success: false,
      error: '删除活动失败'
    })
  }
})

export default router
