# ⚡ Quick Start Guide - FNS Tickets

Get your Discord ticket system running in under 10 minutes!

## 🎯 Prerequisites Checklist

Before starting, make sure you have:

- [ ] **Go 1.24+** installed - [Download](https://go.dev/dl/)
- [ ] **Node.js 20+** installed - [Download](https://nodejs.org/)
- [ ] **MongoDB Atlas** account - [Sign up](https://www.mongodb.com/cloud/atlas/register)
- [ ] **Discord bot** created - [Discord Developer Portal](https://discord.com/developers/applications)
- [ ] **Git** installed - [Download](https://git-scm.com/)

---

## 📋 Step-by-Step Setup

### Step 1: Clone the Repository (30 seconds)

```bash
git clone https://github.com/Sush1sui/fns-tickets.git
cd fns-tickets
```

---

### Step 2: Create Discord Bot (2 minutes)

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **"New Application"** → Enter name → **Create**
3. Go to **Bot** tab:
   - Click **"Add Bot"**
   - **Enable** all three Privileged Gateway Intents:
     - ✅ Presence Intent
     - ✅ Server Members Intent
     - ✅ Message Content Intent
   - Click **"Reset Token"** → Copy the token
4. Go to **OAuth2** tab:
   - Copy **Client ID**
   - Copy **Client Secret**
   - Add Redirect: `http://localhost:3000/api/auth/callback/discord`
5. Go to **OAuth2 > URL Generator**:
   - **Scopes**: Select `bot` and `applications.commands`
   - **Bot Permissions**:
     - ✅ Manage Channels
     - ✅ Send Messages
     - ✅ Manage Messages
     - ✅ Embed Links
     - ✅ Attach Files
     - ✅ Read Message History
     - ✅ Add Reactions
   - Copy the URL and invite bot to your server

---

### Step 3: Setup MongoDB (2 minutes)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a **Free Cluster** (M0)
3. **Database Access**:
   - Create user with username/password
   - Save credentials!
4. **Network Access**:
   - Add IP: `0.0.0.0/0` (allow from anywhere)
5. Click **Connect** → **Drivers** → Copy connection string
6. Replace `<password>` with your actual password

Example: `mongodb+srv://myuser:mypass123@cluster0.abcde.mongodb.net/`

---

### Step 4: Configure Bot Environment (1 minute)

```bash
cd bot
touch .env
```

Paste this into `bot/.env` (replace with your values):

```env
# From Discord Developer Portal
BOT_TOKEN=MTIzNDU2Nzg5MDEyMzQ1Njc4OQ.AbCdEf.ghijklmnopqrstuvwxyz123456
APP_ID=1234567890123456789

# From MongoDB Atlas
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/
MONGODB_NAME=test

# Generate with: openssl rand -hex 32
BOT_API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6

# Default values (can leave as-is)
PORT=7694
NEXT_APP_URL=http://localhost:3000
```

**Quick generate API key**:

```bash
openssl rand -hex 32
```

---

### Step 5: Configure Dashboard Environment (1 minute)

```bash
cd ../next-app
touch .env.local
```

Paste this into `next-app/.env.local`:

```env
# Same MongoDB URI as bot (MUST match!)
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/test

# From Discord Developer Portal (OAuth2 tab)
DISCORD_CLIENT_ID=1234567890123456789
DISCORD_CLIENT_SECRET=AbCdEfGhIjKlMnOpQrStUvWxYz123456

# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=xyz789abc456def123ghi789jkl012mno345pqr678stu901
NEXTAUTH_URL=http://localhost:3000

# Must match bot's BOT_API_KEY
BOT_API_URL=http://localhost:7694
BOT_API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

**Quick generate NextAuth secret**:

```bash
openssl rand -base64 32
```

---

### Step 6: Install Dependencies (2 minutes)

**Terminal 1 - Bot**:

```bash
cd bot
go mod download
```

**Terminal 2 - Dashboard**:

```bash
cd next-app
npm install
# or: yarn install
# or: pnpm install
```

---

### Step 7: Start the Application (1 minute)

**Terminal 1 - Start Bot**:

```bash
cd bot
go run ./cmd/fns-tickets
```

✅ Look for: `Bot is now running`

**Terminal 2 - Start Dashboard**:

```bash
cd next-app
npm run dev
```

✅ Look for: `Ready in X.Xs`

---

### Step 8: First Login & Setup (1 minute)

1. Open browser: **http://localhost:3000**
2. Click **"Login with Discord"**
3. Authorize the application
4. You should see your Discord servers!

---

### Step 9: Create Your First Panel (2 minutes)

1. Click on your server
2. Navigate to **"Panels"** → **"+ New Panel"**
3. Fill in the form:
   - **Panel Title**: Support Tickets
   - **Panel Content**: Click button to create a ticket
   - **Panel Color**: Choose your favorite
   - **Panel Channel**: Select a channel
   - **Button Text**: Create Ticket
   - **Button Color**: Blue
   - **Ticket Category**: Select a category
4. Click **"Create Panel"**
5. Click **"Send Panel"** to deploy to Discord
6. Go to Discord and test it! 🎉

---

## 🎊 Success! What's Next?

Your ticket system is now fully operational! Here's what you can do:

### ✨ Explore Features

- **Multi-Panels**: Create dropdown menus with multiple ticket types
- **Settings**: Configure max tickets per user, auto-close timers
- **Transcripts**: View all ticket conversations from dashboard
- **Staff Management**: Assign support roles
- **Customize Embeds**: Add images, emojis, and custom welcome messages

### 📚 Learn More

- **Full Documentation**: See [README.md](./README.md)
- **Contributing**: See [CONTRIBUTING.md](./CONTRIBUTING.md)
- **Security Guide**: See [CODE_REVIEW_REPORT.md](./CODE_REVIEW_REPORT.md)

---

## 🐛 Troubleshooting

### Bot not starting?

```bash
# Check if environment variables are loaded
cd bot
go run ./cmd/fns-tickets
```

Common issues:

- ❌ Missing `.env` file → Create it in `bot/` directory
- ❌ Invalid `BOT_TOKEN` → Get new token from Discord portal
- ❌ MongoDB connection failed → Check `MONGODB_URI` is correct

### Dashboard not starting?

```bash
# Clear cache and reinstall
cd next-app
rm -rf .next node_modules
npm install
npm run dev
```

Common issues:

- ❌ Missing `.env.local` → Create it in `next-app/` directory
- ❌ Port 3000 in use → Stop other apps or change port
- ❌ MongoDB error → Ensure URI matches bot's database

### Can't login to dashboard?

Check:

- ✅ `DISCORD_CLIENT_ID` matches your Discord app ID
- ✅ `DISCORD_CLIENT_SECRET` is correct
- ✅ Redirect URL is added: `http://localhost:3000/api/auth/callback/discord`
- ✅ `NEXTAUTH_URL` is set to `http://localhost:3000`
- ✅ `NEXTAUTH_SECRET` is generated and set

### Panels not appearing in Discord?

Verify:

- ✅ Bot is online in your Discord server
- ✅ Bot has "Send Messages" permission in target channel
- ✅ Channel ID in dashboard matches Discord channel
- ✅ `BOT_API_KEY` matches in both `.env` files
- ✅ Bot API is running on port 7694

### Database errors?

Make sure:

- ✅ MongoDB Atlas is configured correctly
- ✅ IP whitelist includes `0.0.0.0/0` or your IP
- ✅ Database user has read/write permissions
- ✅ Password in connection string is URL-encoded (no special chars)
- ✅ Both bot and dashboard use same `MONGODB_URI`
- ✅ Database name is "test" or matches your config

---

## 💡 Pro Tips

### Development

```bash
# Run with live reload (Go)
go install github.com/air-verse/air@latest
cd bot
air

# Dashboard auto-reloads with Turbopack
cd next-app
npm run dev
```

### Check logs

```bash
# Bot logs
cd bot
go run ./cmd/fns-tickets 2>&1 | tee bot.log

# Dashboard logs - check terminal output
```

### Database inspection

Use [MongoDB Compass](https://www.mongodb.com/products/compass) to visually browse your database:

1. Download MongoDB Compass
2. Connect using your `MONGODB_URI`
3. Browse collections: `servers`, `panels`, `tickets`, `transcripts`

### Test API endpoints

```bash
# Test bot API (replace with your BOT_API_KEY)
curl -H "Authorization: Bearer your_bot_api_key" \
  http://localhost:7694/api/servers/YOUR_SERVER_ID

# Should return server data if working
```

---

## 🚀 Production Deployment

Once everything works locally, deploy to production:

### Bot Deployment

- **Railway** - [Guide](https://railway.app/)
- **Fly.io** - [Guide](https://fly.io/)
- **Docker** - See README.md

### Dashboard Deployment

- **Vercel** (Recommended) - [Deploy](https://vercel.com/)
- **Netlify** - [Deploy](https://netlify.com/)

**Remember to**:

- Update environment variables with production URLs
- Change `NEXTAUTH_URL` to your domain
- Update Discord OAuth redirect URLs
- Restrict MongoDB IP whitelist
- Use strong, unique API keys

---

## 📞 Need Help?

- **GitHub Issues**: [Report bugs](https://github.com/yourusername/fns-tickets/issues)
- **Discussions**: [Ask questions](https://github.com/yourusername/fns-tickets/discussions)
- **Discord**: Join our support server

---

## ⏱️ Time Spent

- ✅ Prerequisites: Already have
- ✅ Discord bot setup: 2 minutes
- ✅ MongoDB setup: 2 minutes
- ✅ Bot config: 1 minute
- ✅ Dashboard config: 1 minute
- ✅ Install dependencies: 2 minutes
- ✅ Start services: 1 minute
- ✅ First login: 1 minute
- ✅ Create panel: 2 minutes

**Total: ~10 minutes** ⚡

---

<div align="center">

**🎉 Congratulations! Your ticket system is live!**

Star the repo if you found this helpful! ⭐

</div>
