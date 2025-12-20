# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Comprehensive transcript system with message capture, metadata, and dashboard viewer
- Real-time transcript creation on ticket open (when transcript channel configured)
- Transcript finalization on ticket close with participant tracking and statistics
- Search and filter functionality for transcripts (by ticket ID, user, panel, username)
- Individual transcript viewer with full message history
- React key optimization for transcript messages
- Database indexes for optimized transcript queries
- Code review report identifying 30+ issues and optimization opportunities

### Fixed

- Database name mismatch between bot and Next.js app (now using "test" database)
- TicketTranscript field handling for nullable values (changed to pointer type)
- Ticket ID assignment after MongoDB insert (properly sets InsertedID)
- UI displaying "Ticket #" instead of "Ticket ID" in transcript list
- Search functionality for ticket IDs in transcript viewer
- Duplicate React key error in transcript message list

### Changed

- Updated transcript list UI to show ticketId instead of ticketNumber
- Improved transcript API to query by ticketId field
- Enhanced guild configuration retrieval with debug logging

## [1.0.0] - 2025-12-20

### Added

- Initial release of FNS Tickets
- Discord bot with ticket management system
- Next.js dashboard with Discord OAuth authentication
- Panel creation and customization (embeds, colors, emojis, buttons)
- Multi-panel support with dropdown select menus
- Ticket permissions control (attachments, links, reactions)
- Max tickets per user limit
- Auto-close system based on inactivity
- Rate limiting for Discord API calls
- MongoDB integration with connection pooling
- Server settings configuration
- Staff role management
- Channel, role, category, and emoji fetchers
- Welcome message customization with embeds
- Role mentions on ticket open
- Comprehensive error handling and logging

### Security

- API key authentication for bot HTTP server
- NextAuth.js with Discord OAuth
- JWT session management with HTTP-only cookies
- Environment variable configuration
- Input validation on all endpoints

---

## Release Notes Format

### Version Number

Use [Semantic Versioning](https://semver.org/):

- **MAJOR** version when you make incompatible API changes
- **MINOR** version when you add functionality in a backwards compatible manner
- **PATCH** version when you make backwards compatible bug fixes

### Categories

- **Added** for new features
- **Changed** for changes in existing functionality
- **Deprecated** for soon-to-be removed features
- **Removed** for now removed features
- **Fixed** for any bug fixes
- **Security** for vulnerability fixes

### Example Entry

```markdown
## [1.2.0] - 2025-01-15

### Added

- Analytics dashboard with ticket metrics ([#123](https://github.com/user/repo/pull/123))
- Export transcripts to PDF feature

### Fixed

- Memory leak in toast component ([#130](https://github.com/user/repo/issues/130))
- Race condition in auto-close worker

### Security

- Add guild membership validation to API routes ([#135](https://github.com/user/repo/pull/135))
```
