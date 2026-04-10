const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const pool = require('./db');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'bader_secret_key_2026';

app.use(cors());
app.use(express.json());

// --- Health Check ---
app.get('/api', (req, res) => {
  res.json({ success: true, message: "Bader Node.js API is running" });
});

app.get('/api/test', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT 1 + 1 AS result');
    res.json({ success: true, message: "Database connected!", data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Database connection failed", error: error.message });
  }
});

app.get('/api/setup-db', async (req, res) => {
  try {
    const queries = [
      `CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(20) UNIQUE NOT NULL,
        username VARCHAR(50) UNIQUE,
        email VARCHAR(100),
        password VARCHAR(255) NOT NULL,
        role ENUM('citizen', 'department', 'admin') DEFAULT 'citizen',
        organization VARCHAR(100),
        logo_uri TEXT,
        cover_uri TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS complaints (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        location_text TEXT NOT NULL,
        lat DECIMAL(10, 8),
        lng DECIMAL(11, 8),
        category VARCHAR(100),
        status ENUM('submitted', 'under_review', 'in_progress', 'resolved') DEFAULT 'submitted',
        reporter_id INT,
        assigned_dept VARCHAR(100),
        media_urls JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE SET NULL
      )`,
      `CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        complaint_id VARCHAR(50),
        sender_id INT,
        sender_name VARCHAR(255),
        sender_role VARCHAR(50),
        text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL
      )`
    ];
    
    for (let query of queries) {
      await pool.execute(query);
    }
    
    res.json({ success: true, message: "Tables updated with logo_uri!" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- Authentication ---
app.post('/api/auth/register', async (req, res) => {
  const { phone, password, full_name, username, email, role, organization, logo_uri, cover_uri } = req.body;
  try {
    const [rows] = await pool.execute(
      'INSERT INTO users (phone, password, full_name, username, email, role, organization, logo_uri, cover_uri) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        phone.trim(), 
        password, 
        full_name.trim(), 
        username?.trim() || null, 
        email?.trim() || null, 
        role || 'citizen',
        organization || null,
        logo_uri || null,
        cover_uri || null
      ]
    );
    const userId = rows.insertId;
    const token = jwt.sign({ id: userId, phone, role: role || 'citizen' }, JWT_SECRET);
    res.status(201).json({
      success: true,
      access_token: token,
      user: { id: userId, phone, full_name, username, role: role || 'citizen', organization }
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, message: 'خطأ في عملية الإنشاء: ' + error.message });
  }
});

// --- Admin Endpoints ---
app.get('/api/admin/departments', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, full_name as name, username, role, organization, logo_uri, cover_uri FROM users WHERE role = 'department'"
    );
    res.json({ success: true, data: { items: rows } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.patch('/api/admin/departments/:id', async (req, res) => {
  const { id } = req.params;
  const { name, username, password, organization, logo_uri, cover_uri } = req.body;
  try {
    let query = 'UPDATE users SET full_name = ?, username = ?, organization = ?, logo_uri = ?, cover_uri = ?';
    let params = [name, username, organization, logo_uri, cover_uri];
    
    if (password) {
      query += ', password = ?';
      params.push(password);
    }
    
    query += ' WHERE id = ? AND role = "department"';
    params.push(id);
    
    await pool.execute(query, params);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/admin/departments/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.execute('DELETE FROM users WHERE id = ? AND role = "department"', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { phone, password } = req.body;
  try {
    const [users] = await pool.execute(
      'SELECT id, phone, full_name, username, role, organization, logo_uri, cover_uri, password FROM users WHERE (phone = ? OR username = ?)',
      [phone, phone]
    );

    if (users.length === 0 || users[0].password !== password) {
      return res.status(401).json({ success: false, message: "فشل الدخول، يرجى التأكد من البيانات." });
    }

    const user = users[0];
    const token = jwt.sign({ id: user.id, phone: user.phone, role: user.role }, JWT_SECRET);
    
    // Remove password before sending
    delete user.password;

    res.json({
      success: true,
      access_token: token,
      user: {
        id: user.id,
        phone: user.phone,
        full_name: user.full_name,
        username: user.username,
        role: user.role,
        organization: user.organization,
        logoUri: user.logo_uri,
        coverUri: user.cover_uri
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// --- Complaints ---
app.get('/api/complaints', async (req, res) => {
  const { reporter_id } = req.query;
  try {
    let query = 'SELECT * FROM complaints';
    let params = [];
    if (reporter_id) {
      query += ' WHERE reporter_id = ?';
      params.push(reporter_id);
    }
    query += ' ORDER BY created_at DESC';
    const [rows] = await pool.execute(query, params);
    const complaints = rows.map(r => ({
      ...r,
      media_urls: typeof r.media_urls === 'string' ? JSON.parse(r.media_urls) : (r.media_urls || []),
      history: [],
      messages: []
    }));
    res.json({ success: true, data: { items: complaints } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/complaints', async (req, res) => {
  const { id, title, description, location_text, lat, lng, category, reporter_id, assigned_dept, media_urls } = req.body;
  try {
    await pool.execute(
      'INSERT INTO complaints (id, title, description, location_text, lat, lng, category, reporter_id, assigned_dept, media_urls) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, title, description, location_text, lat, lng, category, reporter_id, assigned_dept, JSON.stringify(media_urls || [])]
    );
    res.status(201).json({ success: true, data: { id } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/complaints/:id/messages', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.execute('SELECT * FROM messages WHERE complaint_id = ? ORDER BY created_at ASC', [id]);
    res.json({ success: true, data: { items: rows } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/complaints/:id/messages', async (req, res) => {
  const { id } = req.params;
  const { sender_id, sender_name, sender_role, text } = req.body;
  try {
    await pool.execute(
      'INSERT INTO messages (complaint_id, sender_id, sender_name, sender_role, text) VALUES (?, ?, ?, ?, ?)',
      [id, sender_id, sender_name, sender_role, text]
    );
    res.status(201).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = app;
