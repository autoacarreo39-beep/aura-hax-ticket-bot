import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import config from '../config.js';

export async function setupTicketPanel(message) {
  try {
    console.log(`🔧 setupTicketPanel iniciado`);
    
    const embed = new EmbedBuilder()
      .setTitle(`🎫 Aura Hax`)
      .setDescription(
        `**Suscripciones disponibles**\n` +
        `FF - Complex\n` +
        `FF - Bypass\n\n` +
        `Seleccione una suscripción`
      )
      .setColor(0x00ff00)
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('create_ticket')
          .setLabel('Seleccione')
          .setStyle(ButtonStyle.Success)
          .setEmoji('🎫')
      );

    console.log(`📤 Enviando mensaje...`);
    const msg = await message.channel.send({ 
      embeds: [embed], 
      components: [row] 
    });
    console.log(`✅ Mensaje enviado`);

    await message.delete().catch(e => console.log('No se pudo borrar'));
  } catch (error) {
    console.error(`❌ Error:`, error.message);
  }
}
