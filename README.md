# YouTube Deep Analyzer v2.0

**AI-powered YouTube video analysis combining comments AND transcript for deeper audience insights.**

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)

## ✨ What's New in v2.0

This enhanced version combines **YouTube Data API v3**, **transcript analysis**, and **Firebase history** to provide:

### Core Features
- 🎯 **Hook Analysis** - Evaluate your video's opening (first 30-60 seconds)
- 📝 **Script Structure** - Section-by-section breakdown with viewer sentiment
- 🔍 **Content Gap Analysis** - Promise vs. delivery comparison
- ⏱️ **Pacing Analysis** - Identify too-fast/too-slow sections
- 📈 **Engagement Prediction** - Predicted drop-off points with fixes
- 🔗 **Comment-Transcript Correlation** - Match viewer feedback to specific timestamps
- 💾 **History Panel** - ChatGPT-style collapsible sidebar with saved analyses
- 🆓 **Free AI Models** - Use Grok, GLM, and other free models via OpenRouter

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+**
- **YouTube Data API Key** - [Get it here](https://console.cloud.google.com/apis/credentials)
- **OpenRouter API Key** - [Get it here](https://openrouter.ai)
- **Firebase Project** - [Setup guide](./FIREBASE_SETUP.md)

### Installation

```bash
# Clone or navigate to the project
cd youtube-deep-analyzer

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Add your API keys to .env.local (see below)

# Start development server on port 3005
npm run dev
```

Open [http://localhost:3005](http://localhost:3005) to use the app.

## 🔑 API Keys Setup

### 1. YouTube Data API v3

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **YouTube Data API v3**
4. Create credentials (API Key)
5. Copy the API key

**Free Quota:** 10,000 units/day (~100 video analyses)

### 2. OpenRouter (AI Analysis)

1. Go to [openrouter.ai](https://openrouter.ai) and sign up
2. Add credits ($5 minimum recommended for paid models)
3. Go to Keys and create a new API key
4. Copy the key

**Free Models Available:** Grok 2, GPT OSS, GLM (no credits needed)

### 3. Firebase (History Storage)

See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed setup instructions.

## 🤖 Supported AI Models

| Model | Type | Context Window | Cost | Best For |
|-------|------|---------------|------|----------|
| **Grok 2 (Free)** | Free | 128K | $0 | Default, fast & free |
| GPT OSS 20B | Free | 64K | $0 | Budget analyses |
| GLM 4.5 Air | Free | 128K | $0 | Lightweight |
| Gemini 3 Pro | Paid | 2M | $$$ | Most detailed with full transcript |
| GPT-5.1 | Paid | 200K | $$$ | Latest OpenAI model |
| Claude Opus 4.5 | Paid | 200K | $$$ | Most capable |
| Grok 4 | Paid | 128K | $$$ | Latest X.AI model |

**Recommendation:** Start with **Grok 2 (Free)** for testing. Upgrade to **Gemini 3 Pro** for production use with transcripts (2M context handles full videos).

## 📊 Analysis Features

### Original Features (Comment-based)
- ✅ **Sentiment Analysis** - Positive/negative/neutral breakdown
- ✅ **Knowledge Gaps** - What viewers don't understand
- ✅ **Demand Signals** - What content viewers want next
- ✅ **Myths & Misconceptions** - False beliefs in comments
- ✅ **Pain Points** - Viewer frustrations
- ✅ **Content Resonance** - What worked vs flopped

### NEW: Transcript-Enhanced Features
- ✨ **Hook Analysis** - Type, effectiveness, clarity score, time-to-hook
- ✨ **Script Structure** - Sections, flow score, transitions, logical gaps
- ✨ **Content Gap Analysis** - Promised vs delivered content
- ✨ **Pacing Analysis** - Words per minute, fast/slow sections
- ✨ **Engagement Prediction** - Drop-off points with fixes
- ✨ **Timestamp-Comment Mapping** - Match feedback to script sections

### History Features
- 💾 **Auto-save** - Every analysis automatically saved to Firebase
- 📜 **ChatGPT-style Panel** - Collapsible history sidebar
- ⏰ **Relative Timestamps** - "2h ago", "Yesterday", etc.
- 🔄 **One-click Restore** - Load any past analysis instantly
- 📱 **Mobile Friendly** - Works on all screen sizes

## 📁 Project Structure

```
youtube-deep-analyzer/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── scrape/route.ts        # YouTube Data API v3 scraper
│   │   │   ├── transcript/route.ts    # Transcript fetching
│   │   │   ├── analyze/route.ts       # AI analysis endpoint
│   │   │   └── history/               # Firebase CRUD operations
│   │   │       ├── save/route.ts      # Save analysis
│   │   │       ├── list/route.ts      # List analyses
│   │   │       └── [id]/route.ts      # Get analysis by ID
│   │   ├── globals.css                # Global styles
│   │   ├── layout.tsx                 # Root layout
│   │   └── page.tsx                   # Main page
│   ├── components/
│   │   ├── HistoryPanel.tsx           # ChatGPT-style history sidebar
│   │   ├── InsightCard.tsx            # Insight display card
│   │   ├── LoadingState.tsx           # Loading indicators
│   │   ├── ResultsDisplay.tsx         # Results dashboard
│   │   ├── SentimentChart.tsx         # Sentiment pie chart
│   │   └── TranscriptAnalysis.tsx     # Transcript-specific components
│   └── lib/
│       ├── firebase.ts                # Firebase initialization
│       ├── prompts.ts                 # AI prompt templates
│       ├── types.ts                   # TypeScript types
│       └── utils.ts                   # Utility functions
├── .env.example                       # Environment template
├── FIREBASE_SETUP.md                  # Firebase setup guide
├── package.json
└── README.md
```

## 💡 How It Works

### Data Flow

```
User enters YouTube URL
    ↓
1. FETCH VIDEO DATA (YouTube Data API v3)
   - Video metadata (title, views, likes, duration)
   - Up to 2,000 comments (paginated)
    ↓
2. FETCH TRANSCRIPT (youtube-transcript)
   - Attempts to get transcript with timestamps
   - Gracefully fails if unavailable
    ↓
3. AI ANALYSIS (OpenRouter)
   - Combines comments + transcript
   - Correlates feedback with video content
   - Generates comprehensive insights
    ↓
4. AUTO-SAVE (Firebase)
   - Saves analysis to Firestore
   - Adds to history panel
    ↓
5. DISPLAY RESULTS
   - Overview tab (sentiment, metadata)
   - Script Analysis tab (hook, structure, pacing)
   - Comment Insights tab (gaps, demand, myths)
   - Recommendations tab (actions + content ideas)
```

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/scrape` | POST | Fetch video data & comments via YouTube Data API v3 |
| `/api/transcript` | POST | Fetch video transcript (optional) |
| `/api/analyze` | POST | Perform AI analysis with selected model |
| `/api/history/save` | POST | Save analysis to Firebase |
| `/api/history/list` | GET | List recent analyses |
| `/api/history/[id]` | GET | Get specific analysis |

## ⚙️ Environment Variables

Create `.env.local` with these variables:

```env
# YouTube Data API v3 (Required)
YOUTUBE_DATA_API_KEY=your_youtube_api_key_here

# AI Analysis via OpenRouter (Required)
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Default AI Model (Optional - defaults to free model)
DEFAULT_MODEL=x-ai/grok-2-1212:free

# Firebase Configuration (Required for history)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
```

## ⚠️ Important Notes

### Transcript Availability
- Not all videos have transcripts (depends on creator settings)
- Analysis will proceed with comments-only mode if transcript unavailable
- Auto-generated captions work fine if manual captions unavailable

### API Costs & Quotas

**YouTube Data API v3:**
- Free tier: 10,000 units/day
- 1 video analysis ≈ 100 units (metadata + comments)
- Quota resets at midnight Pacific Time

**OpenRouter:**
- Free models: $0 (Grok 2, GPT OSS, GLM)
- Paid models: ~$0.05-0.50 per analysis depending on model
- Check [openrouter.ai/docs/pricing](https://openrouter.ai/docs/pricing) for latest rates

**Firebase:**
- Free tier: 1GB storage, 50K reads/day, 20K writes/day
- 1 analysis save = 1 write (~0.005 cents)
- See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for details

### Private Videos
- Only public videos can be analyzed
- Unlisted videos work if you have the link
- Private videos will return an error

## 🛠️ Development

```bash
# Run in development mode (port 3005)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## 🚀 Deployment to Vercel

1. Push code to GitHub

2. Import project to Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your repository

3. Add environment variables in Vercel:
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.local`
   - Make sure to add them for all environments (Production, Preview, Development)

4. Deploy:
   - Vercel will auto-deploy on every push to main branch
   - First deployment may take 2-3 minutes

5. Verify:
   - Test with a YouTube URL
   - Check Firestore for saved analyses
   - Verify history panel loads correctly

## 📄 License

MIT License - feel free to use and modify!

## 🙏 Credits

- [YouTube Data API v3](https://developers.google.com/youtube/v3) - Video & comment data
- [OpenRouter](https://openrouter.ai) - AI model access (free & paid)
- [Firebase](https://firebase.google.com) - History storage
- [youtube-transcript](https://npm.im/youtube-transcript) - Transcript fetching
- [Next.js](https://nextjs.org) - React framework
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Recharts](https://recharts.org) - Charts
- [Lucide](https://lucide.dev) - Icons

## 📧 Support

For issues or questions:
- Check [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for Firebase issues
- Review environment variables in `.env.local`
- Check browser console for errors
- Verify API keys are valid and have quota remaining

---

Built with ❤️ for content creators who want to deeply understand their audience.
