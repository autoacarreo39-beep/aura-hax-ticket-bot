import { Client, GatewayIntentBits, Partials, Collection } from 'discord.js';
import { config } from 'dotenv';
import config_bot from './config.js';
import { setupTicketPanel } from './commands/setup.js';
import { handleButton } from './handlers/buttonHandler.js';
import { handleSelect } from './handlers/selectHandler.js';
import { handleModal } from './handlers/modalHandler.js';
import { handleOwnerDM } from './handlers/ownerHandler.js';

config();

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

client.activeTickets = new Collection();
client.pendingApprovals = new Collection();

client.once('ready', () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);
  console.log(`👑 Owner: ${process.env.OWNER_ID}`);
  console.log(`🎫 ${config_bot.botName} - Listo`);
  
  client.user.setActivity('🎫 Aura Hax', { type: 3 });
});

client.on('messageCreate', async (message) => {
  console.log(`📨 Mensaje recibido: "${message.content}" de ${message.author.tag} (ID: ${message.author.id})`);
  
  if (message.author.bot) return;

  if (message.content === '!setup' && message.author.id === process.env.OWNER_ID) {
    console.log(`✅ Comando !setup ejecutado por owner`);
    await setupTicketPanel(message);
    return;
  }

  if (message.channel.type === 1 && message.author.id === process.env.OWNER_ID) {
    await handleOwnerDM(client, message);
  }
});

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

export default client;
