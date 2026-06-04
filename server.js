import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';
import { Client, GatewayIntentBits, Partials, Collection, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from 'discord.js';
import config_bot from './config.js';

config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// ========== WEB API ==========
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

// ========== DISCORD BOT ==========
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Channel, Partials.Message]
});

client.activeTickets = new Collection();

client.once('ready', () => {
  console.log(`✅ Bot: ${client.user.tag}`);
  console.log(`🎫 ${config_bot.botName} - Online`);
  client.user.setActivity('🎫 Aura Hax', { type: 3 });

  // Enviar panel al canal
  setTimeout(async () => {
    try {
      const guild = await client.guilds.fetch(process.env.GUILD_ID);
      const channel = guild.channels.cache.first();
      
      if (channel && channel.isTextBased()) {
        const embed = new EmbedBuilder()
          .setTitle(`🎫 ${config_bot.botName}`)
          .setDescription(
            `**Productos disponibles:**\n` +
            `${config_bot.products.map(p => `🔹 ${p.name}`).join('\n')}\n\n` +
            `Haz clic para crear un ticket`
          )
          .setColor(config_bot.colors.primary)
          .setFooter({ text: config_bot.botName });

        const row = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('create_ticket')
              .setLabel('Crear Ticket')
              .setStyle(ButtonStyle.Success)
              .setEmoji('🎫')
          );

        await channel.send({ embeds: [embed], components: [row] });
      }
    } catch (error) {
      console.log('Panel ya existe');
    }
  }, 2000);
});

client.on('interactionCreate', async (interaction) => {
  try {
    if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;

    if (interaction.isButton()) {
      if (interaction.customId === 'create_ticket') {
        const productSelect = new StringSelectMenuBuilder()
          .setCustomId('select_product')
          .setPlaceholder('Selecciona un producto')
          .addOptions(
            config_bot.products.map(p => ({
              label: p.name,
              value: p.id,
              emoji: '🔹'
            }))
          );

        const row = new ActionRowBuilder().addComponents(productSelect);
        await interaction.reply({ content: 'Selecciona un producto:', components: [row], ephemeral: true });
      }
    }

    if (interaction.isStringSelectMenu()) {
      if (interaction.customId === 'select_product') {
        const productId = interaction.values[0];
        const product = config_bot.products.find(p => p.id === productId);

        const planSelect = new StringSelectMenuBuilder()
          .setCustomId(`select_plan_${productId}`)
          .setPlaceholder('Selecciona un plan')
          .addOptions(
            product.plans.map(plan => ({
              label: plan.label,
              value: `${plan.days}`,
              emoji: '📅'
            }))
          );

        const row = new ActionRowBuilder().addComponents(planSelect);
        await interaction.reply({ content: `Producto: **${product.name}**\n\nSelecciona un plan:`, components: [row], ephemeral: true });
      } else if (interaction.customId.startsWith('select_plan_')) {
        const days = parseInt(interaction.values[0]);
        
        const qtySelect = new StringSelectMenuBuilder()
          .setCustomId(`select_qty_${days}`)
          .setPlaceholder('Selecciona cantidad')
          .addOptions(
            [1, 2, 3, 4, 5].map(q => ({
              label: `${q} licencia${q > 1 ? 's' : ''}`,
              value: `${q}`,
              emoji: '📦'
            }))
          );

        const row = new ActionRowBuilder().addComponents(qtySelect);
        await interaction.reply({ content: `Plan: **${days} días**\n\nSelecciona cantidad:`, components: [row], ephemeral: true });
      } else if (interaction.customId.startsWith('select_qty_')) {
        const quantity = parseInt(interaction.values[0]);
        
        const paymentSelect = new StringSelectMenuBuilder()
          .setCustomId(`select_payment_${quantity}`)
          .setPlaceholder('Selecciona método de pago')
          .addOptions(
            config_bot.paymentMethods.map(m => ({
              label: m.name,
              value: m.id,
              emoji: m.emoji
            }))
          );

        const row = new ActionRowBuilder().addComponents(paymentSelect);
        await interaction.reply({ content: `Cantidad: **${quantity}**\n\nMétodo de pago:`, components: [row], ephemeral: true });
      } else if (interaction.customId.startsWith('select_payment_')) {
        const payment = interaction.values[0];
        
        const ticket = {
          userId: interaction.user.id,
          username: interaction.user.username,
          payment: payment,
          createdAt: new Date()
        };

        const newTicket = await fetch('http://localhost:3000/api/tickets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ticket)
        });

        await interaction.reply({ 
          content: `✅ Ticket creado. Accede a la web para detalles.`,
          ephemeral: true 
        });
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
});

client.login(process.env.DISCORD_TOKEN);

