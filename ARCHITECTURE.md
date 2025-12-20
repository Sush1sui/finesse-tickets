# 🏗️ Architecture Documentation

## System Overview

FNS Tickets is a distributed system consisting of three main components:

1. **Discord Bot (Go)** - Handles Discord interactions and business logic
2. **Dashboard (Next.js)** - Provides administrative interface and APIs
3. **MongoDB** - Centralized data store for both bot and dashboard

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Discord Users                            │
└────────────┬───────────────────────────────────┬────────────────┘
             │                                   │
             │ Button Clicks                     │ Web Browser
             │ Message Events                    │
             ▼                                   ▼
┌─────────────────────────────┐  ┌──────────────────────────────┐
│      Discord API            │  │   Dashboard (Next.js)        │
│   (WebSocket Gateway)       │  │   - React 19 UI              │
└────────────┬────────────────┘  │   - NextAuth OAuth           │
             │                    │   - API Routes               │
             │ Events             │   - Mongoose ORM             │
             ▼                    └──────────┬───────────────────┘
┌─────────────────────────────┐             │
│   Go Discord Bot            │             │ HTTP API
│   - DiscordGo Client        │◄────────────┤ (Panel Deploy)
│   - Event Handlers          │             │
│   - Button Interactions     │             │
│   - Message Tracking        │             │
│   - Auto-Close Worker       │             │
│   - HTTP API Server         │             │
└────────────┬────────────────┘             │
             │                              │
             │ MongoDB Driver               │ Mongoose
             ▼                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       MongoDB Atlas                              │
│   Collections: servers, panels, tickets, transcripts            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### 1. Discord Bot (Go)

```
┌────────────────────────────────────────────────────────────┐
│                         Bot Entry                          │
│                    cmd/fns-tickets/                        │
│                        main.go                             │
└─────────────────┬──────────────────────────────────────────┘
                  │
                  ├─► HTTP Server (Port 7694)
                  ├─► Discord Session
                  ├─► Auto-Close Worker (Background)
                  └─► Ping Server Loop (Background)

┌─────────────────────────────────────────────────────────────┐
│                      Bot Core Logic                         │
│                    internal/bot/                            │
├─────────────────────────────────────────────────────────────┤
│  bot.go           - Session initialization                  │
│  autoclose.go     - Background ticker for inactive tickets  │
│  ratelimit.go     - Discord API rate limit handler          │
│                                                             │
│  commands/        - Slash command handlers                  │
│  events/          - Event handlers                          │
│    ├─ buttonInteraction.go  - Open/close ticket logic      │
│    └─ messageTracking.go    - Track messages for transcripts│
│  deploy/          - Register commands and events            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Repository Layer                         │
│                  internal/repository/                       │
├─────────────────────────────────────────────────────────────┤
│  guild.go         - Server config CRUD                      │
│  user_tickets.go  - Ticket CRUD operations                  │
│  transcripts.go   - Transcript CRUD operations              │
│  indexes.go       - Database index management               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      HTTP API Server                        │
│                   internal/server/                          │
├─────────────────────────────────────────────────────────────┤
│  routes/          - Route registration                      │
│  handlers/        - API endpoint handlers                   │
│    ├─ sendPanel.go       - Deploy single panel             │
│    ├─ sendMultiPanel.go  - Deploy multi-panel              │
│    ├─ servers.go         - Fetch server data               │
│    ├─ channels.go        - Fetch channels                  │
│    ├─ roles.go           - Fetch roles                     │
│    ├─ categories.go      - Fetch categories                │
│    ├─ emojis.go          - Fetch custom emojis             │
│    └─ members.go         - Fetch server members            │
└─────────────────────────────────────────────────────────────┘
```

#### Key Design Patterns

**Repository Pattern**: Separates data access logic from business logic

- Benefits: Testable, maintainable, swappable data sources
- Location: `internal/repository/`

**Event-Driven Architecture**: Bot responds to Discord events

- Events: Button clicks, message creates, guild joins
- Location: `internal/bot/events/`

**Background Workers**: Async processing for non-critical tasks

- Auto-close worker: Checks inactive tickets every 5 minutes
- Ping server: Keeps bot alive on free hosting
- Location: `internal/bot/autoclose.go`, `internal/common/pingServer.go`

---

### 2. Dashboard (Next.js)

```
┌─────────────────────────────────────────────────────────────┐
│                      App Router                             │
│                    app/ directory                           │
├─────────────────────────────────────────────────────────────┤
│  layout.tsx       - Root layout with providers             │
│  page.tsx         - Landing page                            │
│                                                             │
│  home/            - Public home page                        │
│  dashboard/       - Protected routes (auth required)        │
│    ├─ page.tsx                 - Server selector           │
│    └─ guild/[guildId]/                                     │
│         ├─ page.tsx            - Guild overview            │
│         ├─ panels/             - Panel management          │
│         ├─ settings/           - Server settings           │
│         ├─ staff/              - Staff configuration       │
│         └─ transcripts/        - Transcript viewer         │
│                                                             │
│  api/             - Backend API routes                      │
│    ├─ auth/                    - NextAuth endpoints        │
│    ├─ dashboard/guild/[guildId]/                           │
│    │    ├─ panels/             - Panel CRUD                │
│    │    ├─ transcripts/        - Transcript queries        │
│    │    ├─ data/               - Server data               │
│    │    └─ settings/           - Settings update           │
│    └─ panels/[panelId]/        - Public panel API          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     Components                              │
│                  components/                                │
├─────────────────────────────────────────────────────────────┤
│  ui/              - Reusable UI components                  │
│    ├─ button.tsx                                           │
│    ├─ dropdown-menu.tsx                                    │
│    ├─ spinner.tsx                                          │
│    ├─ toast.tsx           - Toast notifications            │
│    └─ confirm-dialog.tsx  - Confirmation modals            │
│                                                             │
│  layout/          - Layout components                       │
│    ├─ header.tsx          - Top navigation                 │
│    ├─ footer.tsx          - Footer                         │
│    └─ layout-shell.tsx    - Page wrapper                   │
│                                                             │
│  providers/       - React Context providers                 │
│    ├─ query-provider.tsx  - React Query setup              │
│    └─ session-provider.tsx - NextAuth wrapper              │
│                                                             │
│  emoji-picker.tsx - Custom emoji selector                   │
│  guild-sidebar.tsx - Server navigation                      │
│  server-card.tsx  - Server card component                   │
│  mode-toggle.tsx  - Dark/light mode toggle                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   State Management                          │
│                    hooks/ & context/                        │
├─────────────────────────────────────────────────────────────┤
│  useGuildQueries.ts  - React Query hooks for server data   │
│  useToast.ts         - Toast notification hook             │
│  AuthContext.tsx     - Authentication context              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   Data Layer                                │
│                   lib/ & models/                            │
├─────────────────────────────────────────────────────────────┤
│  auth.ts          - NextAuth configuration                  │
│  db.ts            - MongoDB connection (cached)             │
│  discord.ts       - Discord API helpers                     │
│  utils.ts         - Utility functions                       │
│  middleware.ts    - API middleware                          │
│  rateLimit.ts     - Rate limiting logic                     │
│  encryption.ts    - Crypto utilities                        │
│                                                             │
│  Panel.ts         - Panel Mongoose schema                   │
│  Server.ts        - Server Mongoose schema                  │
│  Transcript.ts    - Transcript Mongoose schema              │
│  User.ts          - User Mongoose schema                    │
└─────────────────────────────────────────────────────────────┘
```

#### Key Design Patterns

**Server Components**: Default for pages, client components marked with "use client"

- Benefits: Better performance, smaller bundles, SEO
- Location: All `page.tsx` files

**React Query**: Server state management and caching

- Benefits: Automatic refetching, optimistic updates, cache invalidation
- Location: `hooks/useGuildQueries.ts`

**Middleware Pattern**: Request interception and authentication

- Location: `middleware.ts` (root level)

**Repository Pattern (Mongoose Models)**: Data schemas and queries

- Location: `models/`

---

### 3. Data Flow Patterns

#### Ticket Creation Flow

```
User clicks button in Discord
    │
    ▼
Discord sends interaction event
    │
    ▼
Bot receives event (buttonInteraction.go)
    │
    ├─► Validate user permissions
    ├─► Check ticket limit
    ├─► Fetch panel data from Next.js API
    │       │
    │       └─► HTTP GET /api/panels/{panelId}
    │                │
    │                └─► Next.js returns panel config
    │
    ├─► Create Discord channel with permissions
    ├─► Save ticket to MongoDB (repository layer)
    ├─► Create transcript (if enabled)
    └─► Send welcome message with close button
```

#### Panel Deployment Flow

```
Admin creates panel in dashboard
    │
    ▼
Dashboard saves panel to MongoDB
    │
    ▼
Admin clicks "Send Panel"
    │
    ▼
Dashboard sends HTTP request to bot
    │
    └─► POST http://localhost:7694/api/send-panel
             │
             ▼
        Bot API receives request
             │
             ├─► Validate API key
             ├─► Create Discord embed
             ├─► Add button component
             └─► Send to specified channel
```

#### Transcript Creation Flow

```
Ticket opened in Discord
    │
    ▼
Bot checks if transcript channel configured
    │
    ├─► If no: Skip transcript
    └─► If yes: Create empty transcript in MongoDB

Messages sent in ticket channel
    │
    ▼
Bot tracks each message (messageTracking.go)
    │
    └─► Add message to transcript with metadata

Ticket closed
    │
    ▼
Bot finalizes transcript
    │
    ├─► Fetch all remaining messages
    ├─► Calculate metadata (participants, counts)
    ├─► Save to MongoDB
    └─► Send summary embed to transcript channel

User views in dashboard
    │
    └─► Next.js fetches from MongoDB and renders
```

---

## Database Design

### Schema Overview

```
MongoDB Cluster
├─ Database: "test" (or production name)
│   ├─ Collection: servers
│   │   └─ Documents: Server configurations
│   │       ├─ serverId (indexed)
│   │       ├─ ticketConfig
│   │       │   ├─ ticketNameStyle
│   │       │   ├─ maxTicketsPerUser
│   │       │   ├─ ticketTranscript (channel ID)
│   │       │   ├─ ticketPermissions
│   │       │   └─ autoClose settings
│   │       └─ timestamps
│   │
│   ├─ Collection: panels
│   │   └─ Documents: Ticket panel configurations
│   │       ├─ guild (indexed)
│   │       ├─ channel
│   │       ├─ title, content, color
│   │       ├─ button config
│   │       ├─ welcomeEmbed
│   │       └─ timestamps
│   │
│   ├─ Collection: tickets
│   │   └─ Documents: Active and closed tickets
│   │       ├─ guildId, channelId (indexed)
│   │       ├─ userId, panelId
│   │       ├─ createdAt, lastMessageAt
│   │       ├─ closed (indexed)
│   │       └─ compound indexes for queries
│   │
│   └─ Collection: transcripts
│       └─ Documents: Full ticket conversations
│           ├─ ticketId (indexed)
│           ├─ guildId, channelId (indexed)
│           ├─ userId, username
│           ├─ messages[] (array of message objects)
│           ├─ metadata (computed stats)
│           └─ timestamps
```

### Index Strategy

**Critical Indexes**:

- `servers.serverId` - Lookup by Discord server ID (unique)
- `tickets.{guildId, userId, closed}` - Find user's active tickets
- `tickets.channelId` - Lookup ticket by Discord channel
- `transcripts.ticketId` - Fetch transcript for ticket
- `panels.guild` - List panels for a server

**Query Optimization**:

- Compound indexes for common query patterns
- TTL indexes for automatic cleanup (future)
- Covered queries where possible (projection matches index)

---

## Security Architecture

### Authentication & Authorization

```
┌─────────────────────────────────────────────────────────────┐
│                  Authentication Flow                        │
├─────────────────────────────────────────────────────────────┤
│  User → Login Button                                        │
│    │                                                         │
│    ▼                                                         │
│  Next.js → Redirect to Discord OAuth                        │
│    │                                                         │
│    ▼                                                         │
│  Discord → User authorizes → Callback                       │
│    │                                                         │
│    ▼                                                         │
│  NextAuth → Exchange code for token                         │
│    │                                                         │
│    ├─► Fetch user profile from Discord                     │
│    ├─► Create/update user in database                      │
│    └─► Issue JWT session cookie (HTTP-only, secure)        │
│                                                             │
│  Subsequent requests:                                       │
│    └─► Session verified via JWT                            │
│         └─► User data available in request context         │
└─────────────────────────────────────────────────────────────┘
```

### API Security

**Bot API**:

- Bearer token authentication (`Authorization: Bearer {API_KEY}`)
- API key stored in environment variables
- No CORS (internal communication only)

**Dashboard API**:

- Session-based authentication via NextAuth
- JWT tokens in HTTP-only cookies
- CSRF protection via NextAuth
- Rate limiting (future enhancement)

### Data Security

- **Encryption at Rest**: MongoDB Atlas default encryption
- **Encryption in Transit**: TLS/SSL for all connections
- **Secret Management**: Environment variables, never committed
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection**: N/A (NoSQL database with parameterized queries)
- **XSS Protection**: React auto-escapes by default

---

## Performance Considerations

### Bot Performance

**Connection Pooling**:

```go
MaxPoolSize: 20      // Max 20 connections
MinPoolSize: 2       // Keep 2 warm
MaxConnIdleTime: 30s // Close idle after 30s
```

**Rate Limiting**:

- Automatic Discord API rate limit detection
- Exponential backoff with retry
- Max 3 retries before failing

**Memory Optimization**:

- Lightweight Go runtime (~50MB idle)
- Efficient string handling
- Lazy loading of large objects

### Dashboard Performance

**React Query Caching**:

- Automatic background refetching
- Stale-while-revalidate pattern
- Cache invalidation on mutations

**Code Splitting**:

- Automatic with Next.js App Router
- Dynamic imports for large components
- Smaller initial bundle size

**Database Query Optimization**:

- Proper indexing for all queries
- Projection to limit returned fields
- Pagination for large datasets

---

## Scalability

### Current Capacity

- **Small Servers** (< 1,000 users): Single bot instance, free MongoDB
- **Medium Servers** (1,000-10,000 users): Single bot instance, paid MongoDB
- **Large Servers** (> 10,000 users): Consider horizontal scaling

### Scaling Strategy

**Horizontal Scaling** (Future):

- Multiple bot instances with load balancer
- Discord sharding for large guilds
- Redis for distributed caching
- Message queue for async processing

**Database Scaling**:

- MongoDB replica sets for high availability
- Read replicas for dashboard queries
- Sharding by guild ID for very large deployments

**Serverless Dashboard**:

- Vercel automatically scales Next.js functions
- Each API route is a separate serverless function
- Cold start optimization with minimal imports

---

## Deployment Architecture

### Development

```
Local Machine
├─ Bot (localhost:7694)
├─ Dashboard (localhost:3000)
└─ MongoDB (Atlas M0 free tier)
```

### Production

```
Cloud Infrastructure
├─ Bot
│   ├─ Railway / Fly.io / Docker
│   ├─ Environment variables injected
│   └─ Always-on process
│
├─ Dashboard
│   ├─ Vercel (recommended)
│   ├─ Serverless functions
│   └─ Edge network CDN
│
└─ Database
    ├─ MongoDB Atlas (M2/M5/M10)
    ├─ Replica sets
    └─ Automatic backups
```

---

## Monitoring & Observability

### Logging

**Bot Logging**:

```go
log.Printf("Info: %s", message)      // Info level
log.Printf("Error: %v", err)         // Error level
log.Printf("DEBUG: %+v", struct)     // Debug level
```

**Dashboard Logging**:

```typescript
console.log("Info:", data); // Development only
console.error("Error:", error); // Production safe
```

### Metrics to Monitor

- **Bot**: Goroutine count, memory usage, API latency
- **Dashboard**: API response times, error rates, user sessions
- **Database**: Connection pool utilization, query times, document counts

### Health Checks

```
Bot:      /health or ping endpoint (future)
Dashboard: /api/health (future)
Database: MongoDB Atlas monitoring
```

---

## Future Architecture Improvements

### Planned Enhancements

1. **Microservices**: Split bot into smaller services (commands, events, workers)
2. **Message Queue**: Use Redis or RabbitMQ for async tasks
3. **CDN**: Serve static assets from edge locations
4. **Caching Layer**: Redis for session and query caching
5. **Analytics Pipeline**: Track metrics and user behavior
6. **WebSocket**: Real-time dashboard updates
7. **GraphQL**: Unified API with better querying
8. **Containerization**: Docker Compose for local dev

---

## References

- [Go Best Practices](https://golang.org/doc/effective_go)
- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Schema Design](https://docs.mongodb.com/manual/core/data-modeling-introduction/)
- [Discord API Documentation](https://discord.com/developers/docs)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
