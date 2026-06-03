import { EmbedBuilder } from 'discord.js';
import config from '../config.js';

export async function handleModal(client, interaction) {
  const { customId, fields, user, channel } = interaction;

  // Modal cuando el owner ingresa la key manualmente
  if (customId.startsWith('owner_key_modal_')) {
    await interaction.deferUpdate();

    const ticketData = client.activeTickets.get(interaction.channel.id);
    if (!ticketData) {
      return interaction.followUp({
        content: '❌ Esta solicitud ya no está disponible.',
        ephemeral: true,
      });
    }

    const licenseKey = fields.getTextInputValue('license_key');
    const plan = config.product.plans[ticketData.selectedPlan];
    const clientUser = await client.users.fetch(ticketData.userId);
    const quantity = ticketData.licenseQuantity || 1;

    // Enviar licencia al cliente
    const keyEmbed = new EmbedBuilder()
      .setTitle(`✅ Licencia Generada`)
      .setDescription(
        `**${clientUser}, tu compra ha sido aprobada!**\n\n` +
        `🎮 **Producto:** ${config.product.name}\n` +
        `⏰ **Duración:** ${plan.days} día${plan.days > 1 ? 's' : ''}\n` +
        `💵 **Precio:** $${plan.price} USD\n` +
        `📦 **Cantidad:** ${quantity} licencia${quantity > 1 ? 's' : ''}\n\n` +
        `🔑 **Tu licencia:**\n` +
        `\`\`\`\n${licenseKey}\n\`\`\`\n\n` +
        `Guarda tu licencia en un lugar seguro.\n\n` +
        `Este ticket se cerrará en 30 segundos.\n\n` +
        `${config.copyright}`
      )
      .setColor(config.colors.success)
      .setFooter({ text: config.botName })
      .setTimestamp();

    await interaction.channel.send({ content: `${clientUser}`, embeds: [keyEmbed] });

    // También enviar por DM al cliente
    try {
      await clientUser.send({ embeds: [keyEmbed] });
    } catch (error) {
      console.log('No se pudo enviar DM al cliente');
    }

    // Confirmar al owner
    await interaction.followUp({
      content: `✅ Licencia entregada exitosamente a ${clientUser.tag}`,
      ephemeral: true
    });

    // Cerrar ticket después de 30 segundos
    setTimeout(async () => {
      client.activeTickets.delete(interaction.channel.id);
      try {
        await interaction.channel.delete();
      } catch (error) {
        console.log('No se pudo eliminar el canal');
      }
    }, 30000);
  }
}
