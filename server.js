import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';
import './bot.js'; // Inicia el bot

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ========== EXPRESS WEB ==========
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(join(__dirname, 'public')));

// Almacenamiento en memoria (en producción usar base de datos)
let ticketsData = new Map();
let botsettings = {
  botName: 'Aura Hax Ticket',
  products: [
    { id: 'ff-complex', name: 'FF - Complex' },
    { id: 'ff-bypass', name: 'FF - Bypass' }
  ],
  paymentMethods: [
    { id: 'binance', name: 'Binance', emoji: '🟡', display: 'USDT (BEP20)' }
  ]
};

// API Routes
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    botName: botsettings.botName,
    owner: process.env.OWNER_ID,
    guild: process.env.GUILD_ID
  });
});

app.get('/api/tickets', (req, res) => {
  const tickets = Array.from(ticketsData.values());
  res.json(tickets);
});

app.post('/api/tickets/:id/approve', (req, res) => {
  const { id } = req.params;
  const { keys } = req.body;
  
  if (ticketsData.has(id)) {
    const ticket = ticketsData.get(id);
    ticket.status = 'approved';
    ticket.keys = keys;
    ticketsData.set(id, ticket);
    res.json({ success: true, message: 'Ticket aprobado' });
  } else {
    res.status(404).json({ success: false, message: 'Ticket no encontrado' });
  }
});

app.post('/api/tickets/:id/reject', (req, res) => {
  const { id } = req.params;
  
  if (ticketsData.has(id)) {
    const ticket = ticketsData.get(id);
    ticket.status = 'rejected';
    ticketsData.set(id, ticket);
    res.json({ success: true, message: 'Ticket rechazado' });
  } else {
    res.status(404).json({ success: false, message: 'Ticket no encontrado' });
  }
});

app.get('/api/config', (req, res) => {
  res.json(botsettings);
});

app.post('/api/config/update', (req, res) => {
  const { products, paymentMethods, botName } = req.body;
  
  if (products) botsettings.products = products;
  if (paymentMethods) botsettings.paymentMethods = paymentMethods;
  if (botName) botsettings.botName = botName;
  
  res.json({ success: true, message: 'Configuración actualizada', data: botsettings });
});

// Servir el archivo HTML principal
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🌐 Web servidor corriendo en puerto ${PORT}`);
});
