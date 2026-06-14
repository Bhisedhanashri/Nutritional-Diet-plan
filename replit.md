# NutriAI — AI-Powered Diet & Nutrition Assistant

NutriAI is a comprehensive, state-of-the-art Web Application designed to help users manage their diet, track their meals, and generate personalized nutrition advice using Advanced AI. The application features personalized diet plan generation, food caloric analysis, gamified tracking systems, chronic disease diet planning, and a direct AI coaching assistant.

---

## 📂 Project Workspace Structure

This project is organized as a **PNPM monorepo workspace** containing multiple decoupled components and packages:

### Core Applications (under `artifacts/`)
- 💻 **[@workspace/diet-assistant](file:///C:/Users/Baha/Downloads/NutriAI/NutriAI/artifacts/diet-assistant)**: A modern React + TypeScript + Vite frontend styled with TailwindCSS, utilizing Radix UI primitives and Framer Motion for premium aesthetics.
- ⚙️ **[@workspace/api-server](file:///C:/Users/Baha/Downloads/NutriAI/NutriAI/artifacts/api-server)**: An Express-based backend API server coordinating user authentication, profile computations, tracking telemetry, and AI LLM integrations.
- 🧪 **[@workspace/mockup-sandbox](file:///C:/Users/Baha/Downloads/NutriAI/NutriAI/artifacts/mockup-sandbox)**: An isolated sandbox workspace folder for experimental testing of UI mockups.

### Shared Libraries (under `lib/`)
- 🗃️ **[@workspace/db](file:///C:/Users/Baha/Downloads/NutriAI/NutriAI/lib/db)**: A file-based mock database storage engine that implements standard Drizzle-like query builders (`db.select()`, `.insert()`, `.update()`, `.delete()`) and persists data dynamically into CSV files.
- 🤖 **[@workspace/integrations-openai-ai-server](file:///C:/Users/Baha/Downloads/NutriAI/NutriAI/lib/integrations-openai-ai-server)**: A unified OpenAI client wrapper configured to handle LLM calls to Google Gemini API (via standard OpenAI adapters) or local Ollama servers.
- 🛡️ **[@workspace/api-zod](file:///C:/Users/Baha/Downloads/NutriAI/NutriAI/lib/api-zod)**: Zod validation schemas shared across the frontend and backend to guarantee strict data payload type safety.
- 📞 **[@workspace/api-client-react](file:///C:/Users/Baha/Downloads/NutriAI/NutriAI/lib/api-client-react)**: Shared API client hooks for querying the backend endpoints in React.

---

## 🛠️ Getting Started & How to Run

### Prerequisites
- **Node.js** (v20+ recommended)
- **PNPM** package manager (installed globally: `npm install -g pnpm`)

### Installation
From the root workspace directory ([NutriAI/](file:///C:/Users/Baha/Downloads/NutriAI/NutriAI)), install all monorepo dependencies:
```bash
pnpm install
```

### Running the Project
To run both the **Vite Frontend Dev Server** and the **Express Backend API Server** concurrently, run:
```bash
pnpm dev
```
This script triggers the root dev command defined in [package.json](file:///C:/Users/Baha/Downloads/NutriAI/NutriAI/package.json), executing:
`pnpm --filter "@workspace/api-server" --filter "@workspace/diet-assistant" --parallel run dev`

### Local Ports & Endpoints
- **Frontend App**: [http://localhost:5173/](http://localhost:5173/)
- **Backend API Server**: [http://localhost:3000/](http://localhost:3000/)
- **API Health Check**: [http://localhost:3000/api/healthz](http://localhost:3000/api/healthz)

---

## 🧠 AI Configurations & Models

The application integrates with language models via the client configured in [@workspace/integrations-openai-ai-server](file:///C:/Users/Baha/Downloads/NutriAI/NutriAI/lib/integrations-openai-ai-server/src/client.ts). It supports both **Google Gemini API** (using OpenAI-compatible endpoints) and **Ollama** (for running local AI models):

### 1. Google Gemini API (Default Cloud Engine)
By setting `USE_OLLAMA=false`, the server routes calls to the OpenAI-compatible Gemini interface:
- **API URL**: `https://generativelanguage.googleapis.com/v1beta/openai/`
- **Model Used**: `gemini-2.5-flash`
- **Environment Variable**: `GEMINI_API_KEY` or `OPENAI_API_KEY` (configured in [api-server/.env](file:///C:/Users/Baha/Downloads/NutriAI/NutriAI/artifacts/api-server/.env)).

### 2. Ollama Local Engine (Optional)
If you prefer running models entirely on your local machine, set `USE_OLLAMA=true`:
- **API URL**: `http://localhost:11434/v1` (Default)
- **Model Used**: `llama3.2` (Adjustable via environment variable)
- **Environment Variables**:
  - `USE_OLLAMA=true`
  - `OLLAMA_BASE_URL=http://localhost:11434/v1`
  - `OLLAMA_MODEL=llama3.2`

---

## 💾 Database Architecture (CSV Storage)

Rather than requiring a heavy external database server like PostgreSQL or MySQL to run locally, NutriAI implements a local file-based database facade inside [@workspace/db](file:///C:/Users/Baha/Downloads/NutriAI/NutriAI/lib/db/src/index.ts).
- It reads and writes data inside `NutriAI/data/` (or the folder defined by the `DATA_DIR` env variable).
- Data is saved directly in **CSV formats** for the following tables:
  - `users.csv` (Basic login & credentials mapping)
  - `profiles.csv` (Ages, heights, weights, fitness goals, and caloric targets)
  - `diet_plans.csv` (Generated weekly diet structures)
  - `meal_entries.csv`, `water_entries.csv`, `weight_entries.csv` (User tracking logs)
  - `conversations.csv`, `messages.csv` (Chat logs with the AI agent)
  - `gamification.csv` (Streak counts, points, and user badges)
  - `fasting_sessions.csv` (Intermittent fasting intervals)

---

## 🌟 Key Application Features

1. **AI Chat Assistant (NutriAI)** ([Chat.tsx](file:///C:/Users/Baha/Downloads/NutriAI/NutriAI/artifacts/diet-assistant/src/pages/Chat.tsx)):
   Interactive chatbot powered by `DIET_SYSTEM_PROMPT` allowing users to get custom food recommendations, recipe swaps, and nutrition tips.
2. **Personalized Diet Plan Generator** ([DietPlan.tsx](file:///C:/Users/Baha/Downloads/NutriAI/NutriAI/artifacts/diet-assistant/src/pages/DietPlan.tsx)):
   Automatically creates a detailed 7-day meal plan based on BMR (Basal Metabolic Rate) and TDEE (Total Daily Energy Expenditure) calculation, fitting user profiles and health goals.
3. **Chronic Disease Diet Planner** ([DiseaseDiet.tsx](file:///C:/Users/Baha/Downloads/NutriAI/NutriAI/artifacts/diet-assistant/src/pages/DiseaseDiet.tsx)):
   Specialized therapeutic dietary planning that automatically designs meal lists (and restrictions) for users dealing with specific health conditions (e.g., Diabetes, Hypertension).
4. **Food Calorie & Nutrition Checker** ([FoodChecker.tsx](file:///C:/Users/Baha/Downloads/NutriAI/NutriAI/artifacts/diet-assistant/src/pages/FoodChecker.tsx)):
   Allows users to search for any food item and receive calorie counts, protein/carb/fat macro distributions, health scores, and healthy food alternatives.
5. **Gamification & Rewards** ([Achievements.tsx](file:///C:/Users/Baha/Downloads/NutriAI/NutriAI/artifacts/diet-assistant/src/pages/Achievements.tsx)):
   Encourages healthy habits through experience points, level milestones, logging badges, and streak day calculations.
6. **Intermittent Fasting Tracker** ([Fasting.tsx](file:///C:/Users/Baha/Downloads/NutriAI/NutriAI/artifacts/diet-assistant/src/pages/Fasting.tsx)):
   Supports logging active fasts, target schedules (16:8, 18:6, etc.), tracking hours remaining, and history.

---

## 🔒 Authentication

The application uses **Clerk** for user sessions and security:
- Local dev environments utilize proxy configurations found in [clerkProxyMiddleware.ts](file:///C:/Users/Baha/Downloads/NutriAI/NutriAI/artifacts/api-server/src/middlewares/clerkProxyMiddleware.ts) to manage proxy routes.
- Environment variables: `VITE_CLERK_PUBLISHABLE_KEY`, `CLERK_PUBLISHABLE_KEY`, and `CLERK_SECRET_KEY` handle authorization tokens between the frontend and backend.

---

## ⚙️ Environment Variables Setup

A `.env.local` file has been created in your project root. **You must fill in your API keys** for the application to run properly:

### Step 1: Configure Clerk Authentication
1. **Create a Clerk account** at [https://clerk.com](https://clerk.com)
2. **Create a new application** in Clerk Dashboard
3. **Copy your API keys**:
   - Go to **Clerk Dashboard → API Keys**
   - Copy `CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`
4. **Update `.env.local`**:
   ```env
   CLERK_SECRET_KEY=sk_test_xxxxx
   CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
   ```

### Step 2: Configure AI Service (OpenAI or Gemini)
Choose one of the following:

#### Option A: OpenAI (Recommended)
1. Get API key from [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Add to `.env.local`:
   ```env
   AI_INTEGRATIONS_OPENAI_API_KEY=sk-proj-xxxxx
   ```

#### Option B: Google Gemini
1. Get API key from [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Add to `.env.local`:
   ```env
   GEMINI_API_KEY=AIzaSyxxx
   ```

#### Option C: Ollama (Local AI - No API Key Needed)
1. Install Ollama from [https://ollama.ai](https://ollama.ai)
2. Run: `ollama pull llama3.2`
3. Add to `.env.local`:
   ```env
   USE_OLLAMA=true
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_MODEL=llama3.2
   ```

### Step 3: Configure Database (Optional)
If using external MySQL database:
```env
DATABASE_URL=mysql://user:password@localhost:3306/nutriai
```

### Current Configuration File Location
Your `.env.local` is located at:
```
c:\Users\Baha\Downloads\NutriAI\NutriAI\.env.local
```

### Complete `.env.local` Template
```env
# === Backend Server ===
PORT=3000
NODE_ENV=development

# === Clerk Authentication (REQUIRED) ===
CLERK_SECRET_KEY=sk_test_xxxxx_replace_with_your_key
CLERK_PUBLISHABLE_KEY=pk_test_xxxxx_replace_with_your_key

# === Frontend Clerk Configuration (REQUIRED) ===
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx_replace_with_your_key
VITE_ENV=development
VITE_API_URL=http://localhost:3000

# === AI Integration: Choose ONE ===
# Option 1: OpenAI
AI_INTEGRATIONS_OPENAI_API_KEY=sk-proj-xxxxx_replace_with_your_key

# Option 2: Google Gemini
# GEMINI_API_KEY=AIzaSyxxx_replace_with_your_key

# Option 3: Ollama (Local)
# USE_OLLAMA=true
# OLLAMA_BASE_URL=http://localhost:11434
# OLLAMA_MODEL=llama3.2

# === Database (Optional - defaults to CSV storage) ===
# DATABASE_URL=mysql://root:password@localhost:3306/nutriai

# === Logging ===
LOG_LEVEL=info
```

### ✅ Validation Checklist
Before running `pnpm dev`, ensure:
- [ ] `CLERK_SECRET_KEY` is set
- [ ] `CLERK_PUBLISHABLE_KEY` is set
- [ ] `VITE_CLERK_PUBLISHABLE_KEY` is set
- [ ] At least ONE AI service key is configured (OpenAI, Gemini, or Ollama)
- [ ] `.env.local` is in the root directory (`c:\Users\Baha\Downloads\NutriAI\NutriAI\.env.local`)

### ⚠️ If You Get "503 Service Unavailable"
This usually means:
1. Missing or invalid `CLERK_PUBLISHABLE_KEY`
2. Missing AI API keys
3. Clerk authentication failed to initialize

**Solution**: Fill in all required API keys in `.env.local` and restart with `pnpm dev`

---

## 🚀 Next Steps

After configuring `.env.local`:
```bash
# Restart the development server
pnpm dev
```

Then open: [http://localhost:5173](http://localhost:5173)

---

## 🚀 Deployment on Render (Render Blueprint)

The project is fully pre-configured for a seamless deployment on [Render](https://render.com/) using a Blueprint specification file ([render.yaml](file:///c:/Users/Baha/Downloads/NutriAI/NutriAI/render.yaml)) located in the root of the project.

Render Blueprints let you deploy a fullstack application (Static Frontend + Node.js API Backend + Persistent storage disk) at once by linking your GitHub repository.

### Services Defined in Blueprint

1. **Backend Web Service (`nutriai-api`)**:
   - Environment: Node.js (Express server)
   - Port: `3000`
   - Persistent Disk: A **1GB persistent disk** mounted at `/data` (prevents data loss on deploys and restarts by preserving your CSV mock database).
   
2. **Frontend Static Site (`nutriai-client`)**:
   - Environment: Static Site hosting the compiled React SPA.
   - Publish Path: `artifacts/diet-assistant/dist/public`
   - Rewrites: Built-in Single Page Application (SPA) routing redirection (redirects `/*` to `index.html` to prevent 404 errors on browser refreshes).
   - Auto-configured environment mapping: Automatically points the frontend `VITE_API_BASE_URL` to your newly deployed backend API service URL.

### Step-by-Step Deployment Instructions

1. **Push your code to a Git repository** (GitHub or GitLab). Make sure the `render.yaml` file in the root is included in the commit.
2. **Sign in to Render** ([https://dashboard.render.com](https://dashboard.render.com/)).
3. Click **New** → **Blueprint**.
4. **Connect your GitHub/GitLab repository** containing the NutriAI project.
5. Render will automatically detect the [render.yaml](file:///c:/Users/Baha/Downloads/NutriAI/NutriAI/render.yaml) file and list the services:
   - `nutriai-api` (Web Service)
   - `nutriai-client` (Static Site)
6. **Configure the Environment Variables** inside the Render Dashboard when prompted:
   - For `nutriai-api` (Backend):
     - `CLERK_SECRET_KEY`: Your Clerk Secret Key (`sk_test_...`)
     - `CLERK_PUBLISHABLE_KEY`: Your Clerk Publishable Key (`pk_test_...`)
     - `GEMINI_API_KEY`: Your Google Gemini API Key (`AIzaSy...`)
   - For `nutriai-client` (Frontend):
     - `VITE_CLERK_PUBLISHABLE_KEY`: Your Clerk Publishable Key (`pk_test_...`)
7. Click **Apply** to deploy the services.
8. Render will compile your monorepo workspace dependencies, build the TypeScript files, configure the persistent storage disk, deploy the frontend React app, and output your live web application URLs!

---
