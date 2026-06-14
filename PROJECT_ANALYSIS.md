# NutriAI - Complete Project Analysis

**Date:** June 14, 2026  
**Project Type:** Full-stack AI-powered Diet Assistant  
**Architecture:** Monorepo (pnpm workspaces)

---

## 1. AI Tools & Services Integrated

### Primary AI Service: OpenAI
- **SDK:** OpenAI Node.js SDK v6.27.0
- **API Key:** `AI_INTEGRATIONS_OPENAI_API_KEY` (or `OPENAI_API_KEY`)
- **Base URL:** `https://api.openai.com/v1`
- **Default Model:** `gpt-4o-mini`
- **Capabilities:**
  - Text completions (chat, diet advice, meal planning)
  - Image generation (nutrition visuals)
  - Audio processing (speech-to-text, text-to-speech)
  - Batch processing with SSE support

### Alternative AI Services

**Google Gemini (Alternative)**
- **API Key:** `GEMINI_API_KEY`
- **Base URL:** `https://generativelanguage.googleapis.com/v1beta/openai/`
- **Model:** `gemini-2.5-flash`
- **Use Case:** Fallback when OpenAI key unavailable

**Ollama (Local Development)**
- **Purpose:** Offline AI model for development
- **Enable:** Set `USE_OLLAMA=true` in environment
- **Base URL:** `http://localhost:11434/v1` (configurable)
- **Default Model:** `llama3`
- **Use Case:** Development without API costs

### AI Integration Packages

**Server-side Integration:**
- Package: `@workspace/integrations-openai-ai-server`
- Exports:
  - `openai` - OpenAI client instance
  - `aiModel` - Current AI model name
  - `batchProcess()` - Batch processing with retry logic
  - `batchProcessWithSSE()` - Server-sent events for streaming
  - `generateImageBuffer()` - Image generation
  - `editImages()` - Image editing/manipulation
  - `isRateLimitError()` - Rate limit detection

**Client-side Integration:**
- Package: `@workspace/integrations-openai-ai-react`
- Exports: Audio utilities for React components
- Usage: Voice input/output features

### AI Usage Patterns

1. **Nutrition Chatbot** (`/api/openai` routes)
   - System Prompt: Expert diet & nutrition assistant
   - Handles: Meal recommendations, calorie counts, diet plans
   - Database: Stores conversations & messages

2. **Voice Agent** (VoiceAgent page)
   - Voice-to-text input
   - AI response generation
   - Text-to-speech output
   - Animated avatar interaction

3. **Food Analysis** (FoodChecker page)
   - Image-based food recognition
   - Nutrition information extraction
   - Calorie estimation

---

## 2. Complete Project Architecture & Structure

### Architecture Diagram
```
┌─────────────────────────────────────────────────┐
│           Frontend (React + Vite)               │
│   Port 5173 - Diet Assistant Web Application    │
│  - Clerk Authentication                         │
│  - TanStack React Query (data fetching)         │
│  - Tailwind CSS + Radix UI Components          │
└──────────────┬──────────────────────────────────┘
               │ /api proxy
               ▼
┌─────────────────────────────────────────────────┐
│      Backend (Express + TypeScript)             │
│   Port 3000 - REST API Server                   │
│  - OpenAPI 3.1.0 Specification                  │
│  - Pino structured logging                      │
│  - Clerk authentication middleware              │
└──────────────┬──────────────────────────────────┘
               │
       ┌───────┴────────┬──────────────┐
       ▼                ▼              ▼
  ┌─────────┐   ┌──────────┐   ┌──────────────┐
  │  MySQL  │   │ OpenAI   │   │ Clerk Auth   │
  │Database │   │  API     │   │  Service     │
  └─────────┘   └──────────┘   └──────────────┘

Shared Code Layer (lib/)
├── api-zod (Validation schemas)
├── api-spec (OpenAPI definition)
├── api-client-react (Auto-generated React client)
├── db (Database schema & config)
└── integrations-openai-ai-* (AI integration utilities)
```

### Monorepo Structure

```
NutriAI/
│
├── 📦 artifacts/                    # Applications
│   ├── api-server/                  # Express backend
│   │   ├── src/
│   │   │   ├── app.ts              # Express app setup
│   │   │   ├── index.ts            # Entry point (port 3000)
│   │   │   ├── routes/             # API endpoints
│   │   │   │   ├── auth.ts         # Authentication (register, login)
│   │   │   │   ├── profile.ts      # User profile management
│   │   │   │   ├── diet.ts         # Diet plans
│   │   │   │   ├── tracker.ts      # Meal, water, weight logging
│   │   │   │   ├── openai.ts       # AI conversations & chat
│   │   │   │   ├── coach.ts        # Coaching features
│   │   │   │   ├── fasting.ts      # Fasting tracking
│   │   │   │   ├── gamification.ts # Achievements & rewards
│   │   │   │   ├── health.ts       # Health check endpoint
│   │   │   │   └── index.ts        # Route aggregator
│   │   │   ├── lib/
│   │   │   │   ├── auth.ts         # requireAuth middleware
│   │   │   │   └── logger.ts       # Pino logger setup
│   │   │   └── middlewares/
│   │   │       └── clerkProxyMiddleware.ts
│   │   ├── data/                   # Sample CSV data for seeding
│   │   ├── build.mjs               # esbuild configuration
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── dist/                   # Build output (bundled ESM)
│   │
│   ├── diet-assistant/             # React frontend
│   │   ├── src/
│   │   │   ├── App.tsx             # Root component with routing
│   │   │   ├── main.tsx            # React DOM entry
│   │   │   ├── index.css           # Tailwind + global styles
│   │   │   ├── pages/              # Page components
│   │   │   │   ├── Dashboard.tsx   # User overview & metrics
│   │   │   │   ├── Profile.tsx     # User settings & goals
│   │   │   │   ├── DietPlan.tsx    # View diet plans
│   │   │   │   ├── Tracker.tsx     # Log meals, water, weight
│   │   │   │   ├── FoodChecker.tsx # Scan & identify foods
│   │   │   │   ├── Chat.tsx        # AI nutrition chatbot
│   │   │   │   ├── VoiceAgent.tsx  # Voice-enabled AI avatar
│   │   │   │   ├── BmiCalculator.tsx # BMI tool
│   │   │   │   ├── DiseaseDiet.tsx # Disease-specific diets
│   │   │   │   ├── Fasting.tsx     # Fasting tracker
│   │   │   │   ├── Achievements.tsx # Gamification rewards
│   │   │   │   ├── Login.tsx       # Login page
│   │   │   │   ├── Register.tsx    # Registration page
│   │   │   │   └── not-found.tsx   # 404 page
│   │   │   ├── components/         # Reusable components
│   │   │   │   ├── Layout.tsx      # Main layout wrapper
│   │   │   │   ├── NutritionPanel.tsx
│   │   │   │   ├── BarcodeScanner.tsx
│   │   │   │   └── ui/             # shadcn/ui components
│   │   │   ├── lib/                # Utilities & helpers
│   │   │   ├── hooks/              # Custom React hooks
│   │   │   ├── hooks/              # Custom React hooks
│   │   │   └── i18n                # Internationalization config
│   │   ├── public/                 # Static assets
│   │   │   └── images/
│   │   ├── dist/                   # Build output
│   │   ├── index.html
│   │   ├── vite.config.ts          # Vite configuration
│   │   ├── tsconfig.json
│   │   ├── components.json         # shadcn/ui config
│   │   └── package.json
│   │
│   └── mockup-sandbox/             # Mockup/design preview app
│       ├── src/
│       ├── components.json
│       └── vite.config.ts
│
├── 📚 lib/                         # Shared libraries
│   ├── api-spec/                   # OpenAPI specification
│   │   ├── openapi.yaml            # API definition
│   │   ├── orval.config.ts         # Orval code generation config
│   │   └── package.json
│   │
│   ├── api-zod/                    # Zod validation schemas
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   └── generated/          # Auto-generated schemas
│   │   └── package.json
│   │
│   ├── api-client-react/           # Generated API client
│   │   ├── src/
│   │   │   ├── custom-fetch.ts     # Fetch with auth token
│   │   │   ├── index.ts            # Exports
│   │   │   └── generated/          # Auto-generated hooks
│   │   └── package.json
│   │
│   ├── db/                         # Database schema & config
│   │   ├── src/
│   │   │   ├── index.ts            # DB client setup
│   │   │   ├── schema/             # Database schema definitions
│   │   │   └── schema/
│   │   │       └── (table definitions)
│   │   ├── drizzle.config.ts       # Drizzle Kit config
│   │   └── package.json
│   │
│   ├── integrations/               # Integration packages
│   │   └── openai_ai_integrations/
│   │       ├── src/
│   │       │   ├── client/         # Client-side utilities
│   │       │   └── server/         # Server-side utilities
│   │       └── package.json
│   │
│   ├── integrations-openai-ai-server/
│   │   ├── src/
│   │   │   ├── client.ts           # OpenAI client initialization
│   │   │   ├── index.ts            # Main exports
│   │   │   ├── image/              # Image generation
│   │   │   │   ├── index.ts
│   │   │   │   └── client.ts
│   │   │   ├── batch/              # Batch processing
│   │   │   │   ├── index.ts
│   │   │   │   └── utils.ts
│   │   │   └── audio/              # Audio processing
│   │   └── package.json
│   │
│   └── integrations-openai-ai-react/
│       ├── src/
│       │   ├── index.ts
│       │   └── audio/
│       └── package.json
│
├── 📜 scripts/                     # Build & utility scripts
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
│
├── 📋 Configuration Files
│   ├── pnpm-workspace.yaml         # Monorepo setup, catalog versions
│   ├── pnpm-lock.yaml              # Lock file
│   ├── tsconfig.base.json          # Base TypeScript config
│   ├── tsconfig.json               # Root tsconfig
│   ├── package.json                # Root workspace package
│   └── replit.md                   # Development guide
│
└── 📁 attached_assets/             # Project requirements & specs
    ├── Feature requirements documents
    └── Task descriptions
```

### Database Tables

**Core Tables:**
- `users` - User accounts & authentication
- `profiles` - User dietary preferences & goals
- `meal_entries` - Logged meals with nutrition info
- `water_entries` - Daily water intake logging
- `weight_entries` - Weight history for tracking
- `diet_plans` - Personalized meal plans
- `conversations` - AI chat conversations
- `messages` - Chat messages in conversations
- `fasting_sessions` - Intermittent fasting tracking
- `gamification` - Achievements & points system

---

## 3. Frontend-Backend Communication

### Architecture Flow

```
User Browser
    ↓
React Component (Frontend)
    ↓
React Query Hook (Auto-generated from OpenAPI)
    ↓
API Client (@workspace/api-client-react)
    ↓
Fetch with Auth Token (from Clerk localStorage)
    ↓
Vite Dev Server (Port 5173)
    ├─ Proxies /api/* → http://localhost:3000
    └─ HMR for hot module reloading
    ↓
Express Server (Port 3000)
    ├─ CORS middleware (credentials: true)
    ├─ Clerk auth middleware (validate token)
    ├─ Route handler (business logic)
    ├─ Zod schema validation
    └─ Database query (Drizzle ORM)
    ↓
MySQL Database
    ↓
Response (JSON)
    ↓
React Query (Caching & state management)
    ↓
Component Re-render
```

### API Communication Details

**1. API Specification & Code Generation**
- **Source:** `lib/api-spec/openapi.yaml`
- **Generator:** Orval (TypeScript client generation)
- **Output:** `lib/api-client-react/src/generated/`
- **Includes:** React Query hooks, types, schemas

**2. Generated API Client**
- **Package:** `@workspace/api-client-react`
- **Exports:** Auto-generated hooks like:
  - `useGetProfile()`
  - `useCreateMealEntry()`
  - `useGetTrackerToday()`
  - etc.
- **Features:**
  - Automatic TypeScript types
  - Built-in error handling
  - Caching via React Query
  - Request deduplication

**3. Authentication Flow**
```
User Logs In
    ↓
Clerk UI (built-in component)
    ↓
Auth token stored in localStorage (key: 'diet_token')
    ↓
API Client injects header: Authorization: Bearer <token>
    ↓
Backend validates with @clerk/express middleware
    ↓
Request proceeds or returns 401 Unauthorized
```

**4. Request/Response Cycle**

Example: Logging a meal
```typescript
// Frontend Component
import { useCreateMealEntry } from '@workspace/api-client-react'

function LogMeal() {
  const mutation = useCreateMealEntry()
  
  const handleSubmit = async (data) => {
    await mutation.mutateAsync({
      foodName: 'Chicken Breast',
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
      portionSize: '100g'
    })
  }
}
```

```typescript
// Backend Route (artifacts/api-server/src/routes/tracker.ts)
router.post("/meals", async (req: AuthRequest, res) => {
  // 1. Parse & validate with Zod
  const parse = LogMealBody.safeParse(req.body)
  if (!parse.success) return res.status(400).json({error})
  
  // 2. Insert into database
  const [entry] = await db
    .insert(mealEntriesTable)
    .values({...parse.data, userId: req.auth.userId})
    .returning()
  
  // 3. Return response
  res.status(201).json(entry)
})
```

**5. API Endpoints Summary**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/healthz` | Server health check |
| POST | `/auth/register` | User registration |
| POST | `/auth/login` | User login |
| GET | `/profile` | Get user profile |
| PUT | `/profile` | Update profile |
| GET | `/diet` | Get diet plans |
| POST | `/diet` | Create diet plan |
| POST | `/tracker/meals` | Log meal |
| GET | `/tracker/today` | Get today's meals |
| POST | `/tracker/weight` | Log weight |
| GET | `/tracker/weight` | Weight history |
| POST | `/openai/conversations` | Create conversation |
| GET | `/openai/conversations` | List conversations |
| POST | `/openai/conversations/:id/messages` | Send message |
| GET | `/openai/conversations/:id` | Get conversation with messages |
| GET | `/fasting/sessions` | Fasting history |
| POST | `/gamification/achievements` | Get achievements |

### Proxy Configuration (Vite)

**Development Proxy (vite.config.ts):**
```typescript
server: {
  port: 5173,
  proxy: {
    "/api": {
      target: "http://localhost:3000",  // API server
      changeOrigin: true,
      secure: false,
    },
  },
}
```

This allows frontend to make requests to `/api/...` which Vite automatically forwards to the backend.

---

## 4. Environment Setup Requirements

### Prerequisites
- **Node.js:** v18 or higher
- **pnpm:** v8 or higher
- **MySQL:** Database server (cloud or local)
- **OpenAI Account:** For API access (or alternative: Gemini/Ollama)
- **Clerk Account:** For authentication service
- **Git:** For version control

### Environment Variables

**Backend (artifacts/api-server/.env)**
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=mysql://user:password@host:3306/nutritionai_db

# Clerk Authentication
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxx
CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxx

# AI Service - OpenAI (Primary)
AI_INTEGRATIONS_OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxx
# Optional: Override base URL
# AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.openai.com/v1

# AI Service - Google Gemini (Alternative)
# GEMINI_API_KEY=your_gemini_api_key

# AI Service - Ollama (Local)
# USE_OLLAMA=true
# OLLAMA_BASE_URL=http://localhost:11434/v1
# OLLAMA_MODEL=llama3
```

**Frontend (artifacts/diet-assistant/.env)**
```env
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxx
VITE_CLERK_PROXY_URL=http://localhost:3000/auth

# Server Configuration
PORT=5173
BASE_PATH=/

# API Configuration (auto-configured via Vite proxy)
# No need to set manually - proxies to http://localhost:3000
```

### Setup Checklist

- [ ] Clone repository
- [ ] Install Node.js v18+
- [ ] Install pnpm: `npm install -g pnpm`
- [ ] Create `.env` files in both:
  - `artifacts/api-server/.env`
  - `artifacts/diet-assistant/.env`
- [ ] Obtain API keys:
  - [ ] OpenAI API key from https://platform.openai.com/api-keys
  - [ ] Clerk API keys from https://dashboard.clerk.com
  - [ ] MySQL database credentials
- [ ] Install dependencies: `pnpm install`
- [ ] Create MySQL database: `CREATE DATABASE nutritionai_db`
- [ ] Run database migrations (if needed)
- [ ] Start development: `pnpm dev`

---

## 5. Build & Run Processes

### Quick Start

```bash
# Install all dependencies
pnpm install

# Start development (both frontend & backend)
pnpm dev

# Frontend will be at: http://localhost:5173
# Backend API at: http://localhost:3000
```

### Individual Package Commands

**Root Workspace Commands**

```bash
# Full type checking (all packages)
pnpm typecheck

# Full build (libraries + applications)
pnpm build

# Run tests (if configured)
pnpm test

# Format code with Prettier
pnpm format
```

**API Server Commands**

```bash
cd artifacts/api-server

# Type checking
pnpm typecheck

# Build with esbuild (creates dist/ with bundled ESM)
pnpm build

# Production start (requires build first)
pnpm start

# Development mode (auto-builds and starts)
pnpm dev
```

**Frontend Commands**

```bash
cd artifacts/diet-assistant

# Type checking
pnpm typecheck

# Development server (Vite HMR)
pnpm dev

# Production build (creates dist/public/)
pnpm build

# Preview production build locally
pnpm serve
```

### Build Process Details

**Backend Build (esbuild):**
1. Entry point: `artifacts/api-server/src/index.ts`
2. Bundles all dependencies into single ESM file
3. Output: `artifacts/api-server/dist/index.mjs`
4. Also generates: source maps, worker files for logging
5. Plugins: esbuild-plugin-pino (for logging optimization)

**Frontend Build (Vite):**
1. Entry point: `artifacts/diet-assistant/src/main.tsx`
2. Builds React app with optimizations
3. Output: `artifacts/diet-assistant/dist/public/`
4. Plugins:
   - React Fast Refresh
   - Tailwind CSS v4
   - Runtime error overlay
5. Uses `BASE_PATH` env var for deployment paths

**Library Build:**
- Libraries are TypeScript-only (no build step)
- Export `.ts` files directly as modules
- Consumed by applications via imports

### Development Server Features

**Frontend (Vite):**
- ✅ Hot Module Replacement (HMR)
- ✅ Fast refresh on file changes
- ✅ Auto proxy `/api` to backend
- ✅ Source maps for debugging
- ✅ Dev banner overlay
- ✅ Runtime error modal

**Backend (Express):**
- ✅ Pino structured logging
- ✅ CORS enabled for frontend
- ✅ Error handling
- ✅ Source maps for stack traces

### Production Deployment

**Build for Production:**
```bash
# Full workspace build
pnpm build

# Creates:
# - artifacts/api-server/dist/index.mjs (backend bundle)
# - artifacts/diet-assistant/dist/public/ (frontend static files)
```

**Run Production:**
```bash
# Backend
cd artifacts/api-server
PORT=3000 NODE_ENV=production pnpm start

# Frontend (serve static files)
# Copy dist/public/ to your web server
# Or use: pnpm serve (local preview)
```

### Troubleshooting

**Port Already in Use**
```bash
# Windows - Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Kill port 5173
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

**Build Failures**
```bash
# Clear all node_modules and reinstall
pnpm install --force

# Clear Vite cache
rm -rf artifacts/diet-assistant/dist

# Clear build output
rm -rf artifacts/api-server/dist
```

**Type Errors**
```bash
# Run full typecheck
pnpm typecheck

# Fix issues and rebuild
pnpm build
```

---

## 6. Key Technologies & Dependencies

### Frontend Stack
| Package | Version | Purpose |
|---------|---------|---------|
| React | 19.1.0 | UI framework |
| TypeScript | 5.9.2 | Type safety |
| Vite | 7.3.0 | Build tool & dev server |
| Tailwind CSS | 4.1.14 | Styling |
| Radix UI | Latest | Headless components |
| TanStack React Query | 5.90.21 | Data fetching & caching |
| React Hook Form | 3.10.0 | Form management |
| Framer Motion | 12.35.1 | Animations |
| Clerk React | Latest | Authentication |
| Lucide React | 0.545.0 | Icons |
| Zod | 3.25.76 | Schema validation |

### Backend Stack
| Package | Version | Purpose |
|---------|---------|---------|
| Express | 5 | Web framework |
| TypeScript | 5.9.2 | Type safety |
| esbuild | 0.27.3 | Bundler |
| Pino | 9 | Structured logging |
| Pino HTTP | 10 | HTTP request logging |
| Drizzle ORM | 0.45.1 | Database ORM |
| OpenAI SDK | 6.27.0 | AI integration |
| Clerk Express | 2.1.10 | Authentication |
| bcryptjs | 3.0.3 | Password hashing |
| jsonwebtoken | 9.0.3 | JWT handling |
| CORS | 2 | Cross-origin support |

### Shared Utilities
| Package | Version | Purpose |
|---------|---------|---------|
| Zod | 3.25.76 | Schema validation |
| Drizzle ORM | 0.45.1 | Database access |
| p-limit | 7.3.0 | Concurrency control |
| p-retry | 7.1.1 | Retry logic |

---

## 7. Workflow & Development Tips

### Adding a New Feature

**1. Define API in OpenAPI spec:**
```yaml
# lib/api-spec/openapi.yaml
paths:
  /api/new-feature:
    post:
      operationId: createFeature
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/NewFeatureBody'
      responses:
        '201':
          description: Created
```

**2. Generate API client:**
```bash
# Orval auto-generates from OpenAPI spec
pnpm --filter "@workspace/api-spec" run generate
```

**3. Implement backend route:**
```typescript
// artifacts/api-server/src/routes/feature.ts
router.post('/new-feature', async (req, res) => {
  // Implementation
})
```

**4. Create frontend component:**
```typescript
// artifacts/diet-assistant/src/pages/NewFeature.tsx
import { useCreateFeature } from '@workspace/api-client-react'

export default function NewFeature() {
  const { mutate } = useCreateFeature()
  // Component code
}
```

### Debugging Tips

- **Frontend:** Use browser DevTools, Vite shows component source
- **Backend:** Check Pino logs in terminal (structured format)
- **API:** Use Postman/Insomnia to test endpoints directly
- **Database:** Use MySQL Workbench or CLI to inspect data
- **Type errors:** Run `pnpm typecheck` to catch issues early

### Performance Optimization

- React Query handles caching automatically
- Vite's code splitting reduces bundle size
- esbuild bundles efficiently with tree-shaking
- Pino logging is optimized with plugin
- Drizzle ORM generates optimized SQL

---

## Summary

NutriAI is a sophisticated full-stack application combining:
- **Modern Frontend:** React with component library, form handling, and animations
- **Robust Backend:** Express with structured logging and authentication
- **AI-Powered Features:** OpenAI integration for chatbot, food analysis, and recommendations
- **Type Safety:** TypeScript, Zod schemas, and generated API clients
- **Scalable Architecture:** Monorepo structure with shared libraries

The application focuses on diet tracking, meal planning, and AI-powered nutritional guidance with features like barcode scanning, voice interaction, and gamification.
