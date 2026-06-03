# 🎫 Aura Hax Ticket - Bot de Discord

Bot profesional de Discord para venta de licencias de **FF - Complex** con sistema de tickets y aprobación manual.

## 🌟 Características

- ✅ Sistema de tickets profesional con embeds personalizados
- 🎮 Producto: **FF - Complex** (1 día, 7 días, 15 días, 30 días, 365 días)
- 💰 Precios configurados: $2, $10, $16, $24, $65 USD
- 🔑 Integración con **KeyAuth** para generación automática de licencias
- 💳 Métodos de pago: **Binance (USDT), Nequi (COP), PayPal**
- 👑 Aprobación manual por el owner
- 📊 Sistema de cantidad de licencias (1-5)
- 🚀 Listo para Railway (hosting gratis 30 días)

## 📋 Requisitos

- Node.js 18 o superior
- Una cuenta de Discord
- Un bot creado en [Discord Developer Portal](https://discord.com/developers/applications)

## 🚀 Instalación Local

### 1. Clonar e instalar dependencias

```bash
npm install
```

### 2. Crear tu bot en Discord

1. Ve a https://discord.com/developers/applications
2. Clic en "New Application"
3. Ve a la sección "Bot"
4. Activa estos intents:
   - ✅ PRESENCE INTENT
   - ✅ SERVER MEMBERS INTENT
   - ✅ MESSAGE CONTENT INTENT
5. Copia el token del bot

### 3. Configurar variables de entorno

Crea un archivo `.env` (copia de `.env.example`):

```env
DISCORD_TOKEN=tu_token_aqui
OWNER_ID=tu_id_de_discord
GUILD_ID=id_del_servidor
```

**Cómo obtener tu ID de Discord:**
1. Activa el modo desarrollador en Discord (Configuración > Avanzado > Modo Desarrollador)
2. Clic derecho en tu nombre → Copiar ID

### 4. Invitar el bot a tu servidor

Usa este link (reemplaza CLIENT_ID con el ID de tu aplicación):

```
https://discord.com/api/oauth2/authorize?client_id=TU_CLIENT_ID&permissions=8&scope=bot%20applications.commands
```

### 5. Ejecutar el bot

```bash
npm start
```

## 🎮 Uso del Bot

### Configuración inicial

1. En un canal de tu servidor, escribe: `!setup`
2. Se creará el panel de tickets automáticamente

### Flujo de compra (Cliente)

1. Cliente hace clic en **"🎫 Crear Ticket"**
2. Se abre un canal privado con menús desplegables
3. Selecciona:
   - **Plan** (1 día, 7 días, 15 días, 30 días, 365 días)
   - **Cantidad de licencias** (1-5)
   - **Método de pago** (Binance, Nequi, PayPal)
4. El bot muestra la información de pago
5. Cliente realiza el pago
6. Cliente pulsa **"Ya realicé el pago"**
7. El bot notifica al owner

### Flujo de aprobación (Owner)

1. En el canal del ticket aparece:
   - Embed rojo con información del cliente
   - Producto, método, importe
   - Botón **"Pago verificado"**

2. El owner también recibe DM con la información

3. Si el pago es correcto:
   - Owner pulsa **"Pago verificado"**
   - El bot genera la licencia con **KeyAuth** (o key temporal)
   - La licencia se publica en el canal
   - El ticket se cierra en 30 segundos

### Comandos del Owner (por DM)

- `!pending` - Ver solicitudes pendientes
- `!help` - Ver ayuda
- (Opcional) `!keyinfo <key>` - Ver info de una licencia
- (Opcional) `!delkey <key>` - Eliminar una licencia

## ☁️ Desplegar en Railway

### Opción 1: Desde GitHub (Recomendada)

1. Sube tu código a GitHub (sin el archivo .env)
2. Ve a [Railway.app](https://railway.app)
3. Clic en "New Project" → "Deploy from GitHub repo"
4. Selecciona tu repositorio
5. Agrega las variables de entorno:
   - `DISCORD_TOKEN`
   - `OWNER_ID`
   - `GUILD_ID`
6. Deploy automático ✅

### Opción 2: Desde CLI

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Inicializar proyecto
railway init

# Agregar variables de entorno
railway variables set DISCORD_TOKEN=tu_token
railway variables set OWNER_ID=tu_id
railway variables set GUILD_ID=id_servidor

# Deploy
railway up
```

## ⚙️ Personalización

### Editar precios y planes

Modifica `config.js`:

```javascript
product: {
  name: 'FF - Complex',
  plans: [
    { days: 1, price: 2, label: '1 día — $2' },
    { days: 7, price: 10, label: '1 semana — $10' },
    { days: 15, price: 16, label: '15 días — $16' },
    { days: 30, price: 24, label: '1 mes — $24' },
    { days: 365, price: 65, label: '1 año — $65' }
  ]
}
```

### Cambiar métodos de pago

En `config.js`:

```javascript
paymentMethods: [
  { id: 'binance', name: 'Binance', emoji: '🟡', display: 'USDT (BEP20)' },
  { id: 'nequi', name: 'Nequi', emoji: '💜', display: 'COP' },
  { id: 'paypal', name: 'PayPal', emoji: '💳', display: 'Con comisión' }
]
```

### Cambiar colores

En `config.js`:

```javascript
colors: {
  primary: '#00ff00',  // Verde neón (Aura Hax)
  success: '#00ff00',  // Aprobado
  error: '#ff0000',    // Rechazado
  pending: '#ff0000'   // Pendiente
}
```

## 🔌 Integración con KeyAuth

**¡KeyAuth ya está integrado!** 🎉

### ¿Cómo funciona?

- Si configuras KeyAuth en `.env`, el bot generará licencias reales automáticamente
- Si NO configuras KeyAuth, el bot generará keys temporales (formato: XXXX-XXXX-XXXX-XXXX)

### Configurar KeyAuth

Lee la guía completa en **[KEYAUTH_SETUP.md](KEYAUTH_SETUP.md)**

**Resumen rápido:**

1. Crea cuenta en [keyauth.cc](https://keyauth.cc)
2. Crea una aplicación
3. Obtén tus credenciales:
   - Application Name
   - Owner ID
   - Seller Key

4. Agrégalas en `.env`:
```env
KEYAUTH_NAME=Aura Hax FF
KEYAUTH_OWNERID=tu_owner_id
KEYAUTH_SECRET=tu_seller_key
```

5. Reinicia el bot

**¡Listo!** El bot ahora genera licencias reales con KeyAuth.

## 📝 Estructura del Proyecto

```
├── index.js                      # Archivo principal
├── config.js                     # Configuración (colores, productos, precios)
├── package.json
├── .env                          # Variables de entorno (NO SUBIR A GIT)
├── README.md                     # Documentación principal
├── KEYAUTH_SETUP.md             # Guía de KeyAuth
├── GUIA_RAILWAY.md              # Guía de Railway
├── commands/
│   └── setup.js                 # Comando !setup para crear panel
├── handlers/
│   ├── buttonHandler.js         # Manejo de botones (crear ticket, aprobar, etc.)
│   ├── selectHandler.js         # Manejo de selects (plan, cantidad, método)
│   ├── modalHandler.js          # Manejo de modales (actualmente sin uso)
│   └── ownerHandler.js          # Comandos del owner por DM
└── utils/
    └── keyauth.js               # Integración con KeyAuth API
```

## 🆘 Solución de Problemas

### El bot no responde
- Verifica que los intents estén activados
- Revisa que el token sea correcto
- Asegúrate de que el bot tenga permisos en el servidor

### No recibo DMs del bot
- Asegúrate de tener los DMs abiertos
- Verifica que tu ID en OWNER_ID sea correcto

### Error al crear canales
- El bot necesita permisos de administrador
- Verifica que pueda crear canales

## 🎯 Mejoras Futuras (Opcional)

- [ ] Base de datos para guardar ventas (MongoDB/SQLite)
- [ ] Panel web de administración
- [ ] Estadísticas de ventas
- [ ] Sistema de descuentos/cupones
- [ ] Múltiples owners/staff
- [ ] Webhook para notificaciones
- [ ] Sistema de referidos
- [ ] Pagos automáticos con APIs (Stripe, Coinbase)

## 📞 Soporte

Si tienes problemas, revisa:
1. Que todas las variables de entorno estén configuradas
2. Que los intents del bot estén activados
3. Que el bot tenga permisos necesarios

## 📄 Licencia

MIT - Úsalo libremente para tu servidor.

---

**¡Hecho con 💜 para la comunidad de Discord!**
