import express from 'express';
import { ensureSeeded, initDb } from './db/index.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// db setup (1)
await initDb();
await ensureSeeded();

app.listen(PORT, () => {
  console.log(`API running on port:${PORT}`);
});
