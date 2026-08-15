// server.js
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Middleware: allows requests from your frontend (running on a different port)
app.use(cors());

// Middleware: lets your server understand JSON sent from the frontend
app.use(express.json());

// A super simple "database" for now — just an array in memory.
// Later you'll swap this for a real database (SQLite, MongoDB, etc).
let tasks = [
  { id: 1, text: 'Learn Express basics', description: '', done: false },
  { id: 2, text: 'Connect frontend to backend', description: '', done: false }
];
let nextId = 3; // tracks the next id to assign, since tasks can now be deleted

// ROUTE 1: Basic health check
// Try this in your browser: http://localhost:3000/
app.get('/', (req, res) => {
  res.send('Backend is running! 🎉');
});

// ROUTE 2: Get all tasks (GET request)
app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

// ROUTE 3: Add a new task (POST request)
app.post('/api/tasks', (req, res) => {
  const newTask = {
    id: nextId++,
    text: req.body.text,
    description: req.body.description || '',
    done: false
  };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// ROUTE 4: Update a task (PUT request) — e.g. mark it done
app.put('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const task = tasks.find(t => t.id === id);

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  // Only update a field if it was actually sent in the request body.
  // This lets the frontend update just "done", or just "text"+"description", without wiping the others.
  if (req.body.done !== undefined) task.done = req.body.done;
  if (req.body.text !== undefined) task.text = req.body.text;
  if (req.body.description !== undefined) task.description = req.body.description;

  res.json(task);
});

// ROUTE 5: Delete a task
app.delete('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  tasks = tasks.filter(t => t.id !== id);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});