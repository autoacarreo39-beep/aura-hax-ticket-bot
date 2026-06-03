import { 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  ChannelType, 
  PermissionFlagsBits,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} from 'discord.js';
import config from '../config.js';

export async function handleButton(client, interaction) {
  const { customId, user, guild } = interaction;

  // Crear ticket
  if (customId === 'create_ticket') {
    await interaction.deferReply({ ephemeral: true });

    // Verificar si el usuario ya tiene un ticket abierto
    const existingTicket = client.activeTickets.find(t => t.userId === user.id);
    if (existingTicket) {
      return interaction.editReply({
        content: `❌ Ya tienes un ticket abierto: <#${existingTicket.channelId}>`,
      });
    }

    // Crear canal de ticket
    const ticketChannel = await guild.channels.create({
      name: `ticket-${user.username}`,
      type: ChannelType.GuildText,
      parent: interaction.channel.parentId,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.AttachFiles,
            PermissionFlagsBits.ReadMessageHistory,
          ],
        },
      ],
    });

    // Guardar ticket activo
    client.activeTickets.set(ticketChannel.id, {
      userId: user.id,
      channelId: ticketChannel.id,
      createdAt: Date.now(),
    });

    // Embed de solicitud de compra
    const requestEmbed = new EmbedBuilder()
      .setTitle(`Solicitud de compra`)
      .setDescription(
        `Use el menú inferior para elegir su plan y el método de pago.\n\n` +
        `La licencia se publicará **en este canal** al finalizar el proceso.\n\n` +
        `• **PayPal:** entrega automática al confirmar el pago.\n` +
        `• **Otros métodos:** tras pagar, pulse **Ya realicé el pago**; solo el equipo autorizado puede pulsar **Pago verificado**.\n\n` +
        `${config.copyright}`
      )
      .setColor(config.colors.primary)
      .setFooter({ text: config.botName })
      .setTimestamp();

    // Select menu para el plan
    const planSelect = new StringSelectMenuBuilder()
      .setCustomId('select_plan')
      .setPlaceholder('Seleccione una suscripción')
      .addOptions(
        config.product.plans.map((plan, index) => ({
          label: plan.label,
          description: `Acceso ${plan.days} día${plan.days > 1 ? 's' : ''}`,
          value: `plan_${index}`,
          emoji: '🎮'
        }))
      );

    // Select menu para método de pago
    const paymentSelect = new StringSelectMenuBuilder()
      .setCustomId('select_payment_method')
      .setPlaceholder('Método de pago')
      .addOptions(
        config.paymentMethods.map(method => ({
          label: method.name,
          description: method.display,
          value: method.id,
          emoji: method.emoji
        }))
      );

    // Botón de cerrar ticket
    const closeButton = new ButtonBuilder()
      .setCustomId('close_ticket')
      .setLabel('Cerrar ticket')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('🔒');

    const row1 = new ActionRowBuilder().addComponents(planSelect);
    const row2 = new ActionRowBuilder().addComponents(paymentSelect);
    const row3 = new ActionRowBuilder().addComponents(closeButton);

    await ticketChannel.send({ 
      content: `${user}`, 
      embeds: [requestEmbed], 
      components: [row1, row2, row3] 
    });

    await interaction.editReply({
      content: `✅ Ticket creado: ${ticketChannel}`,
    });
  }

  // Cerrar ticket
  if (customId === 'close_ticket') {
    await interaction.deferReply();

    const closeEmbed = new EmbedBuilder()
      .setTitle('🔒 Ticket Cerrado')
      .setDescription('Este ticket se cerrará en 5 segundos...')
      .setColor(config.colors.error)
      .setTimestamp();

    await interaction.editReply({ embeds: [closeEmbed] });

    setTimeout(async () => {
      client.activeTickets.delete(interaction.channel.id);
      await interaction.channel.delete();
    }, 5000);
  }

  // Botón "Pago verificado" (solo owner)
  if (customId.startsWith('verify_payment_')) {
    // Verificar si es el owner
    if (interaction.user.id !== process.env.OWNER_ID) {
      return interaction.reply({
        content: '❌ Solo el equipo autorizado puede verificar pagos.',
        ephemeral: true
      });
    }

    await interaction.deferReply({ ephemeral: true });

    const ticketData = client.activeTickets.get(interaction.channel.id);
    if (!ticketData) return;

    const plan = config.product.plans[ticketData.selectedPlan];

    // Mostrar modal para que el owner ingrese la key manualmente
    const modal = new ModalBuilder()
      .setCustomId(`owner_key_modal_${interaction.channel.id}`)
      .setTitle('Ingresar Licencia');

    const keyInput = new TextInputBuilder()
      .setCustomId('license_key')
      .setLabel('Licencia para el cliente')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setPlaceholder('XXXX-XXXX-XXXX-XXXX');

    const row = new ActionRowBuilder().addComponents(keyInput);
    modal.addComponents(row);

    await interaction.showModal(modal);
  }
}
