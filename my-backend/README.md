# My Backend — Starter Project

A minimal Express server with a simple "tasks" API, built to help you learn backend basics.

## How to run it

1. Make sure Node.js is installed (`node -v` to check).
2. Open a terminal in this folder.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm start
   ```
5. Open your browser to: http://localhost:3000
   You should see: `Backend is running! 🎉`

## Try the API routes

You can test these with your browser (for GET) or a tool like **Postman**,
**Insomnia**, or `curl` (for POST/PUT/DELETE):

| Method | URL                     | What it does              |
|--------|-------------------------|----------------------------|
| GET    | /api/tasks              | List all tasks            |
| POST   | /api/tasks               | Add a task (send `{ "text": "New task" }` as JSON body) |
| PUT    | /api/tasks/:id            | Mark a task done/undone (send `{ "done": true }`) |
| DELETE | /api/tasks/:id            | Delete a task             |

Example with curl:
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"text": "Buy groceries"}'
```

## What's next

1. **Connect your frontend**: use `fetch('http://localhost:3000/api/tasks')` from
   your HTML/JS frontend to pull real data into the page.
2. **Handle CORS**: if your frontend runs on a different port, you'll need the
   `cors` package (`npm install cors`) so the browser allows the request.
3. **Add a real database**: swap the in-memory `tasks` array for SQLite
   (great for learning) or MongoDB (great for JSON-shaped data).
4. **Organize your code**: once this grows, split routes into their own files
   (e.g. `routes/tasks.js`) instead of keeping everything in `server.js`.

## Folder structure
```
my-backend/
├── package.json
├── server.js
└── README.md
```
