// server.js
require('dotenv').config(); // loads TURSO_DATABASE_URL and TURSO_AUTH_TOKEN from .env

const express = require('express');
const cors = require('cors');
const { createClient } = require('@libsql/client');

const app = express();
const PORT = process.env.PORT || 3000; // Render assigns its own PORT automatically

// Middleware: allows requests from your frontend (running on a different port/domain)
app.use(cors());

// Middleware: lets your server understand JSON sent from the frontend
app.use(express.json());

// Connect to your Turso cloud database
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Create the table if it doesn't already exist yet
async function initDb() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      description TEXT DEFAULT '',
      done BOOLEAN DEFAULT 0
    )
  `);
}
initDb();

// ROUTE 1: Basic health check
// Try this in your browser: http://localhost:3000/
app.get('/', (req, res) => {
  res.send('Backend is running! 🎉');
});

// ROUTE 2: Get all tasks (GET request)
app.get('/api/tasks', async (req, res) => {
  const result = await db.execute('SELECT * FROM tasks');
  res.json(result.rows);
});

// ROUTE 3: Add a new task (POST request)
app.post('/api/tasks', async (req, res) => {
  const { text, description } = req.body;

  const insertResult = await db.execute({
    sql: 'INSERT INTO tasks (text, description, done) VALUES (?, ?, 0)',
    args: [text, description || ''],
  });

  const newId = Number(insertResult.lastInsertRowid);
  const result = await db.execute({
    sql: 'SELECT * FROM tasks WHERE id = ?',
    args: [newId],
  });

  res.status(201).json(result.rows[0]);
});

// ROUTE 4: Update a task (PUT request) — e.g. mark it done
app.put('/api/tasks/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  const existing = await db.execute({
    sql: 'SELECT * FROM tasks WHERE id = ?',
    args: [id],
  });
  const task = existing.rows[0];

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  // Only update a field if it was actually sent in the request body.
  const updated = {
    text: req.body.text !== undefined ? req.body.text : task.text,
    description: req.body.description !== undefined ? req.body.description : task.description,
    done: req.body.done !== undefined ? (req.body.done ? 1 : 0) : task.done,
  };

  await db.execute({
    sql: 'UPDATE tasks SET text = ?, description = ?, done = ? WHERE id = ?',
    args: [updated.text, updated.description, updated.done, id],
  });

  const result = await db.execute({
    sql: 'SELECT * FROM tasks WHERE id = ?',
    args: [id],
  });

  res.json(result.rows[0]);
});

// ROUTE 5: Delete a task
app.delete('/api/tasks/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  await db.execute({
    sql: 'DELETE FROM tasks WHERE id = ?',
    args: [id],
  });
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});