import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import config from '../config.js';

export async function setupTicketPanel(message) {
  // Descripción de precios
  const pricesText = config.product.plans.map(plan => 
    `- ${plan.days} Days = ${plan.price}$ USD`
  ).join('\n');

  const embed = new EmbedBuilder()
    .setTitle(`🎫 ${config.botName}`)
    .setDescription(
      `**${config.product.name}**\n` +
      `⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n` +
      `${pricesText}\n` +
      `⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n\n` +
      `Haz clic en el botón de abajo para crear un ticket de compra.\n\n` +
      `**Métodos de pago disponibles:**\n` +
      `🟡 Binance (USDT BEP20)\n` +
      `💜 Nequi (COP)\n` +
      `💳 PayPal\n\n` +
      `${config.copyright}`
    )
    .setColor(config.colors.primary)
    .setThumbnail(message.guild.iconURL({ dynamic: true }))
    .setFooter({ text: config.botName })
    .setTimestamp();

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('create_ticket')
        .setLabel('Crear Ticket')
        .setStyle(ButtonStyle.Success)
        .setEmoji('🎫')
    );

  await message.channel.send({ 
    embeds: [embed], 
    components: [row] 
  });

  await message.delete().catch(() => {});
}
