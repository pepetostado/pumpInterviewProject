/* 

routes: (on my mind so far)

/health -> { ok: true } 
/api/login -> { username: string, password: string } -> { token: string }
/api/logout -> { token: string } -> { ok: true }

// i think the following will be GET only
/api/users -> { users: [] } 
/api/users/:id -> { user: {} }
/api/users/:id/balance -> { balance: 0 } 

*/

import express from 'express';

const app = express();
const PORT = process.env.PORT || 3001;

app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
});

app.listen(PORT, () => {
    console.log(`API running on port:${PORT}`);
});

