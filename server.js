import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';
import { Client, GatewayIntentBits, Partials, Collection } from 'discord.js';
import config_bot from './config.js';
import { setupTicketPanel } from './commands/setup.js';
import { handleButton } from './handlers/buttonHandler.js';
import { handleSelect } from './handlers/selectHandler.js';
import { handleModal } from './handlers/modalHandler.js';
import { handleOwnerDM } from './handlers/ownerHandler.js';

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
  products: config_bot.products,
  paymentMethods: config_bot.paymentMethods,
  botName: config_bot.botName
};

// API Routes
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    botName: config_bot.botName,
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

// ========== DISCORD BOT ==========
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
  ]
});

// Storage temporal para tickets activos
client.activeTickets = new Collection();
client.pendingApprovals = new Collection();

client.once('ready', () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);
  console.log(`👑 Owner: ${process.env.OWNER_ID}`);
  console.log(`🎫 ${config_bot.botName} - Listo`);
  
  client.user.setActivity('🎫 Aura Hax', { type: 3 });
});

// Manejo de mensajes
client.on('messageCreate', async (message) => {
  console.log(`📨 Mensaje recibido: "${message.content}" de ${message.author.tag} (ID: ${message.author.id})`);
  
  if (message.author.bot) return;

  // Comando !setup (solo owner)
  if (message.content === '!setup' && message.author.id === process.env.OWNER_ID) {
    console.log(`✅ Comando !setup ejecutado por owner`);
    await setupTicketPanel(message);
    return;
  }

  // DM al owner
  if (message.channel.type === 1 && message.author.id === process.env.OWNER_ID) {
    await handleOwnerDM(client, message);
  }
});

// Manejo de interacciones
client.on('interactionCreate', async (interaction) => {
  try {
    if (interaction.isButton()) {
      await handleButton(client, interaction);
    } else if (interaction.isStringSelectMenu()) {
      await handleSelect(client, interaction);
    } else if (interaction.isModalSubmit()) {
      await handleModal(client, interaction);
    }
  } catch (error) {
    console.error('Error:', error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ 
        content: '❌ Error', 
        ephemeral: true 
      });
    }
  }
});

process.on('unhandledRejection', error => {
  console.error('Error:', error);
});

client.login(process.env.DISCORD_TOKEN);
