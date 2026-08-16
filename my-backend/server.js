// server.js
const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');

const app = express();
const PORT = 3000;

// Middleware: allows requests from your frontend (running on a different port)
app.use(cors());

// Middleware: lets your server understand JSON sent from the frontend
app.use(express.json());

// Connect to (or create) tasks.db — this replaces the in-memory array
const db = new Database('tasks.db');

// Create the table if it doesn't already exist yet
// (Note: your earlier practice table used "title"/"completed" — this matches
// your Express routes instead, which use "text"/"description"/"done")
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    description TEXT DEFAULT '',
    done BOOLEAN DEFAULT 0
  )
`);

// ROUTE 1: Basic health check
// Try this in your browser: http://localhost:3000/
app.get('/', (req, res) => {
  res.send('Backend is running! 🎉');
});

// ROUTE 2: Get all tasks (GET request)
app.get('/api/tasks', (req, res) => {
  const tasks = db.prepare('SELECT * FROM tasks').all();
  res.json(tasks);
});

// ROUTE 3: Add a new task (POST request)
app.post('/api/tasks', (req, res) => {
  const { text, description } = req.body;
  const result = db.prepare(
    'INSERT INTO tasks (text, description, done) VALUES (?, ?, 0)'
  ).run(text, description || '');

  const newTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(newTask);
});

// ROUTE 4: Update a task (PUT request) — e.g. mark it done
app.put('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  // Only update a field if it was actually sent in the request body.
  // This lets the frontend update just "done", or just "text"+"description", without wiping the others.
  const updated = {
    text: req.body.text !== undefined ? req.body.text : task.text,
    description: req.body.description !== undefined ? req.body.description : task.description,
    done: req.body.done !== undefined ? (req.body.done ? 1 : 0) : task.done
  };

  db.prepare(
    'UPDATE tasks SET text = ?, description = ?, done = ? WHERE id = ?'
  ).run(updated.text, updated.description, updated.done, id);

  const result = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  res.json(result);
});

// ROUTE 5: Delete a task
app.delete('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});