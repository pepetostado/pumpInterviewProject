import app from './app.js';
import { ensureSeeded, initDb } from './db/index.js';

const PORT = process.env.PORT || 3001;

await initDb();
await ensureSeeded();

app.listen(PORT, () => {
  console.log(`API running on port:${PORT}`);
});
