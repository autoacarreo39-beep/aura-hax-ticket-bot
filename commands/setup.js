import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from 'discord.js';
import config from '../config.js';

export async function setupTicketPanel(message) {
  try {
    console.log(`🔧 Iniciando setupTicketPanel...`);
    
    const embed = new EmbedBuilder()
      .setTitle(`🎫 ${config.botName}`)
      .setDescription(
        `**Suscripciones disponibles**\n` +
        `⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n` +
        `🔹 FF - Complex\n` +
        `🔹 FF - Bypass\n` +
        `⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n\n` +
        `Haz clic en el botón de abajo para seleccionar una suscripción.\n\n` +
        `**Método de pago disponible:**\n` +
        `🟡 Binance (USDT BEP20)\n\n` +
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
          .setLabel('Seleccione')
          .setStyle(ButtonStyle.Success)
          .setEmoji('🎫')
      );

    console.log(`📤 Enviando embed al canal...`);
    await message.channel.send({ 
      embeds: [embed], 
      components: [row] 
    });

    console.log(`✅ Embed enviado exitosamente`);
    await message.delete().catch(() => {});
  } catch (error) {
    console.error(`❌ Error en setupTicketPanel:`, error);
  }
}
