import express from 'express';
import authRoutes from './routes/auth.js';
import meRoutes from './routes/me.js';

const app = express();

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/me', meRoutes);

export default app;
