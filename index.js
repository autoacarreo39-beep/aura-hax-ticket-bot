import { Client, GatewayIntentBits, Partials, Collection, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, ChannelSelectMenuBuilder } from 'discord.js';
import { config } from 'dotenv';
import config_bot from './config.js';
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

client.once('ready', async () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);
  console.log(`👑 Owner: ${process.env.OWNER_ID}`);
  console.log(`🎫 ${config_bot.botName} - Listo`);
  
  client.user.setActivity('🎫 Aura Hax', { type: 3 });

  // Enviar DM al owner con opciones de configuración
  try {
    const owner = await client.users.fetch(process.env.OWNER_ID);
    
    const configEmbed = new EmbedBuilder()
      .setTitle(`🎫 ${config_bot.botName} - Panel de Control`)
      .setDescription(
        `**Bot Online y Listo**\n\n` +
        `**Productos disponibles:**\n` +
        `${config_bot.products.map(p => `🔹 ${p.name}`).join('\n')}\n\n` +
        `**Métodos de pago:**\n` +
        `${config_bot.paymentMethods.map(m => `${m.emoji} ${m.name}`).join('\n')}\n\n` +
        `Usa los botones de abajo para configurar el panel de tickets.`
      )
      .setColor(config_bot.colors.primary)
      .setFooter({ text: config_bot.botName });

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('setup_panel')
          .setLabel('📋 Configurar Panel')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('view_stats')
          .setLabel('📊 Ver Estadísticas')
          .setStyle(ButtonStyle.Secondary)
      );

    await owner.send({ embeds: [configEmbed], components: [row] });
    console.log(`📧 DM de configuración enviado al owner`);
  } catch (error) {
    console.error('Error enviando DM al owner:', error);
  }
});

client.on('messageCreate', async (message) => {
  console.log(`📨 Mensaje: "${message.content}" de ${message.author.tag} (ID: ${message.author.id})`);
  
  if (message.author.bot) return;

  // DM al owner
  if (message.channel.type === 1 && message.author.id === process.env.OWNER_ID) {
    await handleOwnerDM(client, message);
  }
});

client.on('interactionCreate', async (interaction) => {
  try {
    if (interaction.isButton()) {
      if (interaction.customId === 'setup_panel') {
        // Mostrar selector de canal
        const channelSelectRow = new ActionRowBuilder()
          .addComponents(
            new ChannelSelectMenuBuilder()
              .setCustomId('select_channel')
              .setPlaceholder('Selecciona un canal')
          );

        await interaction.reply({ 
          content: '📍 Selecciona el canal donde quieres el panel de tickets:',
          components: [channelSelectRow],
          ephemeral: true 
        });
      } else if (interaction.customId === 'view_stats') {
        const statsEmbed = new EmbedBuilder()
          .setTitle('📊 Estadísticas')
          .setDescription('Aún no hay tickets')
          .setColor(config_bot.colors.info);
        
        await interaction.reply({ embeds: [statsEmbed], ephemeral: true });
      } else {
        await handleButton(client, interaction);
      }
    } else if (interaction.isStringSelectMenu()) {
      if (interaction.customId === 'select_channel') {
        const channel = interaction.channels.first();
        
        if (channel) {
          // Crear el panel de tickets
          const panelEmbed = new EmbedBuilder()
            .setTitle(`🎫 ${config_bot.botName}`)
            .setDescription(
              `**Suscripciones disponibles**\n` +
              `⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n` +
              `${config_bot.products.map(p => `🔹 ${p.name}`).join('\n')}\n` +
              `⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n\n` +
              `Haz clic en el botón para seleccionar una suscripción.\n\n` +
              `**Métodos de pago disponibles:**\n` +
              `${config_bot.paymentMethods.map(m => `${m.emoji} ${m.name} - ${m.display}`).join('\n')}\n\n` +
              `${config_bot.copyright}`
            )
            .setColor(config_bot.colors.primary)
            .setFooter({ text: config_bot.botName })
            .setTimestamp();

          const panelRow = new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setCustomId('create_ticket')
                .setLabel('Seleccione')
                .setStyle(ButtonStyle.Success)
                .setEmoji('🎫')
            );

          await channel.send({ embeds: [panelEmbed], components: [panelRow] });
          
          await interaction.reply({ 
            content: `✅ Panel configurado en ${channel}`,
            ephemeral: true 
          });

          console.log(`✅ Panel creado en ${channel.name}`);
        }
      } else {
        await handleSelect(client, interaction);
      }
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
