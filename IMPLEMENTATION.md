# ExamGhost - Full Implementation Guide

## Project Overview

ExamGhost is a complete full-stack AI-powered exam simulation system that converts uploaded study materials into timed multiple-choice exam experiences with analytics and voice interaction.

### Key Characteristics
- **Frontend + Backend**: Next.js 16 (App Router) with React 19
- **Styling**: Tailwind CSS v4 (pure white #FFF, primary blue #2563EB, no gradients)
- **Database**: SQLite with better-sqlite3 for local persistent storage
- **AI**: Groq API (free tier) - used ONLY during upload stage for question generation
- **Voice**: Web Speech API (Speech-to-Text + Text-to-Speech) with manual fallback
- **File Handling**: Native Next.js API routes with multipart form data
- **Deployment**: Vercel-ready (all code in single Next.js project)

---

## Architecture Overview

### 5-Screen User Flow
1. **Home/Upload** (`/`) - File upload with settings
2. **Processing** - Loading state during AI generation (automatic)
3. **Exam** (`/exam/[id]`) - Timed exam with countdown timer
4. **Results** (`/results/[attemptId]`) - Score + feedback
5. **Analytics** (`/analytics`) - Performance dashboard
6. **Bonus**: History (`/history`) - Exam listings

### Core Technologies Stack

**Frontend Components**
- Navbar (navigation + logo)
- UploadCard (drag-drop, settings, AI generation)
- ExamScreen (timer, questions, navigation)
- QuestionCard (MCQ display)
- ResultsCard (score, expandable feedback)
- AnalyticsDashboard (charts with Recharts)
- VoiceController (Speech-to-Text wrapper)
- Timer (countdown with warnings)

**Backend API Routes**
- `POST /api/upload` - File upload → text extraction → AI question generation
- `GET /api/exams` - List all exams
- `GET /api/exams/[id]` - Get specific exam with questions
- `POST /api/attempts` - Submit answers → instant grading
- `GET /api/attempts/[id]` - Get attempt results with feedback
- `GET /api/analytics` - Calculate and return analytics

**Database Schema**
- `exams` - Exam metadata + JSON-serialized questions
- `user_attempts` - User responses + calculated scores
- `analytics` - Aggregated performance metrics

---

## File Structure

```
/app
  /api
    /upload/route.ts        # File upload + AI generation
    /exams/route.ts         # List exams
    /exams/[id]/route.ts    # Get exam details
    /attempts/route.ts      # Submit exam + grade
    /attempts/[id]/route.ts # Get attempt results
    /analytics/route.ts     # Get analytics data
  /exam/[id]/page.tsx       # Exam screen (most critical)
  /results/[attemptId]/page.tsx  # Results page
  /analytics/page.tsx       # Analytics dashboard
  /history/page.tsx         # Exam history
  layout.tsx                # Root layout with Navbar
  page.tsx                  # Home/upload page
  globals.css               # Tailwind + design tokens

/components
  /ui                       # shadcn/ui pre-installed components
  navbar.tsx                # Global navigation
  upload-card.tsx           # Main upload interface
  exam-screen.tsx           # Exam container
  question-card.tsx         # Single question
  timer.tsx                 # Countdown timer
  results-card.tsx          # Results display
  analytics-dashboard.tsx   # Charts
  voice-controller.tsx      # Speech API wrapper

/lib
  db.ts                     # SQLite database layer
  ai-client.ts              # Gemini AI integration
  file-parser.ts            # PDF/text extraction
  voice.ts                  # Web Speech API utilities

/types
  index.ts                  # TypeScript interfaces
```

---

## Design System

### Colors
- **Background**: #FFFFFF (pure white)
- **Secondary BG**: #F8FAFA (light gray sections)
- **Border**: #E5E7EB (subtle gray)
- **Primary**: #2563EB (professional blue - single color only)
- **Text - Heading**: #111827 (dark gray/black)
- **Text - Body**: #374151 (medium gray)
- **Text - Secondary**: #6B7280 (light gray)
- **Text - Muted**: #9CA3AF (very light gray)

### Typography
- **Font**: Inter (system fallback)
- **Headings**: Bold, dark gray (#111827)
- **Body**: Regular, 1.4-1.6 line-height
- **No decorative fonts for body text**

### Layout
- **Flex-first** for most layouts
- **Max-width container**: 7xl (80rem) for pages
- **Spacing**: 8px grid (p-2, p-4, p-6, p-8)
- **Border radius**: 8-12px (rounded-lg)
- **Shadows**: Soft only (`shadow-sm`)
- **Mobile-first responsive** with Tailwind prefixes

---

## Key Features Implementation

### 1. File Upload + AI Question Generation

**Location**: `/api/upload`, `components/upload-card.tsx`

```typescript
// Flow:
1. User selects file (PDF/TXT/Images)
2. Client validates file type
3. FormData sent to POST /api/upload
4. Server extracts text (pdf-parse for PDFs)
5. Groq AI generates MCQs in JSON format
6. Questions stored in SQLite
7. Redirect to /exam/[examId]
```

**Important**: AI is called **ONLY once** during upload. All subsequent exam sessions use preloaded questions.

### 2. Timed Exam Experience

**Location**: `/app/exam/[id]/page.tsx`, `components/timer.tsx`

```typescript
// Features:
- Countdown timer (updates every second)
- Questions preloaded (no AI latency)
- One question per screen
- Manual answer selection (4 options A/B/C/D)
- Previous/Next navigation
- Can't proceed without answer
- Time-up auto-submission
- Voice-to-answer mapping (if enabled)
```

**No AI calls during exam** - eliminates latency and ensures fast UX.

### 3. Instant Grading + Feedback

**Location**: `/api/attempts/route.ts`, `/app/results/[attemptId]/page.tsx`

```typescript
// On submit:
1. Calculate score (correct answers / total)
2. Generate feedback per question
3. Identify weak topics
4. Update analytics
5. Store attempt in database
6. Redirect to /results/[attemptId]
```

### 4. Voice System (Web Speech API)

**Location**: `lib/voice.ts`, `components/voice-controller.tsx`

```typescript
// Features:
- Speech-to-Text for answer input
- Text-to-Speech for question reading
- Manual fallback (if speech fails)
- Works in Chrome, Edge, Opera
- Browser-native (no external API)
```

### 5. Analytics Dashboard

**Location**: `/app/analytics/page.tsx`, `components/analytics-dashboard.tsx`

**Displays**:
- Total exams taken
- Average score
- Progress trend (line chart)
- Performance by difficulty (bar chart)
- Weak topics (repeated failures)
- Time spent analysis

Uses Recharts for visualization.

---

## Database Schema

### Exams Table
```sql
CREATE TABLE exams (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content_source TEXT,
  created_at INTEGER NOT NULL,
  difficulty TEXT NOT NULL,
  duration INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  questions TEXT NOT NULL -- JSON serialized
)
```

### UserAttempts Table
```sql
CREATE TABLE user_attempts (
  id TEXT PRIMARY KEY,
  exam_id TEXT NOT NULL,
  answers TEXT NOT NULL -- JSON array of answer indices
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  time_taken INTEGER NOT NULL,
  completed_at INTEGER NOT NULL
)
```

### Analytics Table
```sql
CREATE TABLE analytics (
  id TEXT PRIMARY KEY,
  total_exams_completed INTEGER,
  total_questions_answered INTEGER,
  correct_answers INTEGER,
  average_score REAL,
  weak_topics TEXT -- JSON array
)
```

---

## API Route Reference

### POST /api/upload
**Request**: multipart/form-data (file + settings)
**Response**: `{ examId, examTitle, totalQuestions }`
**Process**: 
1. Extract text from file
2. Call Groq AI to generate questions
3. Store in SQLite
4. Return exam metadata

### GET /api/exams
**Response**: `{ exams: Exam[] }`
**Purpose**: List all created exams

### GET /api/exams/[id]
**Response**: `Exam` with full questions array
**Purpose**: Fetch exam for taking it

### POST /api/attempts
**Request**: `{ examId, answers[], timeTaken }`
**Response**: `{ attemptId, score, percentage }`
**Process**:
1. Grade answers
2. Generate feedback
3. Update analytics
4. Store attempt

### GET /api/attempts/[id]
**Response**: Detailed attempt with feedback
**Purpose**: Display results page

### GET /api/analytics
**Response**: Analytics object with aggregates
**Purpose**: Populate analytics dashboard

---

## Important Design Decisions

### 1. Single Color Palette
Only `#2563EB` blue used for UI elements. No accent colors, no gradients, no purple/pink/green. Maintains professional, minimal SaaS aesthetic.

### 2. One-Time AI Usage
AI is called only during upload for question generation. This eliminates latency during exam, making the experience feel native and instant.

### 3. Local Storage First
All data stored in SQLite locally. No cloud API for exam data. Users can take exams offline after generation.

### 4. Voice as Enhancement
Voice is optional (toggle during setup). Manual text/click fallback always available. No dependency on voice for core exam flow.

### 5. Instant Grading
No waiting for results. Answers graded immediately upon submission using simple comparison logic.

---

## Testing the System

### 1. Upload Test
- Go to `/` (Home)
- Upload a PDF or text file
- Set questions (5-50), difficulty (Easy/Medium/Hard), duration (10-180 min)
- Click "Generate Exam"
- Should redirect to exam screen in seconds

### 2. Exam Test
- Take the exam
- Timer counts down
- Answer all questions
- Submit exam
- Check results immediately

### 3. Voice Test (Chrome only)
- Enable "Voice Mode" during upload
- On exam screen, click voice button
- Speak answer ("A", "B", "C", or "D")
- System should map to correct option

### 4. Analytics Test
- Complete multiple exams with different scores
- Go to `/analytics`
- Should show averages, trends, weak topics

---

## Environment Variables

No required environment variables for **mock mode** (uses fallback AI data).

For **real Groq AI integration**, add to `.env.local`:
```
GROQ_API_KEY=your_groq_api_key_here
```

Get free API key at: https://console.groq.com

---

## Deployment

### To Vercel
```bash
git push origin main
```
Project auto-deploys. SQLite data persists in `/tmp` on Vercel (note: resets on redeploy).

### Self-Hosted
```bash
npm run build
npm run start
```

---

## Known Limitations

1. **SQLite Storage**: Data resets if dyno restarts on Vercel. For production, switch to PostgreSQL.
2. **Voice Support**: Works best in Chrome/Edge/Opera. Safari has limited Web Speech API support.
3. **Mock AI**: Without GROQ_API_KEY, uses hardcoded mock questions. Real AI generates unique questions.
4. **Single User**: No authentication. Multi-user support would require sessions/auth layer.

---

## Future Enhancements

- User authentication (with Supabase/Auth.js)
- Persistent database (PostgreSQL instead of SQLite)
- Export results as PDF
- Spaced repetition for weak topics
- Collaborative exams (student + teacher)
- Mobile app (React Native)
- Real-time analytics updates

---

**Build Status**: ✅ Complete & Functional
**Design Status**: ✅ Matches Reference (white bg, blue primary, SaaS minimal style)
**All 5 Screens**: ✅ Implemented
**Voice System**: ✅ Integrated
**Analytics**: ✅ Working
**Responsive**: ✅ Mobile-first, desktop-optimized
