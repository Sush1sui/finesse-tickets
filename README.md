# 🎫 FNS Tickets - Advanced Discord Ticket System

<div align="center">

![Personal Project](https://img.shields.io/badge/Personal-Portfolio%20Project-blueviolet?style=for-the-badge)
![Discord Bot](https://img.shields.io/badge/Discord-Bot-5865F2?style=for-the-badge&logo=discord&logoColor=white)
![Go](https://img.shields.io/badge/Go-1.24-00ADD8?style=for-the-badge&logo=go&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15.5-000000?style=for-the-badge&logo=next.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

_A production-ready, full-stack Discord ticket management system with real-time transcripts, advanced panel customization, and comprehensive administrative dashboard._

**Personal portfolio project showcasing full-stack development, microservices architecture, and modern web technologies.**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Configuration](#-configuration) • [Documentation](#-documentation) • [Screenshots](#-screenshots)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Project](#-running-the-project)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Development](#-development)
- [Deployment](#-deployment)
- [Performance & Scalability](#-performance--scalability)
- [Security](#-security)
- [License](#-license)
- [Contact](#-contact)

---

## 🌟 Overview

**FNS Tickets** is an enterprise-grade Discord ticket management system that combines a high-performance Go backend with a modern Next.js dashboard. Built as a comprehensive full-stack portfolio project, it demonstrates expertise in microservices architecture, real-time systems, and modern web development practices.

### Project Highlights

- **🚀 Performance-First**: Built with Go for lightning-fast response times and low memory footprint
- **💎 Modern Stack**: Next.js 15 with React 19, TypeScript, and Tailwind CSS
- **📊 Real-Time Analytics**: Track ticket metrics, response times, and team performance
- **🔒 Security**: JWT authentication, role-based access control, and secure API key validation
- **📝 Complete Transcripts**: Automatic conversation archiving with message history, embeds, and attachments
- **🎨 Fully Customizable**: Customizable ticket panels with embeds, colors, emojis, and welcome messages
- **⚡ Auto-Close System**: Intelligent ticket auto-closure based on inactivity patterns
- **🔄 Rate Limiting**: Built-in Discord API rate limit handling with automatic retries

---

## ✨ Features

### 🎯 Core Ticket Management

- **One-Click Ticket Creation**: Users open tickets via buttons or select menus
- **Multi-Panel Support**: Create unlimited ticket panels with different categories
- **Custom Permissions**: Fine-grained control over attachments, links, and reactions
- **Max Tickets Per User**: Prevent spam with configurable limits
- **Ticket Naming Styles**: Flexible channel naming (number-based, username-based, etc.)
- **Auto-Close System**: Close inactive tickets automatically after configurable periods
- **Close on User Leave**: Optionally close tickets when user leaves the server

### 📊 Advanced Transcript System

- **Real-Time Message Capture**: Automatically records all messages, embeds, and attachments
- **Comprehensive Metadata**: Track participants, message counts, timestamps, and duration
- **Rich Embed Notifications**: Beautiful transcript summaries sent to configured channels
- **Dashboard Viewer**: Browse and search all transcripts with powerful filtering
- **Individual Transcript View**: Full conversation replay with message timestamps
- **Voice Activity Tracking**: Record voice channel joins/leaves (extensible)
- **Search & Filter**: Search by ticket ID, user, panel, or username

### 🎨 Panel Customization

- **Rich Embeds**: Custom titles, descriptions, colors, images, and thumbnails
- **Button Styling**: Choose from Discord's button colors (blue, gray, green, red)
- **Emoji Support**: Add custom or Unicode emojis to buttons
- **Welcome Messages**: Configurable welcome embeds with role mentions
- **Multi-Panel Dropdowns**: Combine multiple panels into select menus
- **Live Preview**: See changes in real-time before deploying

### 👥 Administrative Dashboard

- **Discord OAuth**: Secure login with Discord authentication
- **Server Management**: Manage multiple servers from one dashboard
- **Panel Editor**: Create, edit, and delete ticket panels
- **Settings Configuration**: Configure ticket limits, permissions, and auto-close
- **Staff Management**: Assign staff roles and permissions
- **Transcript Viewer**: Browse and review all ticket conversations
- **Real-Time Updates**: React Query for instant cache invalidation

### 🔧 Developer Experience

- **RESTful API**: Well-documented API endpoints for all operations
- **TypeScript Types**: Full type safety across frontend and backend
- **Error Handling**: Comprehensive error handling with meaningful messages
- **Logging**: Structured logging for debugging and monitoring
- **Database Indexing**: Optimized queries with proper MongoDB indexes
- **Connection Pooling**: Efficient database connection management
- **Hot Reload**: Fast development with Next.js Turbopack and Go live reload

---

## 🛠 Tech Stack

### Backend (Discord Bot)

- **Language**: Go 1.24
- **Framework**: [DiscordGo](https://github.com/bwmarrin/discordgo) v0.29
- **Database Driver**: [MongoDB Go Driver](https://github.com/mongodb/mongo-go-driver) v2.3
- **HTTP Router**: Native `net/http` with custom middleware
- **Environment**: [godotenv](https://github.com/joho/godotenv)
- **Architecture**: Clean Architecture with repository pattern

### Frontend (Dashboard)

- **Framework**: [Next.js](https://nextjs.org/) 15.5 with Turbopack
- **UI Library**: React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **State Management**: [@tanstack/react-query](https://tanstack.com/query) v5.90
- **Authentication**: [NextAuth.js](https://next-auth.js.org/) v4.24
- **Database ORM**: [Mongoose](https://mongoosejs.com/) v8.19
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Theme**: next-themes (dark/light mode)

### Database & Infrastructure

- **Database**: MongoDB Atlas (or self-hosted)
- **Authentication**: Discord OAuth 2.0
- **Session Storage**: JWT with secure HTTP-only cookies
- **Deployment**:
  - Bot: Any VPS, Railway, Fly.io, or Docker
  - Frontend: Vercel, Netlify, or self-hosted

---

## 🏗 Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Discord API                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                      Go Discord Bot                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Commands   │  │    Events    │  │  HTTP Server │      │
│  │   Handler    │  │   Handler    │  │  (Bot API)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                 │                   │              │
│         └─────────────────┴───────────────────┘              │
│                          │                                   │
│                  ┌───────▼───────┐                           │
│                  │   Repository   │                           │
│                  │     Layer      │                           │
│                  └───────┬───────┘                           │
└──────────────────────────┼───────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      MongoDB Atlas                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Servers  │  │ Tickets  │  │  Panels  │  │Transcripts│   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                           ▲
                           │
┌──────────────────────────┼───────────────────────────────────┐
│                 Next.js Dashboard                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Auth       │  │   API        │  │   UI Pages   │      │
│  │  (NextAuth)  │  │   Routes     │  │  (React 19)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                 │                   │              │
│         └─────────────────┴───────────────────┘              │
│                          │                                   │
│                  ┌───────▼───────┐                           │
│                  │   Mongoose    │                           │
│                  │      ORM       │                           │
│                  └───────────────┘                           │
└─────────────────────────────────────────────────────────────┘
```

### Bot Architecture (Go)

```
cmd/fns-tickets/
├── main.go                 # Application entry point
│
internal/
├── bot/                    # Bot core logic
│   ├── bot.go              # Discord session setup
│   ├── autoclose.go        # Background worker for auto-close
│   ├── ratelimit.go        # Discord API rate limit handler
│   ├── commands/           # Slash command handlers
│   ├── events/             # Event handlers (buttons, messages)
│   └── deploy/             # Command/event registration
│
├── repository/             # Data access layer
│   ├── guild.go            # Server configuration CRUD
│   ├── transcripts.go      # Transcript operations
│   ├── user_tickets.go     # Ticket management
│   └── indexes.go          # Database index creation
│
├── server/                 # HTTP API server
│   ├── handlers/           # API endpoint handlers
│   │   ├── sendPanel.go    # Panel deployment
│   │   ├── servers.go      # Server data endpoints
│   │   └── ...
│   └── routes/             # Route registration
│
├── config/                 # Configuration management
│   └── config.go           # Environment variables
│
└── common/                 # Shared utilities
    └── pingServer.go       # Keep-alive pinger
```

### Frontend Architecture (Next.js)

```
app/
├── layout.tsx              # Root layout with providers
├── page.tsx                # Landing page
├── home/                   # Public home page
├── dashboard/              # Protected dashboard
│   ├── page.tsx            # Server selection
│   └── guild/              # Per-server routes
│       └── [guildId]/
│           ├── panels/     # Panel management
│           ├── settings/   # Server settings
│           ├── staff/      # Staff configuration
│           └── transcripts/# Transcript viewer
│
├── api/                    # API routes (backend)
│   ├── auth/               # NextAuth endpoints
│   ├── dashboard/          # Dashboard APIs
│   │   └── guild/
│   │       └── [guildId]/
│   │           ├── panels/
│   │           ├── transcripts/
│   │           ├── data/
│   │           └── ...
│   └── panels/             # Public panel APIs
│
components/
├── ui/                     # Reusable UI components
├── layout/                 # Layout components
└── providers/              # React context providers

lib/
├── auth.ts                 # NextAuth configuration
├── db.ts                   # MongoDB connection
├── discord.ts              # Discord API helpers
└── utils.ts                # Utility functions

models/
├── Panel.ts                # Panel schema
├── Server.ts               # Server schema
├── Transcript.ts           # Transcript schema
└── User.ts                 # User schema
```

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

### Required

- **Go**: 1.24 or higher ([Download](https://go.dev/dl/))
- **Node.js**: 20.x or higher ([Download](https://nodejs.org/))
- **MongoDB**: Atlas account or local instance ([Get Started](https://www.mongodb.com/))
- **Discord Bot**: Create at [Discord Developer Portal](https://discord.com/developers/applications)
- **Discord OAuth App**: Same application with OAuth2 enabled

### Optional (Recommended)

- **Git**: For version control
- **VS Code**: With Go and TypeScript extensions
- **MongoDB Compass**: For database management
- **Postman**: For API testing

---

## 🚀 Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/fns-tickets.git
cd fns-tickets
```

### Step 2: Set Up Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Navigate to the "Bot" tab:
   - Click "Add Bot"
   - Enable these **Privileged Gateway Intents**:
     - ✅ Presence Intent
     - ✅ Server Members Intent
     - ✅ Message Content Intent
   - Copy the **Bot Token** (you'll need this later)
4. Navigate to the "OAuth2" tab:
   - Copy your **Client ID**
   - Copy your **Client Secret**
   - Add redirect URL: `http://localhost:3000/api/auth/callback/discord`
5. Navigate to "OAuth2 > URL Generator":
   - **Scopes**: `bot`, `applications.commands`
   - **Bot Permissions**:
     - Manage Channels
     - Send Messages
     - Manage Messages
     - Embed Links
     - Attach Files
     - Read Message History
     - Add Reactions
     - Manage Roles (if using role mentions)
   - Copy the generated URL and use it to invite the bot to your server

### Step 3: MongoDB Setup

#### Option A: MongoDB Atlas (Recommended for Production)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Configure:
   - **Database Access**: Create a user with read/write permissions
   - **Network Access**: Add `0.0.0.0/0` for development (restrict in production)
4. Click "Connect" → "Connect your application"
5. Copy the connection string (replace `<password>` with your actual password)

#### Option B: Local MongoDB

```bash
# macOS (Homebrew)
brew install mongodb-community
brew services start mongodb-community

# Ubuntu/Debian
sudo apt-get install mongodb
sudo systemctl start mongodb

# Connection string: mongodb://localhost:27017
```

### Step 4: Install Bot Dependencies

```bash
cd bot
go mod download
```

### Step 5: Install Frontend Dependencies

```bash
cd ../next-app
npm install
# or
yarn install
# or
pnpm install
```

---

## ⚙️ Configuration

### Bot Configuration (.env)

Create a `.env` file in the `bot` directory:

```bash
cd bot
touch .env
```

Add the following environment variables:

```env
# Discord Bot Configuration
BOT_TOKEN=your_discord_bot_token_here
APP_ID=your_discord_application_id_here

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
MONGODB_NAME=test

# API Configuration
BOT_API_KEY=your_secure_random_api_key_here
PORT=7694

# Next.js Integration
NEXT_APP_URL=http://localhost:3000

# Optional: Server Keep-Alive
SERVER_URL=https://your-bot-url.com
```

#### Environment Variable Details

| Variable       | Description                                                                  | Example                                        |
| -------------- | ---------------------------------------------------------------------------- | ---------------------------------------------- |
| `BOT_TOKEN`    | Discord bot token from Developer Portal                                      | `MTIzNDU2Nzg5MDEyMzQ1Njc4OQ.AbCdEf...`         |
| `APP_ID`       | Discord application ID                                                       | `1234567890123456789`                          |
| `MONGODB_URI`  | MongoDB connection string                                                    | `mongodb+srv://user:pass@cluster.mongodb.net/` |
| `MONGODB_NAME` | Database name to use                                                         | `test` or `production`                         |
| `BOT_API_KEY`  | Secure key for bot API authentication (generate with `openssl rand -hex 32`) | `a1b2c3d4e5f6...`                              |
| `PORT`         | HTTP server port                                                             | `7694`                                         |
| `NEXT_APP_URL` | URL where Next.js dashboard is running                                       | `http://localhost:3000`                        |
| `SERVER_URL`   | (Optional) URL for keep-alive pings                                          | `https://mybot.railway.app`                    |

### Frontend Configuration (.env.local)

Create a `.env.local` file in the `next-app` directory:

```bash
cd ../next-app
touch .env.local
```

Add the following environment variables:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/test

# Discord OAuth Configuration
DISCORD_CLIENT_ID=your_discord_application_id_here
DISCORD_CLIENT_SECRET=your_discord_client_secret_here

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secure_random_secret_here

# Encryption (for storing Discord tokens)
ENCRYPTION_KEY=your_64_char_hex_encryption_key_here

# Bot Server Communication
BOT_SERVER_URL=http://localhost:7694
BOT_API_KEY=same_api_key_as_bot_env
```

#### Frontend Environment Variable Details

| Variable                | Description                                                                               | Example                                            |
| ----------------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `MONGODB_URI`           | MongoDB connection string (must match bot's database)                                     | `mongodb+srv://user:pass@cluster.mongodb.net/test` |
| `DISCORD_CLIENT_ID`     | Discord OAuth client ID (same as `APP_ID` in bot)                                         | `1234567890123456789`                              |
| `DISCORD_CLIENT_SECRET` | Discord OAuth client secret                                                               | `AbCdEf123456...`                                  |
| `NEXTAUTH_URL`          | Full URL of your dashboard                                                                | `http://localhost:3000`                            |
| `NEXTAUTH_SECRET`       | Random secret for JWT encryption (generate with `openssl rand -base64 32`)                | `xyz789abc456...`                                  |
| `ENCRYPTION_KEY`        | 64-character hex key for encrypting Discord tokens (generate with `openssl rand -hex 32`) | `f29516df89938c1a...`                              |
| `BOT_SERVER_URL`        | URL where bot HTTP server is running                                                      | `http://localhost:7694`                            |
| `BOT_API_KEY`           | Must match the bot's `BOT_API_KEY`                                                        | `a1b2c3d4e5f6...`                                  |

> **⚠️ Security Warning**: Never commit `.env` or `.env.local` files to version control. They're already in `.gitignore`.

---

## 🏃 Running the Project

### Development Mode

#### Terminal 1: Start the Bot

```bash
cd bot
go run ./cmd/fns-tickets
```

Expected output:

```
Successfully connected to MongoDB
Server is listening on Port: 7694
Bot is now running
Auto-close worker started
```

#### Terminal 2: Start the Dashboard

```bash
cd next-app
npm run dev
# or
yarn dev
# or
pnpm dev
```

Expected output:

```
▲ Next.js 15.5.4 (turbopack)
- Local:        http://localhost:3000
- Environments: .env.local

✓ Starting...
✓ Ready in 1.2s
```

### Access the Application

- **Dashboard**: http://localhost:3000
- **Bot API**: http://localhost:7694
- **Bot Status**: Check your Discord server - bot should be online

### First-Time Setup

1. Open the dashboard at http://localhost:3000
2. Click "Login with Discord"
3. Authorize the application
4. Select your server from the dashboard
5. Navigate to **Panels** → **Create Panel**
6. Configure your first ticket panel
7. Click "Send Panel" to deploy it to Discord
8. Test by clicking the button in Discord!

---

## 📂 Project Structure

### Complete Directory Tree

```
fns-tickets/
├── bot/                            # Go Discord bot
│   ├── cmd/
│   │   └── fns-tickets/
│   │       └── main.go             # Entry point
│   ├── internal/
│   │   ├── bot/
│   │   │   ├── bot.go              # Bot initialization
│   │   │   ├── autoclose.go        # Auto-close worker
│   │   │   ├── ratelimit.go        # Rate limit handler
│   │   │   ├── commands/           # Slash commands
│   │   │   ├── events/             # Event handlers
│   │   │   │   ├── buttonInteraction.go
│   │   │   │   └── messageTracking.go
│   │   │   └── deploy/             # Registration
│   │   ├── repository/             # Data layer
│   │   │   ├── guild.go            # Server config
│   │   │   ├── transcripts.go      # Transcript ops
│   │   │   ├── user_tickets.go     # Ticket ops
│   │   │   └── indexes.go          # DB indexes
│   │   ├── server/                 # HTTP API
│   │   │   ├── handlers/
│   │   │   │   ├── sendPanel.go
│   │   │   │   ├── sendMultiPanel.go
│   │   │   │   ├── servers.go
│   │   │   │   ├── channels.go
│   │   │   │   ├── roles.go
│   │   │   │   ├── categories.go
│   │   │   │   ├── emojis.go
│   │   │   │   └── members.go
│   │   │   └── routes/
│   │   │       └── routes.go
│   │   ├── config/
│   │   │   └── config.go           # Env config
│   │   └── common/
│   │       └── pingServer.go       # Keep-alive
│   ├── go.mod
│   ├── go.sum
│   └── .env                        # Environment variables
│
├── next-app/                       # Next.js dashboard
│   ├── app/
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Landing page
│   │   ├── globals.css             # Global styles
│   │   ├── home/
│   │   │   └── page.tsx            # Home page
│   │   ├── dashboard/
│   │   │   ├── page.tsx            # Server selector
│   │   │   └── guild/
│   │   │       └── [guildId]/
│   │   │           ├── page.tsx
│   │   │           ├── panels/     # Panel management
│   │   │           │   ├── page.tsx
│   │   │           │   ├── create/
│   │   │           │   ├── [panelId]/
│   │   │           │   ├── multi-create/
│   │   │           │   └── multi-edit/
│   │   │           ├── settings/   # Server settings
│   │   │           ├── staff/      # Staff config
│   │   │           └── transcripts/# Transcript viewer
│   │   │               ├── page.tsx
│   │   │               └── [transcriptId]/
│   │   └── api/                    # API routes
│   │       ├── auth/               # NextAuth
│   │       ├── dashboard/
│   │       │   └── guild/
│   │       │       └── [guildId]/
│   │       │           ├── panels/
│   │       │           ├── transcripts/
│   │       │           ├── categories/
│   │       │           ├── channels/
│   │       │           ├── roles/
│   │       │           ├── emojis/
│   │       │           └── data/
│   │       └── panels/
│   ├── components/
│   │   ├── ui/                     # Reusable components
│   │   │   ├── button.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── spinner.tsx
│   │   │   ├── toast.tsx
│   │   │   └── confirm-dialog.tsx
│   │   ├── layout/                 # Layout components
│   │   │   ├── header.tsx
│   │   │   ├── footer.tsx
│   │   │   └── layout-shell.tsx
│   │   ├── providers/              # Context providers
│   │   ├── emoji-picker.tsx
│   │   ├── guild-sidebar.tsx
│   │   ├── server-card.tsx
│   │   ├── mode-toggle.tsx
│   │   └── theme-provider.tsx
│   ├── context/
│   │   └── AuthContext.tsx         # Auth context
│   ├── hooks/
│   │   ├── useGuildQueries.ts      # React Query hooks
│   │   └── useToast.ts             # Toast hook
│   ├── lib/
│   │   ├── auth.ts                 # NextAuth config
│   │   ├── db.ts                   # MongoDB connection
│   │   ├── discord.ts              # Discord API
│   │   ├── utils.ts                # Utilities
│   │   ├── encryption.ts           # Crypto helpers
│   │   ├── rateLimit.ts            # Rate limiting
│   │   └── middleware.ts           # Middleware
│   ├── models/
│   │   ├── Panel.ts                # Panel schema
│   │   ├── Server.ts               # Server schema
│   │   ├── Transcript.ts           # Transcript schema
│   │   └── User.ts                 # User schema
│   ├── public/                     # Static assets
│   ├── middleware.ts               # Route middleware
│   ├── next.config.ts              # Next.js config
│   ├── tsconfig.json               # TypeScript config
│   ├── tailwind.config.ts          # Tailwind config
│   ├── package.json
│   └── .env.local                  # Environment variables
│
├── CODE_REVIEW_REPORT.md           # Code quality analysis
└── README.md                        # This file
```

---

## 📡 API Documentation

### Bot HTTP API

The Go bot exposes a REST API for the Next.js dashboard to interact with Discord.

**Base URL**: `http://localhost:7694` (or your deployed URL)

**Authentication**: All endpoints require `Authorization: Bearer {BOT_API_KEY}` header

#### Endpoints

##### Send Panel

Deploy a ticket panel to a Discord channel.

```http
POST /api/send-panel
Authorization: Bearer {BOT_API_KEY}
Content-Type: application/json

{
  "guildId": "1234567890",
  "channelId": "9876543210",
  "panelId": "507f1f77bcf86cd799439011",
  "title": "Support Tickets",
  "content": "Click the button below to create a ticket",
  "color": "#5865F2",
  "largeImgUrl": "https://example.com/image.png",
  "smallImgUrl": "https://example.com/icon.png",
  "btnText": "Create Ticket",
  "btnColor": "blue",
  "btnEmoji": "🎫"
}
```

**Response**: `200 OK` with message ID

##### Send Multi-Panel

Deploy a multi-panel dropdown to a Discord channel.

```http
POST /api/send-multi-panel
Authorization: Bearer {BOT_API_KEY}
Content-Type: application/json

{
  "guildId": "1234567890",
  "channelId": "9876543210",
  "panels": [
    {
      "id": "507f1f77bcf86cd799439011",
      "title": "General Support",
      "btnText": "General",
      "btnColor": "blue",
      "btnEmoji": "💬"
    },
    {
      "id": "507f1f77bcf86cd799439012",
      "title": "Bug Report",
      "btnText": "Report Bug",
      "btnColor": "red",
      "btnEmoji": "🐛"
    }
  ],
  "embed": {
    "color": "#5865F2",
    "title": "Support Center",
    "description": "Select a category below"
  }
}
```

##### Get Server Data

Fetch Discord server information.

```http
GET /api/servers/{guildId}
Authorization: Bearer {BOT_API_KEY}
```

**Response**:

```json
{
  "id": "1234567890",
  "name": "My Server",
  "icon": "https://cdn.discordapp.com/icons/...",
  "owner": false,
  "permissions": "2147483647"
}
```

##### Get Channels

Fetch all channels in a server.

```http
GET /api/servers/{guildId}/channels
Authorization: Bearer {BOT_API_KEY}
```

##### Get Roles

Fetch all roles in a server.

```http
GET /api/servers/{guildId}/roles
Authorization: Bearer {BOT_API_KEY}
```

##### Get Categories

Fetch all channel categories.

```http
GET /api/servers/{guildId}/categories
Authorization: Bearer {BOT_API_KEY}
```

##### Get Emojis

Fetch all custom emojis.

```http
GET /api/servers/{guildId}/emojis
Authorization: Bearer {BOT_API_KEY}
```

### Next.js API Routes

All dashboard API routes are located under `/api/dashboard` and require Discord authentication.

#### Panel APIs

```http
GET    /api/dashboard/guild/{guildId}/panels              # List panels
POST   /api/dashboard/guild/{guildId}/panels              # Create panel
GET    /api/dashboard/guild/{guildId}/panels/{panelId}    # Get panel
PUT    /api/dashboard/guild/{guildId}/panels/{panelId}    # Update panel
DELETE /api/dashboard/guild/{guildId}/panels/{panelId}    # Delete panel
```

#### Transcript APIs

```http
GET /api/dashboard/guild/{guildId}/transcripts
Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 20, max: 100)
  - userId: string (optional)
  - panelId: string (optional)
  - ticketId: string (optional)
  - username: string (optional)

GET /api/dashboard/guild/{guildId}/transcripts/{transcriptId}
```

#### Server Configuration APIs

```http
GET  /api/dashboard/guild/{guildId}/data      # Get server config
POST /api/dashboard/guild/{guildId}/settings  # Update settings
```

---

## 🗄 Database Schema

### Collections

#### `servers`

Server configuration and settings.

```typescript
{
  _id: ObjectId,
  serverId: string,                    // Discord server ID
  ticketConfig: {
    ticketNameStyle: string,           // "number" | "username"
    maxTicketsPerUser: number,
    ticketTranscript: string | null,   // Channel ID for transcripts
    ticketPermissions: {
      attachments: boolean,
      links: boolean,
      reactions: boolean
    },
    autoClose: {
      enabled: boolean,
      closeWhenUserLeaves: boolean,
      sinceOpenWithoutResponse: {
        Days: number,
        Hours: number,
        Minutes: number
      },
      sinceLastResponse: {
        Days: number,
        Hours: number,
        Minutes: number
      }
    }
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### `panels`

Ticket panel configurations.

```typescript
{
  _id: ObjectId,
  guild: string,                       // Discord server ID
  channel: string,                     // Target channel ID
  title: string,
  content: string,
  color: string,                       // Hex color
  largeImgUrl: string | null,
  smallImgUrl: string | null,
  btnText: string,
  btnColor: string,                    // "blue" | "gray" | "green" | "red"
  btnEmoji: string | null,
  mentionOnOpen: string[],             // Role IDs to mention
  ticketCategory: string,              // Category ID for tickets
  welcomeEmbed: {
    color: string,
    title: string | null,
    description: string | null,
    titleImgUrl: string | null,
    largeImgUrl: string | null,
    smallImgUrl: string | null,
    footerText: string | null,
    footerImgUrl: string | null
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### `tickets`

Active and closed tickets.

```typescript
{
  _id: ObjectId,
  guildId: string,
  channelId: string,
  userId: string,                      // Ticket creator
  panelId: string,
  createdAt: Date,
  lastMessageAt: Date,
  closed: boolean
}
```

#### `transcripts`

Full conversation transcripts.

```typescript
{
  _id: ObjectId,
  ticketId: string,                    // Reference to ticket
  guildId: string,
  channelId: string,
  panelId: string,
  userId: string,
  username: string,
  ticketNumber: number,
  messages: [
    {
      id: string,                      // Message ID
      type: string,                    // "message" | "embed" | "attachment" | "voice_join" | "voice_leave"
      author: {
        id: string,
        username: string,
        discriminator: string,
        avatar: string | null,
        bot: boolean
      },
      content: string | null,
      timestamp: Date,
      embeds: [...],
      attachments: [...],
      edited: boolean,
      editedTimestamp: Date | null,
      reactions: [...]
    }
  ],
  metadata: {
    ticketOpenedAt: Date,
    ticketClosedAt: Date,
    closedBy: {
      id: string,
      username: string
    },
    totalMessages: number,
    totalAttachments: number,
    totalEmbeds: number,
    participants: [
      {
        id: string,
        username: string,
        messageCount: number
      }
    ]
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes

Optimized indexes are created automatically on bot startup:

```javascript
// tickets collection
{ guildId: 1, userId: 1, closed: 1 }
{ channelId: 1 }
{ guildId: 1, closed: 1, lastMessageAt: 1 }

// transcripts collection
{ ticketId: 1 }
{ guildId: 1 }
{ guildId: 1, userId: 1 }
{ guildId: 1, panelId: 1 }

// servers collection
{ serverId: 1 }

// panels collection
{ guild: 1 }
```

---

## 💻 Development

### Development Workflow

#### Running with Live Reload

**Bot (with Air)**:

```bash
# Install Air for Go hot reload
go install github.com/air-verse/air@latest

# Run with live reload
cd bot
air
```

**Dashboard**:

```bash
cd next-app
npm run dev  # Turbopack provides fast refresh
```

#### Code Quality Tools

**Go**:

```bash
# Format code
go fmt ./...

# Run linter
golangci-lint run

# Run tests
go test ./...

# Check for vulnerabilities
go list -json -deps ./... | nancy sleuth
```

**TypeScript/React**:

```bash
cd next-app

# Run linter
npm run lint

# Type check
npx tsc --noEmit

# Format with Prettier (if configured)
npx prettier --write .
```

### Environment-Specific Tips

#### Development

- Use `http://localhost:3000` for Next.js URL
- Enable verbose logging in bot for debugging
- Use MongoDB Compass to inspect database
- Keep Chrome DevTools open for React Query cache inspection

#### Staging

- Deploy to separate MongoDB database
- Use environment-specific Discord bots (avoid affecting production)
- Test with limited user group

#### Production

- Use connection pooling limits appropriate for serverless
- Enable MongoDB Atlas alerts
- Set up error tracking (Sentry, etc.)
- Configure proper CORS and rate limiting
- Use secure API keys (never commit to Git)

---

## 🚀 Deployment

### Deploy Bot (Go)

#### Option 1: Railway

1. Create a [Railway](https://railway.app/) account
2. Create new project from GitHub repo
3. Set environment variables in Railway dashboard
4. Deploy automatically on push

#### Option 2: Fly.io

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Launch app
cd bot
fly launch

# Set secrets
fly secrets set BOT_TOKEN=your_token
fly secrets set MONGODB_URI=your_uri
# ... set all other env vars

# Deploy
fly deploy
```

#### Option 3: Docker

```dockerfile
# bot/Dockerfile
FROM golang:1.24-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o bot ./cmd/fns-tickets

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/bot .
COPY .env .
CMD ["./bot"]
```

```bash
docker build -t fns-tickets-bot .
docker run -d --env-file .env fns-tickets-bot
```

### Deploy Dashboard (Next.js)

#### Option 1: Vercel (Recommended)

1. Push code to GitHub
2. Go to [Vercel](https://vercel.com/)
3. Import repository
4. Configure environment variables
5. Deploy

#### Option 2: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
cd next-app
netlify deploy --prod
```

#### Option 3: Self-Hosted

```bash
cd next-app
npm run build
npm start
```

### Deployment Checklist

- [ ] Set all environment variables
- [ ] Configure MongoDB Atlas IP whitelist
- [ ] Update Discord OAuth redirect URLs
- [ ] Set `NEXTAUTH_URL` to production URL
- [ ] Set `BOT_SERVER_URL` to production bot URL
- [ ] Enable MongoDB Atlas monitoring
- [ ] Set up error tracking (optional)
- [ ] Configure domain name (optional)
- [ ] Test all features in production
- [ ] Monitor logs for errors

---

## ⚡ Performance & Scalability

### Current Optimizations

#### Bot (Go)

- **Connection Pooling**: Configurable min/max pool sizes
- **Rate Limiting**: Automatic Discord API rate limit handling with retry
- **Goroutine Management**: Controlled concurrency for background tasks
- **Memory Efficiency**: Optimized for 500MB RAM environments
- **Auto-Close Worker**: Processes max 1000 tickets per 5-minute cycle

#### Dashboard (Next.js)

- **React Query**: Automatic caching and background revalidation
- **Code Splitting**: Automatic with Next.js App Router
- **Image Optimization**: Next.js Image component (when using images)
- **API Route Caching**: Conditional caching based on data mutability
- **Serverless Functions**: Scales automatically on Vercel

### Performance Metrics

- **Bot Response Time**: < 100ms for button interactions
- **API Response Time**: < 200ms (p95)
- **Dashboard Load Time**: < 2s (FCP)
- **Memory Usage (Bot)**: ~50-100MB idle, ~200MB under load
- **Database Queries**: < 50ms with proper indexes

### Scaling Recommendations

#### Small Servers (< 1,000 users)

- Single bot instance
- MongoDB Atlas M0 (free tier)
- Vercel free tier for dashboard

#### Medium Servers (1,000 - 10,000 users)

- Single bot instance with increased resources
- MongoDB Atlas M2/M5
- Vercel Pro for dashboard

#### Large Servers (> 10,000 users)

- Consider horizontal scaling (sharding)
- MongoDB Atlas M10+ with replica sets
- Implement Redis for session caching
- Consider CDN for static assets

---

## 🔒 Security

### Implemented Security Measures

- ✅ **Environment Variables**: Sensitive data never hardcoded
- ✅ **API Key Authentication**: Secure bot API with random keys
- ✅ **JWT Sessions**: Secure HTTP-only cookies for auth
- ✅ **Discord OAuth**: Official OAuth 2.0 flow
- ✅ **Input Validation**: Server-side validation for all inputs
- ✅ **Rate Limiting**: Discord API rate limit handling
- ✅ **HTTPS**: Recommended for production (via deployment platform)
- ✅ **Database Indexes**: Optimized queries prevent DoS

### Security Best Practices

1. **Never commit `.env` files** - Use `.gitignore`
2. **Rotate API keys regularly** - Update `BOT_API_KEY` periodically
3. **Use strong secrets** - Generate with `openssl rand -hex 32`
4. **Restrict MongoDB access** - Use IP whitelist in production
5. **Monitor logs** - Watch for suspicious activity
6. **Keep dependencies updated** - Run `go get -u` and `npm update`
7. **Validate user permissions** - Check Discord roles/permissions
8. **Sanitize user input** - Never trust user-provided data

### Known Considerations

See [CODE_REVIEW_REPORT.md](./CODE_REVIEW_REPORT.md) for a comprehensive security audit with 30+ identified items and remediation steps.

**Critical**: Issue #30 - Add guild membership validation to API routes to prevent unauthorized access.

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

Built with these amazing open-source projects:

- [DiscordGo](https://github.com/bwmarrin/discordgo) - Discord API library for Go
- [Next.js](https://nextjs.org/) - React framework
- [MongoDB](https://www.mongodb.com/) - Database
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [TanStack Query](https://tanstack.com/query) - Data fetching
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Radix UI](https://www.radix-ui.com/) - UI primitives

---

## 📞 Contact

**Developer**: Sush1sui

- **GitHub**: [@Sush1sui](https://github.com/Sush1sui)
- **Project Link**: [FNS Tickets](https://github.com/Sush1sui/fns-tickets)

### Getting Help

- **Documentation**: This README and [QUICKSTART.md](QUICKSTART.md) cover setup and configuration
- **Code Review**: See [CODE_REVIEW_REPORT.md](./CODE_REVIEW_REPORT.md) for architecture analysis
- **Architecture**: Check [ARCHITECTURE.md](ARCHITECTURE.md) for technical deep dive

### Common Issues

#### Bot not responding in Discord

- Check bot is online
- Verify bot token is correct
- Ensure bot has necessary permissions
- Check bot has proper gateway intents enabled

#### Dashboard can't connect to bot

- Verify `BOT_SERVER_URL` is correct
- Check `BOT_API_KEY` matches in both .env files
- Ensure bot HTTP server is running on correct port
- Confirm `ENCRYPTION_KEY` is set in dashboard .env.local

#### Database connection errors

- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas IP whitelist
- Ensure database name matches in both configs

#### OAuth redirect issues

- Verify `NEXTAUTH_URL` matches your domain
- Check Discord OAuth redirect URL is configured
- Ensure `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET` are correct

---

## 🗺 Roadmap

### Potential Features

- Analytics dashboard with charts and metrics
- Ticket templates with pre-filled questions
- Multi-language support
- Webhook integrations (Slack, etc.)
- Advanced role-based permissions
- Ticket tags and categories
- Custom fields for tickets
- Email notifications
- Ticket export (PDF, HTML)
- Voice channel ticket support

---

## 📊 Screenshots

### Dashboard

![Dashboard Home](docs/screenshots/dashboard-home.png)
_Server selection and overview_

### Panel Creator

![Panel Creator](docs/screenshots/panel-creator.png)
_Intuitive panel creation with live preview_

### Transcript Viewer

![Transcript Viewer](docs/screenshots/transcript-viewer.png)
_Browse and search all ticket conversations_

### Discord Integration

![Discord Panel](docs/screenshots/discord-panel.png)
_Beautiful ticket panels in Discord_

> **Note**: Screenshots available in `docs/screenshots/` directory.

---

<div align="center">

**Built by [Sush1sui](https://github.com/Sush1sui)**

_Personal portfolio project demonstrating full-stack development capabilities_

</div>
