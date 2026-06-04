import { Client, GatewayIntentBits, Partials, Collection, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from 'discord.js';
import { config } from 'dotenv';
import config_bot from './config.js';

config();

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
      console.log('Panel ya existe o error:', error.message);
    }
  }, 2000);
});

client.on('interactionCreate', async (interaction) => {
  try {
    if (!interaction.isButton() && !interaction.isStringSelectMenu() && !interaction.isModalSubmit()) return;

    if (interaction.isButton()) {
      if (interaction.customId === 'create_ticket') {
        // Selector de producto
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

        // Selector de plan
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
        
        // Selector de cantidad
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
        
        // Selector de método de pago
        const paymentSelect = new StringSelectMenuBuilder()
          .setCustomId(`select_payment_${quantity}`)
          .setPlaceholder('Selecciona método de pago')
          .addOptions(
            config_bot.paymentMethods.map(m => ({
              label: m.name,
              value: m.id,
              emoji: m.emoji,
              description: m.display
            }))
          );

        const row = new ActionRowBuilder().addComponents(paymentSelect);
        await interaction.reply({ content: `Cantidad: **${quantity} licencia${quantity > 1 ? 's' : ''}**\n\nSelecciona método de pago:`, components: [row], ephemeral: true });
      } else if (interaction.customId.startsWith('select_payment_')) {
        const paymentMethod = interaction.values[0];
        const payment = config_bot.paymentMethods.find(m => m.id === paymentMethod);

        // Guardar ticket temporal
        const ticketData = {
          userId: interaction.user.id,
          username: interaction.user.username,
          payment: payment.name,
          createdAt: new Date()
        };

        client.activeTickets.set(interaction.user.id, ticketData);

        await interaction.reply({ 
          content: `${payment.emoji} **${payment.name}**\n\n${payment.display}\n\n✅ Tu ticket está registrado. Por favor, envía el comprobante de pago en este canal.`,
          ephemeral: true 
        });
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
});

client.login(process.env.DISCORD_TOKEN);
export { client };
