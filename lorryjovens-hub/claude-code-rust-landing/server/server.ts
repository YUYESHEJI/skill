import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite
const dbPath = process.env.NODE_ENV === 'production' 
  ? '/tmp/analytics.sqlite' 
  : path.join(__dirname, 'analytics.sqlite');

const db = new sqlite3.Database(dbPath);

// Create tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS visits (
      id TEXT PRIMARY KEY,
      ip TEXT,
      user_agent TEXT,
      referrer TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      page_path TEXT
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS contact_submissions (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS github_stars (
      count INTEGER,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

// API Routes

// Track visit
app.post('/api/visit', (req, res) => {
  try {
    const { page_path = '/' } = req.body;
    const id = uuidv4();
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    db.run(
      'INSERT INTO visits (id, ip, user_agent, page_path) VALUES (?, ?, ?, ?)',
      [id, ip, userAgent, page_path],
      (err) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to track visit' });
        }
        
        db.get('SELECT COUNT(*) as total FROM visits', (err, row) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to fetch stats' });
          }
          res.json({ success: true, totalVisits: (row as any).total });
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Failed to track visit' });
  }
});

// Get stats
app.get('/api/stats', (req, res) => {
  try {
    db.get('SELECT COUNT(*) as count FROM visits', (err, totalVisits) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch stats' });
      
      db.get('SELECT COUNT(DISTINCT ip) as count FROM visits', (err, uniqueIPs) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch stats' });
        
        db.get(`
          SELECT COUNT(*) as count FROM visits 
          WHERE DATE(timestamp) = DATE('now')
        `, (err, todayVisits) => {
          if (err) return res.status(500).json({ error: 'Failed to fetch stats' });
          
          res.json({
            totalVisits: (totalVisits as any).count,
            uniqueVisitors: (uniqueIPs as any).count,
            todayVisits: (todayVisits as any).count
          });
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Contact form
app.post('/api/contact', (req, res) => {
  try {
    const { email, message } = req.body;
    if (!email || !message) {
      return res.status(400).json({ error: 'Email and message required' });
    }
    
    const id = uuidv4();
    db.run(
      'INSERT INTO contact_submissions (id, email, message) VALUES (?, ?, ?)',
      [id, email, message],
      (err) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to save message' });
        }
        res.json({ success: true, id });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Failed to save message' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const clientPath = path.join(__dirname, '../client/dist');
  app.use(express.static(clientPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});