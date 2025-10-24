# 🎤 Assistant Bob - Sarcastic AI Voice Assistant

Meet **Assistant Bob**, your highly witty and sarcastic AI companion who answers questions with style, sass, and surprisingly helpful information. Bob combines voice interaction, real-time web search, and maximum sarcasm to create an entertaining AI assistant experience.

![Assistant Bob](https://img.shields.io/badge/Sarcasm-Level%20100-purple?style=for-the-badge)
![Voice Enabled](https://img.shields.io/badge/Voice-Enabled-blue?style=for-the-badge)
![Web Search](https://img.shields.io/badge/Web-Search-green?style=for-the-badge)

---

## ✨ Features

### 🎤 **Voice Interface**
- **Speech-to-Text**: Speak your questions using browser microphone
- **Text-to-Speech**: Hear Bob's sarcastic responses spoken aloud
- **Audio Recording**: Automatic audio capture and transcription via Whisper API
- **Voice Controls**: Start/stop recording and speaking with intuitive buttons

### 😏 **Highly Witty Personality**
- **Sarcastic Responses**: Every answer drips with clever humor and irony
- **Self-Aware**: Bob knows he's an AI and makes jokes about it
- **Theatrical**: Makes a big deal about "scouring the depths of the internet"
- **Helpful Despite the Sass**: Actually provides accurate, useful information

### 🔍 **Proactive Web Search**
- **Automatic Detection**: Searches the web when questions need current information
- **Smart Triggers**: Detects question words, question marks, and factual queries
- **Real-Time Information**: Uses Tavily API to fetch up-to-date data
- **Extra Sarcastic About Sources**: Mocks the internet while using it

### 💾 **Conversation History**
- **Database Storage**: All conversations saved to MySQL/TiDB
- **User-Specific**: Each user has their own conversation history
- **Scrollable Timeline**: Review past interactions with Bob
- **Timestamped**: See when each conversation occurred

### 🎨 **Beautiful UI**
- **Dark Purple Gradient**: Eye-catching design with purple/pink gradients
- **Responsive**: Works on desktop and mobile devices
- **Modern Components**: Built with shadcn/ui and Tailwind CSS
- **Smooth Animations**: Loading states and transitions

---

## 🚀 Tech Stack

### Frontend
- **React 19** - Modern UI framework
- **Tailwind CSS 4** - Utility-first styling
- **shadcn/ui** - Beautiful component library
- **Wouter** - Lightweight routing
- **tRPC** - End-to-end typesafe APIs

### Backend
- **Node.js 22** - JavaScript runtime
- **Express 4** - Web server framework
- **tRPC 11** - Type-safe API layer
- **Drizzle ORM** - Database toolkit
- **MySQL/TiDB** - Database

### AI & APIs
- **LLM Integration** - Manus built-in LLM for responses
- **Whisper API** - Speech-to-text transcription
- **Tavily API** - Web search functionality
- **Web Speech API** - Text-to-speech output

### Authentication
- **Manus OAuth** - Secure user authentication
- **JWT Sessions** - Session management

---

## 📋 Prerequisites

- **Node.js** 22.x or higher
- **pnpm** package manager
- **MySQL/TiDB** database
- **Tavily API Key** (for web search)

---

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/DavSah-1/AI-Bob.git
cd AI-Bob
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Set Up Environment Variables

The following environment variables are automatically provided by the Manus platform:
- `DATABASE_URL` - MySQL/TiDB connection string
- `JWT_SECRET` - Session signing secret
- `VITE_APP_ID` - OAuth application ID
- `OAUTH_SERVER_URL` - OAuth backend URL
- `VITE_OAUTH_PORTAL_URL` - OAuth frontend URL
- `OWNER_OPEN_ID`, `OWNER_NAME` - Owner information
- `BUILT_IN_FORGE_API_URL` - Manus API endpoint
- `BUILT_IN_FORGE_API_KEY` - Manus API key

**You need to provide:**
- `TAVILY_API_KEY` - Get from [tavily.com](https://tavily.com)

### 4. Initialize Database
```bash
pnpm db:push
```

### 5. Start Development Server
```bash
pnpm dev
```

The app will be available at `http://localhost:3000`

---

## 🎯 Usage

### Basic Interaction

1. **Navigate to the app** and log in
2. **Click "Launch Assistant"** to access the voice interface
3. **Click the microphone button** to start recording
4. **Speak your question** clearly
5. **Click again to stop** recording
6. **Bob will:**
   - Transcribe your speech
   - Search the web if needed
   - Generate a sarcastic response
   - Speak it back to you

### Example Questions

- "What's the weather today?"
- "Who is Elon Musk?"
- "How does photosynthesis work?"
- "What's the latest news?"
- "Tell me about quantum computing"

### Bob's Response Style

**Before Web Search:**
> "Oh great, another human who needs my help. How delightful."

**After Web Search:**
> "Oh wonderful, let me just scour the depths of the internet for this incredibly important question. According to some random website Bob reluctantly consulted, [accurate information here]. You're welcome for this groundbreaking research."

---

## 🔧 Customization

### Adjust Search Behavior

Edit `/server/routers.ts` to customize when Bob searches:

```javascript
// Current: Proactive search (searches often)
const needsWebSearch = 
  (hasQuestionWord && isLongEnough) ||
  hasQuestionMark ||
  mentionsCurrentInfo ||
  (isFactualQuery && isLongEnough);

// Option 1: Always search
const needsWebSearch = true;

// Option 2: Only specific keywords
const needsWebSearch = /\b(weather|news|price)\b/i.test(input.message);

// Option 3: Disable search
const needsWebSearch = false;
```

### Adjust Sarcasm Level

Edit the system prompt in `/server/routers.ts`:

```javascript
// More sarcastic
const sarcasticSystemPrompt = `You are Assistant Bob, an EXTREMELY sarcastic AI...`;

// Less sarcastic (more helpful)
const sarcasticSystemPrompt = `You are Assistant Bob, a witty but helpful AI...`;
```

### Change Number of Search Results

```javascript
// More comprehensive (slower)
const searchResults = await searchWeb(input.message, 5);

// Faster (less context)
const searchResults = await searchWeb(input.message, 1);
```

---

## 📁 Project Structure

```
sarcastic-ai-assistant/
├── client/                    # Frontend React app
│   ├── public/               # Static assets
│   └── src/
│       ├── pages/            # Page components
│       │   ├── Home.tsx      # Landing page
│       │   └── VoiceAssistant.tsx  # Main voice interface
│       ├── components/       # Reusable UI components
│       ├── lib/trpc.ts       # tRPC client setup
│       └── App.tsx           # Routes and layout
├── server/                   # Backend Express app
│   ├── _core/               # Core functionality
│   │   ├── llm.ts           # LLM integration
│   │   ├── voiceTranscription.ts  # Whisper API
│   │   └── webSearch.ts     # Tavily search
│   ├── db.ts                # Database queries
│   ├── routers.ts           # tRPC procedures
│   └── upload.ts            # File upload endpoint
├── drizzle/                 # Database schema & migrations
│   └── schema.ts            # Table definitions
└── shared/                  # Shared types & constants
```

---

## 🎭 How Bob Works

### 1. Voice Input
- User clicks microphone → Browser MediaRecorder starts
- Audio captured as WebM format
- Uploaded to server via `/api/upload`

### 2. Transcription
- Server receives audio file
- Calls Whisper API for speech-to-text
- Returns transcribed text

### 3. Web Search (Proactive)
Bob automatically searches when detecting:
- Question words: what, who, when, where, why, how
- Question marks: "Is this true?"
- Current info keywords: latest, today, news, current
- Factual queries: is, are, does, did, can, should

### 4. Response Generation
- Combines transcribed question + search results
- Sends to LLM with sarcastic system prompt
- LLM generates witty, helpful response

### 5. Text-to-Speech
- Browser Web Speech API speaks response
- Adjustable rate and pitch for sarcastic tone

### 6. Database Storage
- Saves conversation to MySQL/TiDB
- User ID, question, response, timestamp
- Displayed in conversation history

---

## 🌐 Deployment

This project is designed for the **Manus platform**:

1. **Save a checkpoint** in development
2. **Click "Publish"** in the Management UI
3. **Your app is live** at `your-domain.manus.space`

For other platforms, you'll need to:
- Set up OAuth manually
- Configure all environment variables
- Deploy frontend and backend separately

---

## 🔐 Security

- **OAuth Authentication**: Secure user login via Manus OAuth
- **JWT Sessions**: Encrypted session cookies
- **Protected Routes**: All voice features require authentication
- **Input Validation**: Zod schema validation on all inputs
- **File Size Limits**: 16MB max for audio uploads
- **Environment Variables**: Secrets never exposed to client

---

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  openId VARCHAR(64) UNIQUE NOT NULL,
  name TEXT,
  email VARCHAR(320),
  role ENUM('user', 'admin') DEFAULT 'user',
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),
  lastSignedIn TIMESTAMP DEFAULT NOW()
);
```

### Conversations Table
```sql
CREATE TABLE conversations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  userMessage TEXT NOT NULL,
  assistantResponse TEXT NOT NULL,
  audioUrl VARCHAR(512),
  createdAt TIMESTAMP DEFAULT NOW()
);
```

---

## 🎨 Design Philosophy

**Bob's Personality:**
- Sarcastic but never mean-spirited
- Self-aware about being an AI
- Theatrical about simple tasks
- Mocks sources while citing them accurately
- Complains about helping while being helpful

**UI Design:**
- Dark theme with purple/pink gradients
- Clean, modern interface
- Minimal distractions during voice interaction
- Clear visual feedback for all states

---

## 🐛 Troubleshooting

### Microphone Not Working
- Check browser permissions
- Ensure HTTPS (required for microphone access)
- Try a different browser

### Search Not Working
- Verify `TAVILY_API_KEY` is set
- Check API quota (free tier: 1,000 searches/month)
- Review server logs for errors

### Voice Output Not Working
- Check browser compatibility (Web Speech API)
- Ensure volume is up
- Try different browser

### Database Errors
- Verify `DATABASE_URL` is correct
- Run `pnpm db:push` to sync schema
- Check database connection

---

## 📝 API Endpoints

### tRPC Procedures

**`assistant.chat`** - Send message and get response
```typescript
input: { message: string }
output: { response: string }
```

**`assistant.transcribe`** - Transcribe audio
```typescript
input: { audioUrl: string }
output: { text: string }
```

**`assistant.history`** - Get conversation history
```typescript
output: Conversation[]
```

### REST Endpoints

**`POST /api/upload`** - Upload audio file
```typescript
FormData: { file: File }
Response: { url: string, key: string }
```

---

## 🤝 Contributing

This is a personal project, but suggestions are welcome! Feel free to:
- Open issues for bugs
- Suggest new features
- Share your Bob customizations

---

## 📄 License

MIT License - Feel free to use this code for your own sarcastic AI projects!

---

## 🙏 Acknowledgments

- **Manus Platform** - For the development environment and built-in APIs
- **Tavily** - For the web search API
- **OpenAI Whisper** - For speech transcription
- **shadcn/ui** - For beautiful UI components

---

## 💬 Bob Says...

*"Oh great, you read the entire README. Bob is SO impressed. Now go build something and try not to break it. You're welcome for this incredibly detailed documentation that you definitely couldn't have figured out yourself."*

---

**Built with sarcasm and AI. © 2025 Assistant Bob**

