# Socket.IO Chat Server

Real-time chat server using Socket.IO, Express, and Supabase for the Kirods Hosting Knowledge Base.

## Features

- ✅ **Real-time messaging** with Socket.IO WebSockets
- ✅ **Typing indicators** with automatic timeout
- ✅ **User presence** tracking (online/offline status)
- ✅ **Read receipts** for message delivery confirmation
- ✅ **Session management** with admin controls
- ✅ **Database persistence** via Supabase
- ✅ **Error handling** and reconnection logic
- ✅ **CORS support** for frontend integration

## Setup Instructions

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Environment Configuration

Create a `.env` file in the server directory:

```bash
cp .env.example .env
```

Update the `.env` file with your Supabase credentials:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PORT=3001
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### 3. Start the Server

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

### 4. Frontend Integration

Add the Socket.IO server URL to your frontend environment:

```env
VITE_SOCKET_SERVER_URL=http://localhost:3001
```

## API Events

### Client to Server Events

- `join-session` - Join a chat session
- `send-message` - Send a message
- `start-typing` - Start typing indicator
- `stop-typing` - Stop typing indicator
- `mark-messages-read` - Mark messages as read
- `update-session-status` - Update session status (admin only)

### Server to Client Events

- `receive-message` - New message received
- `user-typing` - User started typing
- `user-stopped-typing` - User stopped typing
- `user-joined` - User joined session
- `user-left` - User left session
- `session-users` - List of users in session
- `messages-read` - Messages marked as read
- `session-status-updated` - Session status changed
- `error` - Error occurred

## Health Check

The server provides a health check endpoint:

```
GET http://localhost:3001/health
```

Response:
```json
{
  "status": "ok",
  "connectedUsers": 5,
  "activeSessions": 3,
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure proper CORS origins
3. Use a process manager like PM2
4. Set up SSL/TLS termination
5. Configure load balancing if needed

## Architecture

```
Frontend (React + Socket.IO Client)
    ↕ WebSocket Connection
Socket.IO Server (Node.js + Express)
    ↕ Database Operations
Supabase (PostgreSQL + Realtime)
```

The server acts as a WebSocket gateway while maintaining data persistence in Supabase.