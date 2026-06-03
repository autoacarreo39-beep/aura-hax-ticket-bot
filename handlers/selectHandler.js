import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import config from '../config.js';

export async function handleSelect(client, interaction) {
  const { customId, values, user } = interaction;

  // Obtener datos del ticket
  let ticketData = client.activeTickets.get(interaction.channel.id);
  if (!ticketData) return;

  // Selección de plan
  if (customId === 'select_plan') {
    await interaction.deferUpdate();

    const planIndex = parseInt(values[0].split('_')[1]);
    const plan = config.product.plans[planIndex];

    // Guardar selección
    ticketData.selectedPlan = planIndex;
    client.activeTickets.set(interaction.channel.id, ticketData);

    // Mostrar selector de cantidad de licencias
    const embed = new EmbedBuilder()
      .setTitle(`${config.product.name} — ${plan.days} día${plan.days > 1 ? 's' : ''}`)
      .setDescription(
        `**Acceso ${plan.days} día${plan.days > 1 ? 's' : ''}**\n\n` +
        `Precio base **$${plan.price.toFixed(2)} USD**. Seleccione cantidad de licencias.\n\n` +
        `${config.copyright}`
      )
      .setColor(config.colors.primary)
      .setFooter({ text: config.botName })
      .setTimestamp();

    // Opciones de cantidad
    const quantityOptions = [];
    for (let i = 1; i <= 5; i++) {
      quantityOptions.push({
        label: `${i} licencia${i > 1 ? 's' : ''} — $${(plan.price * i).toFixed(2)} USD`,
        value: `${i}`,
        emoji: `${i}️⃣`
      });
    }

    const quantitySelect = new (await import('discord.js')).StringSelectMenuBuilder()
      .setCustomId('select_quantity')
      .setPlaceholder('Cantidad de licencias')
      .addOptions(quantityOptions);

    const row = new ActionRowBuilder().addComponents(quantitySelect);

    await interaction.followUp({ embeds: [embed], components: [row] });
  }

  // Selección de cantidad
  if (customId === 'select_quantity') {
    await interaction.deferUpdate();

    const quantity = parseInt(values[0]);
    const plan = config.product.plans[ticketData.selectedPlan];

    // Guardar cantidad
    ticketData.licenseQuantity = quantity;
    client.activeTickets.set(interaction.channel.id, ticketData);

    const embed = new EmbedBuilder()
      .setTitle(`${quantity} licencia${quantity > 1 ? 's' : ''} — $${(plan.price * quantity).toFixed(2)} USD`)
      .setDescription(
        `${quantity}× ${config.product.name} — ${plan.days} día${plan.days > 1 ? 's' : ''}\n\n` +
        `**Total a enviar:** $${(plan.price * quantity).toFixed(2)} USD\n\n` +
        `Ahora selecciona tu método de pago.\n\n` +
        `${config.copyright}`
      )
      .setColor(config.colors.primary)
      .setFooter({ text: config.botName })
      .setTimestamp();

    await interaction.followUp({ embeds: [embed] });
  }

  // Selección de método de pago
  if (customId === 'select_payment_method') {
    await interaction.deferUpdate();

    const paymentId = values[0];
    const payment = config.paymentMethods.find(p => p.id === paymentId);
    
    if (!payment) return;

    // Guardar método de pago
    ticketData.selectedPayment = paymentId;
    client.activeTickets.set(interaction.channel.id, ticketData);

    const plan = config.product.plans[ticketData.selectedPlan];
    const quantity = ticketData.licenseQuantity || 1;
    const totalPrice = plan.price * quantity;

    const paymentEmbed = new EmbedBuilder()
      .setTitle(`Pago — ${payment.name}`)
      .setDescription(
        `${config.product.name} — ${plan.days} día${plan.days > 1 ? 's' : ''} — $${totalPrice.toFixed(2)} USD\n\n` +
        `**Total:** $${totalPrice.toFixed(2)} USD\n\n` +
        `${payment.display}\n\n` +
        `Realice la transferencia y pulse **Ya realicé el pago**. Nuestro equipo verificará el pago y la(s) licencia(s) se publicará(n) en este canal.\n\n` +
        `${config.copyright}`
      )
      .setColor(config.colors.primary)
      .setFooter({ text: config.botName })
      .setTimestamp();

    const doneButton = new ButtonBuilder()
      .setCustomId(`payment_done_${user.id}`)
      .setLabel('Ya realicé el pago')
      .setStyle(ButtonStyle.Success)
      .setEmoji('✅');

    const row = new ActionRowBuilder().addComponents(doneButton);

    await interaction.followUp({ embeds: [paymentEmbed], components: [row] });
  }

  // Botón "Ya realicé el pago"
  if (customId.startsWith('payment_done_')) {
    await interaction.deferUpdate();

    const ticketData = client.activeTickets.get(interaction.channel.id);
    if (!ticketData || !ticketData.selectedPlan || !ticketData.selectedPayment) {
      return;
    }

    const plan = config.product.plans[ticketData.selectedPlan];
    const payment = config.paymentMethods.find(p => p.id === ticketData.selectedPayment);

    // Crear mensaje de revisión pendiente
    const pendingEmbed = new EmbedBuilder()
      .setTitle(`@Vendedor X Revisión pendiente`)
      .setDescription(
        `**Verificación de pago manual**\n\n` +
        `Cliente: ${user}\n` +
        `Producto: ${config.product.name} — ${plan.days} día${plan.days > 1 ? 's' : ''}\n` +
        `Método: ${payment.name}\n` +
        `Importe: $${plan.price.toFixed(2)} USD\n\n` +
        `Si el pago es correcto, pulse **Pago verificado** para emitir la(s) licencia(s) en este canal.\n\n` +
        `${config.copyright}`
      )
      .setColor(config.colors.pending)
      .setFooter({ text: config.botName })
      .setTimestamp();

    const verifyButton = new ButtonBuilder()
      .setCustomId(`verify_payment_${user.id}`)
      .setLabel('Pago verificado')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(verifyButton);

    await interaction.channel.send({ embeds: [pendingEmbed], components: [row] });

    // Enviar notificación al owner
    try {
      const owner = await client.users.fetch(process.env.OWNER_ID);
      const ownerEmbed = new EmbedBuilder()
        .setTitle(`🔔 Nueva Solicitud de Verificación`)
        .setDescription(
          `**Cliente:** ${user.tag} (${user.id})\n` +
          `**Producto:** ${config.product.name} — ${plan.days} días\n` +
          `**Método:** ${payment.name}\n` +
          `**Precio:** $${plan.price} USD\n` +
          `**Licencias:** ${ticketData.licenseQuantity || 1}\n\n` +
          `Canal: ${interaction.channel}`
        )
        .setColor(config.colors.warning)
        .setTimestamp();

      await owner.send({ embeds: [ownerEmbed] });
    } catch (error) {
      console.log('No se pudo enviar DM al owner');
    }
  }
}
