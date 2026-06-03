export default {
  // Información del bot
  botName: 'Aura Hax Ticket',
  botColor: '#00ff00', // Verde brillante
  copyright: 'Aura Hax - Copyright',

  // Colores para los embeds
  colors: {
    primary: '#00ff00',  // Verde neón
    success: '#00ff00',  // Verde
    error: '#ff0000',    // Rojo
    warning: '#ffaa00',  // Naranja
    pending: '#ff0000',  // Rojo para pendiente
    info: '#00aaff'      // Azul
  },

  // Emojis
  emojis: {
    ticket: '🎫',
    check: '✅',
    cross: '❌',
    money: '💵',
    key: '🔑',
    pending: '⏳',
    cart: '🛒'
  },

  // Producto FF - Complex
  product: {
    name: 'FF - Complex',
    plans: [
      { days: 1, price: 2, label: '1 día — $2' },
      { days: 7, price: 10, label: '1 semana — $10' },
      { days: 15, price: 16, label: '15 días — $16' },
      { days: 30, price: 24, label: '1 mes — $24' },
      { days: 365, price: 65, label: '1 año — $65' }
    ]
  },

  // Métodos de pago
  paymentMethods: [
    { 
      id: 'binance',
      name: 'Binance', 
      emoji: '🟡',
      display: 'USDT (BEP20)'
    },
    { 
      id: 'nequi',
      name: 'Nequi', 
      emoji: '💜',
      display: 'Pago en pesos colombianos (COP)'
    },
    { 
      id: 'paypal',
      name: 'PayPal', 
      emoji: '💳',
      display: 'Comisión incluida'
    }
  ],

  // Mensajes
  messages: {
    ticketCreated: '¡Ticket creado exitosamente!',
    ticketClosed: 'Ticket cerrado. Gracias por tu compra.',
    paymentPending: 'Esperando verificación del equipo autorizado...',
    keyDelivered: '¡Licencia entregada exitosamente!'
  }
};
