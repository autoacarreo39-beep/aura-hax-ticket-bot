import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import './bot.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// API
let tickets = [];

app.get('/api/tickets', (req, res) => {
  res.json(tickets);
});

app.post('/api/tickets', (req, res) => {
  const ticket = req.body;
  ticket.id = Date.now().toString();
  ticket.status = 'pending';
  tickets.push(ticket);
  res.json({ success: true, id: ticket.id });
});

app.post('/api/tickets/:id/approve', (req, res) => {
  const { id } = req.params;
  const { keys } = req.body;
  const ticket = tickets.find(t => t.id === id);
  if (ticket) {
    ticket.status = 'approved';
    ticket.keys = keys;
    res.json({ success: true });
  } else {
    res.status(404).json({ success: false });
  }
});

app.post('/api/tickets/:id/reject', (req, res) => {
  const { id } = req.params;
  const ticket = tickets.find(t => t.id === id);
  if (ticket) {
    ticket.status = 'rejected';
    res.json({ success: true });
  } else {
    res.status(404).json({ success: false });
  }
});

app.listen(PORT, () => {
  console.log(`🌐 Web en puerto ${PORT}`);
});
