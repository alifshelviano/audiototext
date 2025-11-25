# LISN - AI-Powered Meeting Documentation System

[![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.20.0-green)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8.1-black)](https://socket.io/)

## 📖 Project Overview

**LISN** is a comprehensive AI-powered meeting documentation system that transforms conversations into actionable insights. It leverages AI to provide real-time transcription, generate concise summaries, and offer deep insights into meeting dynamics.

---

## 🎯 Goal

The primary goal of LISN is to automate meeting documentation and analysis, allowing participants to focus on the discussion rather than on note-taking. By providing actionable summaries and helps teams improve their meeting quality over time.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [Key Features Deep Dive](#-key-features-deep-dive)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🎙️ Core Meeting Features

- **Real-time Audio Transcription** - Powered by OpenAI Whisper with multi-language support
- **AI-Powered Meeting Analysis** - Automatic summarization using Google Gemini 2.0 Flash
- **Live Collaboration** - Real-time updates via Socket.IO
- **Public & Private Meetings** - Flexible access control with passkey protection
- **Multi-language Support** - English, Indonesian, and Korean

### 🤖 AI Intelligence

- **Smart Summarization** - Automatic extraction of key points, decisions, and action items
- **Sentiment Analysis** - Real-time emotion tracking with HuggingFace modernBERT
- **Meeting Health Scores** - Engagement, productivity, collaboration, and clarity metrics
- **Interactive AI Chat** - Ask questions about meeting content using context-aware AI
- **Action Item Detection** - Automatic identification and assignment tracking

### 📊 Documentation & Export

- **Professional PDF Export** - Comprehensive meeting documentation
- **Word Document Export** - Editable format for further customization
- **Email Distribution** - Automated summary delivery to participants
- **QR Code Sharing** - Easy meeting access via QR codes

### 🔔 Notifications & Collaboration

- **Real-time Notifications** - Action items, email, and updates
- **Participant Management** - Track attendees and contributions
- **Activity Dashboard** - Overview of meetings and statistics
- **Browser Notifications** - Stay updated even when not actively viewing

### 🎨 User Experience

- **Modern UI** - Built with Tailwind CSS and shadcn/ui components
- **Responsive Design** - Optimized for desktop, tablet, and mobile
- **Accessibility** - WCAG compliant interface elements

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 15.3.3 with App Router
- **UI Library**: React 18.3.1
- **Styling**: Tailwind CSS 3.4.1
- **Component Library**: Radix UI + shadcn/ui
- **State Management**: React Hooks + Context API
- **Real-time**: Socket.IO Client 4.8.1
- **Forms**: React Hook Form + Zod validation
- **Animations**: Framer Motion 12.23.24

### Backend

- **Runtime**: Node.js with TypeScript
- **Server**: Custom Next.js server with Socket.IO
- **Database**: MongoDB 6.20.0
- **Authentication**: NextAuth.js 4.24.11 (Google OAuth + Credentials)
- **API**: RESTful endpoints + Real-time WebSocket

### AI & ML

- **LLM**: Google Gemini 2.0 Flash (via Genkit)
- **Transcription**: OpenAI Whisper Large v3
- **Sentiment Analysis**: HuggingFace modernBERT-base-multilingual
- **Orchestration**: Firebase Genkit 1.20.0

### Infrastructure

- **Email**: Nodemailer 7.0.10 with SMTP
- **File Processing**: HTML2PDF.js, jsPDF
- **Document Generation**: Custom PDF/Word exporters
- **Storage**: MongoDB GridFS (optional for file uploads)

---

## 🏗️ Architecture

### Data Flow

1. **Meeting Creation**

   ```
   User → Next.js API → MongoDB → Socket.IO → Real-time Update
   ```

2. **Transcription Flow**

   ```
   Audio Input → Whisper API → Transcript → MongoDB → AI Analysis
   ```

3. **AI Analysis Pipeline**

   ```
   Transcripts → Gemini 2.0 → Structured Summary → Sentiment Analysis → MongoDB
   ```

4. **Notification System**
   ```
   Event Trigger → Notification Service → MongoDB + Socket.IO → User Device
   ```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: 18.x or higher
- **npm** or **yarn**: Latest version
- **MongoDB**: 6.0 or higher (local or Atlas)
- **API Keys**: Google AI, OpenAI/Elice, HuggingFace
- **SMTP Server**: For email functionality

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/alifshelviano/audiototext.git
   cd lisn
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env.local
   ```

   See [Environment Variables](#-environment-variables) section for details.

4. **Run database migrations** (if applicable)

   ```bash
   npm run db:migrate
   ```

5. **Start development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:9002
   ```

### Running Genkit Development Server (Optional)

For AI flow development and testing:

```bash
npm run genkit:dev
```

Access Genkit UI at `http://localhost:4000`

---

## 🔐 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Core Configuration

```env
# Application
NODE_ENV=development
NEXTAUTH_URL=http://localhost:9002
NEXTAUTH_SECRET=your-nextauth-secret-key-here
FRONTEND_URL=http://localhost:9002

# Server
PORT=9002
```

### Database

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/lisn
# Or MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lisn
```

### Authentication

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### AI Services

```env
# Google AI (Gemini)
GOOGLE_GENAI_API_KEY=your-google-ai-api-key

# Elice/OpenAI Whisper API
ELICE_API_KEY=your-elice-api-key

# HuggingFace (Sentiment Analysis)
HF_TOKEN=your-huggingface-token

# ML API/OpenAI ChatGPT API (Chat Feature)
ML_API_BASE=your-ml-api-base-url
ML_API_KEY=your-ml-api-key
```

### Email Configuration

```env
# SMTP Settings
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password
SMTP_FROM="LISN <noreply@lisn.com>"
```

### Optional Services

```env
# Socket.IO
NEXT_PUBLIC_SOCKET_URL=http://localhost:9002

# ElevenLabs (Alternative Transcription)
ELEVENLABS_API_KEY=your-elevenlabs-key
```

### Security Notes

- Never commit `.env.local` to version control
- Use strong, unique secrets for `NEXTAUTH_SECRET`
- For production, use environment-specific configuration
- Rotate API keys regularly

---

## 📁 Project Structure

```
lisn/
├── src/
│   ├── ai/                          # AI/ML Integration
│   │   ├── flows/                   # Genkit AI flows
│   │   │   ├── summarize-transcribed-text.ts
│   │   │   ├── transcribe-audio-openai.ts
│   │   │   └── transcribe-audio-eleven-labs.ts
│   │   ├── models/                  # ML models & utilities
│   │   │   └── sentiment-analysis.ts
│   │   ├── genkit.ts               # Genkit configuration
│   │   └── dev.ts                  # Development exports
│   │
│   ├── app/                         # Next.js App Router
│   │   ├── api/                     # API Routes
│   │   │   ├── auth/               # Authentication endpoints
│   │   │   ├── chat/               # AI chat endpoints
│   │   │   ├── meetings/           # Meeting CRUD operations
│   │   │   ├── notifications/      # Notification system
│   │   │   └── users/              # User management
│   │   │
│   │   ├── auth/                    # Auth pages
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── reset-password/
│   │   │
│   │   ├── dashboard/               # Dashboard pages
│   │   │   ├── history/            # Meeting history
│   │   │   ├── public-meetings/    # Public meetings list
│   │   │   ├── profile/            # User profile
│   │   │   └── settings/           # User settings
│   │   │
│   │   ├── meeting/                 # Meeting pages
│   │   │   ├── [meetingId]/
│   │   │   │   └── join/           # Join meeting page
│   │   │   └── create-meetings/    # Create meeting page
│   │   │
│   │   ├── notifications/           # Notifications page
│   │   ├── providers/              # Context providers
│   │   ├── globals.css             # Global styles
│   │   ├── layout.tsx              # Root layout
│   │   └── page.tsx                # Landing page
│   │
│   ├── components/                  # React Components
│   │   ├── app/                    # Feature components
│   │   │   ├── create-meeting/
│   │   │   ├── landing/
│   │   │   ├── meeting/
│   │   │   ├── notifications/
│   │   │   └── recording/
│   │   ├── layout/                 # Layout components
│   │   │   ├── dashboard-layout.tsx
│   │   │   ├── header.tsx
│   │   │   └── sidebar.tsx
│   │   └── ui/                     # shadcn/ui components
│   │
│   ├── hooks/                       # Custom React Hooks
│   │   ├── use-media-query.ts
│   │   ├── use-meeting-data.ts
│   │   ├── use-mobile.ts
│   │   ├── use-notifications.ts
│   │   ├── use-socket.ts
│   │   └── use-toast.ts
│   │
│   ├── lib/                         # Library & Utilities
│   │   ├── auth/                   # Authentication
│   │   │   └── auth.ts
│   │   ├── database/               # Database connection
│   │   │   └── mongodb.ts
│   │   ├── services/               # Business logic
│   │   │   ├── email-service.ts
│   │   │   ├── export-service.ts
│   │   │   ├── meeting-analysis.ts
│   │   │   ├── meeting-service.ts
│   │   │   └── notification-service.ts
│   │   ├── utils/                  # Utility functions
│   │   │   ├── pdf-optimizer.ts
│   │   │   └── utils.ts
│   │   └── socket.ts               # Socket.IO instance
│   │
│   └── types/                       # TypeScript Types
│       ├── models/
│       │   ├── Meeting.ts
│       │   └── User.ts
│       └── next-auth.d.ts
│
├── public/                          # Static Assets
│   ├── logo.png
│   ├── lisnize.png
│   └── notification-sound.mp3
│
├── server.ts                        # Custom Next.js + Socket.IO server
├── next.config.js                   # Next.js configuration
├── tailwind.config.js               # Tailwind CSS configuration
├── tsconfig.json                    # TypeScript configuration
└── package.json                     # Dependencies & scripts
```

### Key Directories Explained

- **`src/ai/`**: AI/ML integration layer with Genkit flows for transcription and summarization
- **`src/app/api/`**: Next.js API routes for backend functionality
- **`src/components/`**: Reusable React components organized by feature
- **`src/hooks/`**: Custom React hooks for shared logic
- **`src/lib/services/`**: Business logic and external service integrations
- **`src/types/`**: TypeScript type definitions and interfaces
- **`server.ts`**: Custom server combining Next.js with Socket.IO

---

## 🔍 Key Features Deep Dive

### 1. Real-Time Transcription

**Flow**: Audio → Whisper API → Transcript → Real-time Update

```typescript
// Example: Recording and transcribing
const { startRecording, stopRecording } = useRecordingControls();

// Start recording
await startRecording(meetingId, userName);

// Stop and transcribe
const { transcript } = await stopRecording();
// Automatic transcription via OpenAI Whisper
```

**Features**:

- Multi-language support (English, Indonesian, Korean)
- Chunked processing for long recordings
- Real-time transcript streaming
- Speaker identification

### 2. AI-Powered Analysis

**Models Used**:

- **Gemini 2.0 Flash**: Meeting summarization
- **modernBERT**: Sentiment analysis
- **Custom ML**: Health score calculation

```typescript
// Automatic analysis trigger
const result = await analyzeMeeting(meetingId);
// Returns:
// - Key points
// - Action items
// - Insights & decisions
// - Sentiment analysis
// - Meeting health score
```

**Analysis Output Structure**:

```json
{
  "meeting_summary": {
    "title": "Q4 Planning Meeting",
    "date": "2025-01-15",
    "time": "14:00",
    "participants": ["Alice", "Bob", "Charlie"],
    "key_points": [...],
    "action_items": [
      {
        "task": "Complete budget proposal",
        "assigned_to": "Alice",
        "deadline": "2025-01-20",
        "status": "Not Started"
      }
    ],
    "emotion_analysis": {
      "overall_sentiment": "positive",
      "overall_confidence": 0.85,
      "participant_emotions": [...]
    },
    "meeting_health_score": {
      "overall_score": 78,
      "engagement_score": 82,
      "productivity_score": 75,
      "collaboration_score": 80,
      "clarity_score": 74
    }
  }
}
```

### 3. Sentiment Analysis

**Features**:

- Overall meeting sentiment
- Per-participant emotion tracking
- Emotional highlights
- Tension point detection
- Confidence scoring

**Supported Sentiments**:

- Positive, Negative, Neutral, Mixed
- Emotional tones: Happy, Frustrated, Concerned, Enthusiastic, etc.

### 4. Notification System

**Architecture**:

```
Event → Notification Service → MongoDB + Socket.IO → Client
```

**Notification Types**:

- `email_received`: Summary delivered via email
- `action_item`: New task assignment
- `meeting_summary`: Analysis complete

**Real-time Delivery**:

- Socket.IO for instant updates
- Fallback to database polling
- Browser push notifications
- Email notifications

### 5. Export & Sharing

**PDF Export**:

- Professional document layout
- Comprehensive meeting data
- Optimized file size
- Email-friendly compression

**Email Distribution**:

- Automatic participant notification
- PDF attachment (when size permits)
- HTML formatted email
- Delivery confirmation

**QR Code Sharing**:

- Instant meeting access
- No login required for public meetings
- Embedded in meeting cards

---

## 📡 API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`

Register a new user account.

**Request Body**:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response**:

```json
{
  "message": "User registered successfully",
  "userId": "507f1f77bcf86cd799439011"
}
```

#### POST `/api/auth/forgot-password`

Request password reset email.

**Request Body**:

```json
{
  "email": "john@example.com"
}
```

#### POST `/api/auth/reset-password`

Reset password with token.

**Request Body**:

```json
{
  "token": "reset-token-here",
  "password": "newSecurePassword123"
}
```

---

### Meeting Endpoints

#### POST `/api/meetings`

Create a new meeting.

**Request Body**:

```json
{
  "name": "Q4 Planning",
  "time": "2025-01-15T14:00:00Z",
  "isPublic": true,
  "language": "english"
}
```

**Response**:

```json
{
  "message": "Meeting created successfully",
  "meetingId": "507f1f77bcf86cd799439011",
  "isPublic": true,
  "language": "english",
  "passkey": "ABC123"
}
```

#### GET `/api/meetings`

Get all meetings (filtered by query params).

**Query Parameters**:

- `userId`: Filter by user ID
- `public`: Filter public meetings (`true`/`false`)
- `userOnly`: Get only current user's meetings (`true`/`false`)

#### GET `/api/meetings/find-by-passkey?passkey=ABC123`

Find meeting by passkey.

#### PUT `/api/meetings/[meetingId]`

Update meeting details.

#### DELETE `/api/meetings/[meetingId]`

Delete a meeting.

#### POST `/api/meetings/[meetingId]/send-meeting-summary`

Send meeting summary via email.

**Request Body**:

```json
{
  "recipientEmails": ["alice@example.com", "bob@example.com"],
  "pdfContent": "base64-encoded-pdf-data"
}
```

---

### Notification Endpoints

#### GET `/api/notifications`

Get user notifications.

**Query Parameters**:

- `unreadOnly`: Get only unread notifications (`true`/`false`)

**Response**:

```json
{
  "notifications": [
    {
      "id": "507f1f77bcf86cd799439011",
      "type": "action_item",
      "title": "New Action Item Assigned",
      "message": "You have been assigned: Complete budget proposal",
      "read": false,
      "createdAt": "2025-01-15T14:30:00Z"
    }
  ],
  "unreadCount": 5
}
```

#### POST `/api/notifications/[notificationId]/read`

Mark notification as read.

#### DELETE `/api/notifications/[notificationId]`

Delete a notification.

#### POST `/api/notifications/read-all`

Mark all notifications as read.

#### POST `/api/notifications/send`

Send notification to users (internal use).

---

### User Endpoints

#### GET `/api/users/[userId]`

Get user profile.

#### PUT `/api/users/[userId]`

Update user profile.

**Request Body**:

```json
{
  "name": "John Doe",
  "bio": "Product Manager",
  "location": "San Francisco, CA",
  "website": "https://johndoe.com",
  "company": "Tech Corp"
}
```

#### GET `/api/users/[userId]/stats`

Get user statistics.

**Response**:

```json
{
  "meetingsCreated": 42,
  "transcriptsGenerated": 156,
  "publicMeetings": 30,
  "privateMeetings": 12,
  "analyzedMeetings": 38,
  "totalParticipants": 87,
  "avgParticipants": "2.1"
}
```

#### POST `/api/users/change-password`

Change user password.

---

### Chat Endpoint

#### POST `/api/chat`

Ask questions about meeting content.

**Request Body**:

```json
{
  "prompt": "What were the main action items?",
  "context": "Meeting transcript and summary"
}
```

**Response**:

```json
{
  "response": "The main action items were:\n1. Complete budget proposal (Alice)\n2. Schedule follow-up meeting (Bob)",
  "usage": {
    "prompt_tokens": 150,
    "completion_tokens": 45,
    "total_tokens": 195
  }
}
```

---

## 🌐 Socket.IO Events

### Client → Server

| Event                    | Description              | Payload                           |
| ------------------------ | ------------------------ | --------------------------------- |
| `join-meeting`           | Join meeting room        | `(meetingId, userName)`           |
| `leave-meeting`          | Leave meeting room       | `(meetingId, userName)`           |
| `new-transcript`         | Broadcast new transcript | `{ meetingId, transcript }`       |
| `typing`                 | User is typing           | `{ meetingId, userName }`         |
| `participant-status`     | Update status            | `{ meetingId, userName, status }` |
| `authenticate-user`      | Auth for notifications   | `(userId)`                        |
| `mark-notification-read` | Mark as read             | `{ notificationId, userId }`      |

### Server → Client

| Event               | Description          | Payload                             |
| ------------------- | -------------------- | ----------------------------------- |
| `transcript-added`  | New transcript added | `{ name, transcript, createdAt }`   |
| `user-joined`       | User joined meeting  | `{ socketId, userName, timestamp }` |
| `user-left`         | User left meeting    | `{ socketId, userName, timestamp }` |
| `user-typing`       | User is typing       | `(userName)`                        |
| `status-update`     | Status changed       | `{ userName, status }`              |
| `new-notification`  | New notification     | `{ type, title, message, ... }`     |
| `notification-read` | Notification read    | `{ notificationId }`                |

---

## 🚀 Deployment

### Production Checklist

1. **Environment Configuration**

   - Set all production environment variables
   - Use strong, unique secrets
   - Configure production database URL
   - Set up production SMTP server

2. **Database Setup**

   - Create MongoDB Atlas cluster (recommended)
   - Set up database indexes
   - Configure backup strategy
   - Enable monitoring

3. **Build Optimization**

   ```bash
   npm run build
   ```

4. **Security**

   - Enable HTTPS
   - Configure CORS properly
   - Set secure cookie options
   - Implement rate limiting

5. **Monitoring**
   - Set up error tracking (Sentry, etc.)
   - Configure logging
   - Monitor API usage
   - Track performance metrics

### Deployment Platforms

#### Vercel (Recommended for Frontend)

```bash
vercel --prod
```

**Note**: Socket.IO requires custom server, so you'll need:

- Deploy Next.js app on Vercel
- Deploy Socket.IO server separately (Railway, Render, etc.)

#### Railway (Full Stack)

1. Connect GitHub repository
2. Configure environment variables
3. Deploy both Next.js and Socket.IO

#### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

EXPOSE 9002
CMD ["npm", "start"]
```

```bash
docker build -t lisn .
docker run -p 9002:9002 --env-file .env.production lisn
```

---

## 🧪 Testing

### Run Tests

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

### Test Structure

```
tests/
├── unit/
│   ├── services/
│   ├── hooks/
│   └── utils/
├── integration/
│   └── api/
└── e2e/
    └── flows/
```

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**

   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**

   - Follow code style guidelines
   - Add tests for new features
   - Update documentation

4. **Commit your changes**

   ```bash
   git commit -m "feat: add amazing feature"
   ```

   Follow [Conventional Commits](https://www.conventionalcommits.org/):

   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation
   - `style:` Code style
   - `refactor:` Code refactoring
   - `test:` Testing
   - `chore:` Maintenance

5. **Push to your fork**

   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**

### Code Style

- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for formatting
- Write meaningful commit messages
- Add JSDoc comments for functions

### Testing Requirements

- Unit tests for utilities and services
- Integration tests for API endpoints
- E2E tests for critical user flows
- Maintain >80% code coverage

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google AI** - Gemini 2.0 Flash for intelligent analysis
- **OpenAI** - Whisper for transcription
- **HuggingFace** - modernBERT for sentiment analysis
- **Vercel** - Next.js framework and deployment
- **shadcn/ui** - Beautiful UI components
- **MongoDB** - Flexible database solution

---

## 📞 Support

- **Documentation**: [docs.lisn.ai](https://docs.google.com/document/d/1j2l3xJKUSrN3MegfKlfV8uElFVml-1rNa4pnUpH-T1k/edit?usp=sharing)
- **Issues**: [GitHub Issues](https://github.com/alifshelviano/audiototext/issues)
- **Discussions**: [GitHub Discussions](https://github.com/alifshelviano/audiototext/discussions)
- **Email**: lisn.app.info@gmail.com

---

## 🗺️ Roadmap

### Q1 2026

- [ ] Mobile app (React Native)
- [ ] Calendar integration (Google Calendar, Outlook)
- [ ] Advanced analytics dashboard
- [ ] Team workspaces

### Q2 2026

- [ ] Video recording support
- [ ] Screen sharing transcription
- [ ] Multi-meeting comparison
- [ ] Custom AI training

### Q3 2026

- [ ] Integration marketplace
- [ ] API webhooks
- [ ] White-label solution
- [ ] Enterprise features

---

<div align="center">

**Built with ❤️ by the LISN Team**

[Website](https://www.lisns.app/) • [Documentation](https://docs.google.com/document/d/1j2l3xJKUSrN3MegfKlfV8uElFVml-1rNa4pnUpH-T1k/edit?usp=sharing) • [Presentation Slide](https://www.canva.com/design/DAG3hNflvyA/e1gtHO1vojy6Yh3KD9h9zg/view?utm_content=DAG3hNflvyA&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=hf8187b4032)

</div>
