import Database from 'better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const DB_PATH = join(__dirname, 'database.sqlite')

let db = null

export const getDatabase = () => {
  if (!db) {
    db = new Database(DB_PATH)
    db.pragma('journal_mode = WAL')
  }
  return db
}

export const initDatabase = () => {
  try {
    const database = getDatabase()
    
    // Create bookings table
    database.exec(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        visit_date TEXT NOT NULL,
        visit_time TEXT NOT NULL,
        visit_type TEXT NOT NULL,
        message TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create events table
    database.exec(`
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        event_date TEXT NOT NULL,
        event_time TEXT NOT NULL,
        duration INTEGER,
        max_participants INTEGER,
        current_participants INTEGER DEFAULT 0,
        event_type TEXT,
        image_url TEXT,
        status TEXT DEFAULT 'upcoming',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create event_registrations table
    database.exec(`
      CREATE TABLE IF NOT EXISTS event_registrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events(id)
      )
    `)

    // Insert sample events if table is empty
    const eventCount = database.prepare('SELECT COUNT(*) as count FROM events').get()
    if (eventCount.count === 0) {
      insertSampleEvents(database)
    }

    console.log('✅ Database initialized successfully')
  } catch (error) {
    console.error('❌ Database initialization error:', error)
    throw error
  }
}

const insertSampleEvents = (database) => {
  const sampleEvents = [
    {
      title: '周末读书会：《被讨厌的勇气》',
      description: '一起探讨阿德勒心理学，学习如何拥有被讨厌的勇气，活出自由人生。',
      event_date: '2024-04-06',
      event_time: '14:00',
      duration: 120,
      max_participants: 15,
      event_type: 'reading',
      image_url: '📚'
    },
    {
      title: '手冲咖啡体验课',
      description: '从选豆到冲泡，学习手冲咖啡的完整流程，品鉴不同产区咖啡的风味。',
      event_date: '2024-04-07',
      event_time: '10:00',
      duration: 90,
      max_participants: 8,
      event_type: 'workshop',
      image_url: '☕'
    },
    {
      title: '水彩画入门工作坊',
      description: '零基础也能画！学习水彩画基础技法，完成你的第一幅水彩作品。',
      event_date: '2024-04-13',
      event_time: '14:00',
      duration: 180,
      max_participants: 12,
      event_type: 'art',
      image_url: '🎨'
    },
    {
      title: '黑胶唱片鉴赏会',
      description: '重温经典，聆听爵士、古典、摇滚等不同风格的黑胶唱片。',
      event_date: '2024-04-14',
      event_time: '19:00',
      duration: 120,
      max_participants: 20,
      event_type: 'music',
      image_url: '🎵'
    },
    {
      title: '正念冥想体验',
      description: '在繁忙的都市生活中，学习正念冥想技巧，找回内心的平静。',
      event_date: '2024-04-20',
      event_time: '09:00',
      duration: 60,
      max_participants: 10,
      event_type: 'wellness',
      image_url: '🧘'
    }
  ]

  const insert = database.prepare(`
    INSERT INTO events (title, description, event_date, event_time, duration, max_participants, event_type, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)

  for (const event of sampleEvents) {
    insert.run(event.title, event.description, event.event_date, event.event_time, event.duration, event.max_participants, event.event_type, event.image_url)
  }

  console.log('✅ Sample events inserted')
}

export default { getDatabase, initDatabase }

