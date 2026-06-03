# 📚 Índice de Documentación - Aura Hax Ticket Bot

Guía completa de todos los archivos y documentación del proyecto.

## 🚀 Empezar Aquí

Si es tu primera vez, lee en este orden:

1. **[SETUP_RAPIDO.md](SETUP_RAPIDO.md)** ⭐ - Setup en 10 minutos
2. **[MI_BOT_INFO.md](MI_BOT_INFO.md)** - Obtener tu información del Developer Portal
3. **[README.md](README.md)** - Documentación completa del bot

## 📁 Archivos del Proyecto

### 🔧 Configuración

| Archivo | Descripción |
|---------|-------------|
| `.env.example` | Plantilla de variables de entorno |
| `.env` | **TU archivo personal** (NO subir a GitHub) |
| `config.js` | Configuración del bot (precios, colores, métodos) |
| `package.json` | Dependencias del proyecto |
| `.gitignore` | Archivos ignorados por Git |

### 💻 Código Principal

| Archivo | Descripción |
|---------|-------------|
| `index.js` | Archivo principal del bot |
| `commands/setup.js` | Comando !setup para crear panel |
| `handlers/buttonHandler.js` | Lógica de botones |
| `handlers/selectHandler.js` | Lógica de selects (planes, métodos) |
| `handlers/modalHandler.js` | Lógica de modales (sin uso actual) |
| `handlers/ownerHandler.js` | Comandos del owner por DM |
| `utils/keyauth.js` | Integración con KeyAuth API |

### 📖 Documentación

| Archivo | Descripción |
|---------|-------------|
| **[SETUP_RAPIDO.md](SETUP_RAPIDO.md)** | ⭐ Setup rápido en 10 minutos |
| **[README.md](README.md)** | Documentación completa |
| **[MI_BOT_INFO.md](MI_BOT_INFO.md)** | Info del Developer Portal |
| **[KEYAUTH_SETUP.md](KEYAUTH_SETUP.md)** | Configurar KeyAuth |
| **[GUIA_RAILWAY.md](GUIA_RAILWAY.md)** | Desplegar en Railway |
| **[PREVIEW.md](PREVIEW.md)** | Vista previa de los embeds |
| **[INDEX.md](INDEX.md)** | Este archivo |

## 🎯 Guías por Tema

### Para Configuración Inicial

1. **[SETUP_RAPIDO.md](SETUP_RAPIDO.md)** - Instalación y configuración
2. **[MI_BOT_INFO.md](MI_BOT_INFO.md)** - Obtener credenciales

### Para KeyAuth

1. **[KEYAUTH_SETUP.md](KEYAUTH_SETUP.md)** - Setup completo de KeyAuth
2. `utils/keyauth.js` - Código de integración

### Para Hosting

1. **[GUIA_RAILWAY.md](GUIA_RAILWAY.md)** - Railway paso a paso
2. `.env.example` - Variables necesarias

### Para Personalización

1. `config.js` - Precios, planes, métodos de pago
2. `commands/setup.js` - Panel de tickets
3. `handlers/selectHandler.js` - Información de pago

### Para Vista Previa

1. **[PREVIEW.md](PREVIEW.md)** - Cómo se ven los embeds
2. `config.js` - Colores y diseño

## 🎮 Características del Bot

### ✅ Sistema de Tickets
- Crear ticket con botón
- Canal privado por ticket
- Cierre automático de tickets

### 📦 Productos
- **FF - Complex**
- 5 planes: 1d, 7d, 15d, 30d, 365d
- Precios: $2, $10, $16, $24, $65

### 💳 Métodos de Pago
- 🟡 Binance (USDT BEP20)
- 💜 Nequi (COP)
- 💳 PayPal

### 🔑 Generación de Licencias
- KeyAuth (automático)
- Fallback temporal (si KeyAuth no está)

### 👑 Sistema de Aprobación
- Owner aprueba manualmente
- Notificaciones por DM
- Embed de revisión pendiente

## 🛠️ Tecnologías Usadas

- **Node.js** - Runtime
- **Discord.js v14** - Librería de Discord
- **dotenv** - Variables de entorno
- **KeyAuth API** - Sistema de licencias

## 📊 Estructura de Archivos

```
Bot Discord/
├── index.js                       # 🚀 Archivo principal
├── config.js                      # ⚙️ Configuración
├── package.json
├── .env.example
├── .env                          # 🔒 TU configuración
├── .gitignore
│
├── commands/
│   └── setup.js                  # !setup comando
│
├── handlers/
│   ├── buttonHandler.js          # Botones
│   ├── selectHandler.js          # Selects (nuevo)
│   ├── modalHandler.js           # Modales
│   └── ownerHandler.js           # DM owner
│
├── utils/
│   └── keyauth.js                # KeyAuth API
│
└── docs/                         # 📚 Documentación
    ├── SETUP_RAPIDO.md          # ⭐ Start here
    ├── README.md                 # Main docs
    ├── MI_BOT_INFO.md           # Tu info
    ├── KEYAUTH_SETUP.md         # KeyAuth
    ├── GUIA_RAILWAY.md          # Railway
    ├── PREVIEW.md               # Vista previa
    └── INDEX.md                  # Este archivo
```

## 🔄 Flujo del Bot

```
1. Usuario crea ticket
   ↓
2. Selecciona plan (1d, 7d, 15d, 30d, 365d)
   ↓
3. Selecciona cantidad (1-5 licencias)
   ↓
4. Selecciona método de pago
   ↓
5. Ve información de pago
   ↓
6. Realiza pago
   ↓
7. Pulsa "Ya realicé el pago"
   ↓
8. Owner recibe notificación
   ↓
9. Owner verifica pago
   ↓
10. Owner pulsa "Pago verificado"
    ↓
11. Bot genera licencia (KeyAuth o temporal)
    ↓
12. Cliente recibe licencia
    ↓
13. Ticket se cierra automáticamente
```

## 🎨 Personalización Fácil

### Cambiar Precios
- Edita `config.js` → `product.plans`

### Cambiar Colores
- Edita `config.js` → `colors`

### Cambiar Métodos de Pago
- Edita `config.js` → `paymentMethods`

### Cambiar Info de Pago
- Edita `.env` → `BINANCE_ADDRESS`, `NEQUI_NUMBER`, etc.
- Edita `handlers/selectHandler.js` línea ~70

### Cambiar Nombre del Bot
- Edita `config.js` → `botName`

## 🆘 Solución Rápida de Problemas

| Problema | Solución |
|----------|----------|
| Bot no inicia | Verifica `.env` y token |
| Bot no responde | Activa intents en Developer Portal |
| KeyAuth no funciona | Verifica credenciales en `.env` |
| No puedo subir a Railway | Lee `GUIA_RAILWAY.md` |
| Error en comandos | Verifica permisos del bot |

## 📞 Recursos Útiles

- [Discord Developer Portal](https://discord.com/developers/applications)
- [Discord.js Documentación](https://discord.js.org)
- [KeyAuth Dashboard](https://keyauth.cc)
- [Railway Dashboard](https://railway.app)
- [Node.js Downloads](https://nodejs.org)

## 🎯 Checklist de Setup

- [ ] Node.js instalado
- [ ] Bot creado en Discord
- [ ] Token copiado
- [ ] Intents activados
- [ ] Bot invitado al servidor
- [ ] `.env` creado y configurado
- [ ] `npm install` ejecutado
- [ ] Bot iniciado con `npm start`
- [ ] `!setup` ejecutado en Discord
- [ ] Ticket de prueba creado
- [ ] (Opcional) KeyAuth configurado
- [ ] (Opcional) Subido a Railway

## 🎉 ¡Todo Listo!

Si completaste el checklist, tu bot está funcionando.

### Próximos Pasos Recomendados

1. ✅ Personaliza los precios en `config.js`
2. ✅ Configura tus métodos de pago reales
3. ✅ Configura KeyAuth para licencias reales
4. ✅ Sube el bot a Railway para 24/7
5. ✅ Comparte el panel de tickets con tus clientes

---

**¿Dudas?** Lee la documentación o revisa los logs del bot para ver errores específicos.

**¡Disfruta tu bot!** 🚀
