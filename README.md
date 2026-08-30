# Agentic Job Hunt Copilot

> **An Autonomous Job Hunt Operating System — Multi-Agent Orchestration, Neo4j Knowledge Graph, Gemini Graph RAG, Real Job Scraping & Human-in-the-Loop Gatekeeping**

[![Tests](https://img.shields.io/badge/tests-8%2F8%20passing-brightgreen)]()
[![Next.js](https://img.shields.io/badge/Next.js-15-black)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)]()
[![Auth](https://img.shields.io/badge/Auth-NextAuth.js%20v5-orange)]()
[![Status](https://img.shields.io/badge/Status-In%20Development-yellow)]()

> [!WARNING]
> **Work in Progress:** This project is currently in active development. Features, APIs, and database schemas are subject to change.

---

## 📌 Problem & Solution

Students and job seekers face repetitive application processes, generic ATS resume screeners, and ineffective cold outreach. Traditional tools either hallucinate credentials or force tedious manual tracking.

**Agentic Job Hunt Copilot** transforms the job hunt into a fully autonomous, evidence-grounded, multi-agent workflow:

- 🔍 **Real Job Discovery**: Scrapes live job listings from RemoteOK, Hacker News "Who's Hiring", and Adzuna (10M+ jobs globally)
- 🧠 **Neo4j Knowledge Graph**: Candidate skills, projects, and experience stored as graph nodes — multi-hop Cypher traversal finds evidence paths far beyond simple string matching
- 🤖 **Gemini Graph RAG**: Grounded AI generation using verified graph evidence — resumes and cold emails backed by facts, not hallucinations
- 📋 **Evidence-Backed Matching**: Cross-references job requirements against verified candidate resume evidence — preventing fabricated claims
- ⚡ **Explainable Strategy Engine**: Decides whether to `APPLY`, `APPLY_AND_OUTREACH`, `OUTREACH`, or `SKIP` based on evidence coverage score
- 📧 **Real SMTP Email Sending**: Cold outreach sent via Gmail SMTP + App Password using Nodemailer — no fake simulation
- 🔐 **Authentication**: Secure multi-user login/signup via NextAuth.js v5 (Credentials + Google OAuth)
- 🗄️ **Persistent SQLite Database**: All candidate data, jobs, applications, traces stored permanently via Drizzle ORM
- ⏸️ **Human-in-the-Loop Control**: Agents autonomously research, plan, and draft — but strictly pause for user approval before any external action

---

## 🤖 Agent Architecture

```
                       ┌──────────────────────────────┐
                       │    Job Hunt Orchestrator     │
                       └──────────────┬───────────────┘
                                      │
          ┌───────────────────┬───────┴───────────┬───────────────────┐
          ▼                   ▼                   ▼                   ▼
   Career Profile      Opportunity        Job Intelligence        Skill Gap
       Agent         Discovery Agent           Agent                Agent
                           │
                    ┌──────┴───────┐
                    ▼              ▼             ▼
              RemoteOK       HN Hiring       Adzuna API
              Scraper         Scraper         (10M+ jobs)
                    └──────┬───────┘
                           ▼
                  ┌─────────────────────┐
                  │   SQLite Database   │ ← Persistent job storage
                  └──────────┬──────────┘
                             │
                  ┌──────────▼──────────┐
                  │  Neo4j Graph RAG   │ ← Multi-hop evidence traversal
                  │  Evidence Engine   │
                  └──────────┬──────────┘
                             │
                  ┌──────────▼──────────┐
                  │  Gemini 1.5 Flash  │ ← Grounded AI generation
                  └──────────┬──────────┘
                             ▼
                  ┌─────────────────────┐
                  │  Strategist Agent  │ → APPLY / OUTREACH / SKIP
                  └──────────┬──────────┘
                             ▼
                  ┌─────────────────────┐
                  │  Generation Agent  │ → Tailored Resume + Cold Email
                  └──────────┬──────────┘
                             ▼
                  ┌─────────────────────┐
                  │ Human Approval Gate │ ⏸ Explicit user approval
                  └──────────┬──────────┘
                             ▼
                  ┌─────────────────────┐
                  │  SMTP Email Send   │ → Real Gmail delivery
                  └─────────────────────┘
```

---

## ⚙️ Core Features

### 1. 🔐 Authentication (`auth.ts`, `auth.config.ts`, `middleware.ts`)
- NextAuth.js v5 with **Credentials** (email + bcrypt) and **Google OAuth**
- Route protection middleware — all pages and API routes require login
- Auto user creation for Google sign-ins
- Login/signup pages with premium dark-themed UI

### 2. 🗄️ Persistent SQLite Database (`src/lib/db/`)
- Replaced in-memory store with **SQLite + Drizzle ORM**
- Tables: `users`, `candidate_profiles`, `jobs`, `applications`, `agent_traces`, `skill_gaps`
- Auto-seeded with demo candidate profile and initial jobs on first run
- All data survives server restarts

### 3. 🕸️ Neo4j Knowledge Graph (`src/lib/graph/`)
- Candidate synced as graph: `Candidate → Skill → Project → Experience`
- Jobs synced as: `Job → Requirement → Skill`
- Cypher multi-hop traversal finds evidence paths between requirements and candidate proof
- Falls back gracefully to string-matching if Neo4j is unavailable

### 4. 🤖 Gemini Graph RAG (`src/lib/ai/`)
- `gemini-3.6-flash` model with retry logic (3 attempts, exponential backoff)
- Graph context injected into prompts — grounded in verified evidence only
- Upgrades resume and cold email generation from templates → AI-generated
- Shows `✨ AI Generated` badge vs `📋 Template Generated` in UI
- Graceful fallback when `GEMINI_API_KEY` is not set

### 5. 🔍 Job Scraper (`src/lib/scraper/`)
- **RemoteOK**: Free JSON API — remote tech jobs
- **HN "Who's Hiring"**: Cheerio-parsed startup jobs from Hacker News
- **Adzuna**: Free API — India 🇮🇳, US 🇺🇸, UK 🇬🇧 structured job listings
- Auto-extracts tech requirements from job descriptions (TypeScript, React, Python, Docker, AWS, etc.)
- Deduplicates by `sourceUrl` — no repeat jobs in DB
- "🔍 Discover New Jobs" button on Jobs page

### 6. 📧 SMTP Email (`src/lib/email/`)
- Real Gmail delivery via Nodemailer + App Password
- HTML email template with candidate links
- **DEMO MODE**: If SMTP not configured, logs full email to console and returns `SENT`
- Status tracking: `PENDING_APPROVAL → APPROVED → SENT`

### 7. 📋 Resume Upload & Grounding
- Upload PDF/DOCX with staged UI (`Uploading → Parsing → Extracting → Ready`)
- Parsed evidence becomes the source of truth for all agent decisions

### 8. ⏸️ Human-in-the-Loop Safety
- Agent pipeline pauses after drafting — never auto-sends
- Explicit user approval required before any external action
- Full audit trail via `agent_traces` table

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 App Router, TypeScript 5 |
| **Styling** | Tailwind CSS v4 |
| **Authentication** | NextAuth.js v5 (Credentials + Google OAuth) |
| **Database** | SQLite + Drizzle ORM |
| **Knowledge Graph** | Neo4j + Cypher multi-hop traversal |
| **AI / LLM** | Google Gemini 3.6 Flash (Graph RAG) |
| **Email** | Nodemailer + Gmail SMTP App Password |
| **Job Scraping** | Cheerio + Axios (RemoteOK, HN Hiring, Adzuna) |
| **Testing** | Vitest — 8/8 passing |
| **Agent Engine** | Custom Multi-Agent Orchestrator (TypeScript) |

---

## 🚀 Quickstart

### Prerequisites
- Node.js v18+
- npm
- Neo4j Desktop (installed locally) **OR** Neo4j AuraDB free account — optional, falls back to string matching
- Google Gemini API key (free at [aistudio.google.com](https://aistudio.google.com)) — optional, falls back to templates
- Adzuna API credentials (free at [developer.adzuna.com](https://developer.adzuna.com)) — optional

### 1. Clone & Install
```bash
git clone https://github.com/Vakula72/BuildSprint---Fantastic-Four.git
cd BuildSprint---Fantastic-Four
npm install --legacy-peer-deps
```

### 2. Configure `.env.local`
```env
# NextAuth (required — generate with: openssl rand -hex 32)
AUTH_SECRET=your_random_32_char_secret_here
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (optional — console.cloud.google.com)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Neo4j Knowledge Graph (optional — falls back to string matching)
# Option A: Local Neo4j Desktop
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_neo4j_desktop_password

# Option B: Neo4j AuraDB (cloud free tier — neo4j.com/cloud/aura)
# NEO4J_URI=neo4j+s://xxxxxxxx.databases.neo4j.io
# NEO4J_USERNAME=neo4j
# NEO4J_PASSWORD=your_aura_password

# Gemini AI (optional — aistudio.google.com → Get API Key)
GEMINI_API_KEY=your_gemini_api_key

# SMTP Email (optional — Gmail: myaccount.google.com → Security → App Passwords)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_APP_PASSWORD=xxxx xxxx xxxx xxxx

# Adzuna Job Scraper (optional — developer.adzuna.com → Free signup)
ADZUNA_APP_ID=your_app_id
ADZUNA_API_KEY=your_api_key
```

### 3. Neo4j Desktop Setup (Local)
If using Neo4j Desktop:
1. Open **Neo4j Desktop** → start your database instance
2. Default connection: `bolt://localhost:7687`
3. Open Neo4j Browser at `http://localhost:7474` to verify it's running
4. Trigger graph sync after starting the server:
```bash
curl -X POST http://localhost:3000/api/graph/sync
```

### 4. Run Tests
```bash
npx vitest run
# ✓ 8/8 tests passing
```

### 5. Start Dev Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — sign up, then explore the full agent workflow.


---

## 📁 Project Structure

```
├── auth.ts                          # NextAuth main config
├── auth.config.ts                   # Provider + callback config
├── middleware.ts                    # Route protection
├── drizzle.config.ts               # DB migration config
└── src/
    ├── app/
    │   ├── (auth)/login/            # Login page
    │   ├── (auth)/signup/           # Signup page
    │   ├── api/
    │   │   ├── auth/[...nextauth]/  # NextAuth handler
    │   │   ├── agent/              # run, approve, send-demo
    │   │   ├── ai/generate/        # Gemini RAG endpoint
    │   │   ├── graph/sync/         # Neo4j sync trigger
    │   │   ├── scraper/run/        # Job scraper trigger
    │   │   ├── jobs/               # Job listings
    │   │   ├── applications/       # Application tracker
    │   │   ├── profile/            # Candidate profile
    │   │   └── resume/upload/      # Resume upload + parse
    │   ├── jobs/                   # Jobs listing + [id] detail
    │   ├── applications/           # Application tracker
    │   ├── profile/                # Candidate profile editor
    │   ├── skills/                 # Skill gap insights
    │   └── activity/               # Agent trace log
    ├── components/
    │   ├── layout/                 # Header, Sidebar, Nav, ContextPanel
    │   └── ui/                     # icons.tsx
    └── lib/
        ├── agent/
        │   ├── orchestrator.ts     # JobHuntOrchestrator
        │   ├── agents/             # 7 specialized agents
        │   └── tools/              # Evidence matcher, email service
        ├── ai/
        │   ├── gemini.ts           # Gemini client + retry logic
        │   └── graph-rag.ts        # Graph RAG engine
        ├── db/
        │   ├── client.ts           # SQLite + Drizzle init
        │   ├── schema.ts           # Table definitions
        │   ├── seed.ts             # Demo data seeding
        │   └── store.ts            # DataStore (Drizzle-backed)
        ├── graph/
        │   ├── client.ts           # Neo4j driver
        │   ├── schema.ts           # Graph node/relationship model
        │   ├── sync.ts             # Profile/job → graph sync
        │   └── evidence-graph.ts   # Cypher-based evidence matcher
        ├── email/
        │   └── sendColdEmail.ts    # SMTP + DEMO MODE fallback
        ├── scraper/
        │   ├── index.ts            # JobScraperService
        │   ├── requirement-extractor.ts
        │   └── sources/
        │       ├── remoteok.ts     # RemoteOK API
        │       ├── hnhiring.ts     # HN Hiring (Cheerio)
        │       └── adzuna.ts       # Adzuna API
        └── types/                  # TypeScript interfaces
```

---

## 🧪 Test Results

```bash
npx vitest run

stdout | Checking database seed status...
✓ tests/agent.test.ts  (6 tests)
✓ tests/routes.test.ts (2 tests)

Test Files: 2 passed
Tests:      8 passed ✅
Duration:   ~1.5s
```

---

## 📋 Version History

### v0.4.0 – Production Stability & Graph RAG Hardening (Aug 30, 2026)
- 🚀 **Neo4j Graph RAG Unblocked**: Fixed local TLS encryption and authentication mismatch bugs allowing local Neo4j Desktop to successfully execute Cypher evidence extraction.
- 🚀 **Resume AI Parser Upgrade**: Updated Gemini prompt schemas to strictly enforce real resume data over mock templates, properly parsing `skillsUsed` and `highlights`.
- 🚀 **Fallback Resilience**: Hardened the `EvidenceMatcherEngine` against corrupted AI JSON payloads by employing safe optional chaining.
- 🚀 **UI Rendering Fixes**: Implemented automatic HTML stripping in job previews and fixed React runtime `.map()` crashes by ensuring empty-array fallbacks.
- 🚀 **PDF Parsing Integration**: Resolved Node.js runtime errors by correctly configuring `serverExternalPackages` for the `pdf-parse` library in Next.js 15.
- 🚀 **Seed Data Integrity**: Fixed the SQLite local database seeder to accurately parse and seed B.Tech degree formats for engineering candidates.

### v0.3.0 — AI + Scraper Layer (Aug 30, 2026)
- ✅ **Gemini 3.6 Flash**: Graph RAG engine for grounded resume + email generation
- ✅ **Job Scraper**: RemoteOK, HN Hiring, Adzuna — real live job discovery
- ✅ **AI Generated badges**: UI shows whether content was AI or template generated
- ✅ **Requirement Extractor**: Auto-detects 30+ tech skills from job descriptions
- ✅ **DEMO MODE email**: Console fallback when SMTP not configured
- ✅ Fixed: Next.js 15 `searchParams` async breaking change in login page
- ✅ Fixed: Replaced `uuid` package with `crypto.randomUUID()` (built-in)

### v0.2.0 — Backend Infrastructure (Aug 30, 2026)
- ✅ **SQLite + Drizzle ORM**: Persistent database replacing in-memory store
- ✅ **NextAuth.js v5**: Full auth (credentials + Google OAuth)
- ✅ **Route Protection**: Middleware securing all pages and API routes
- ✅ **Neo4j Knowledge Graph**: Cypher multi-hop evidence matching
- ✅ **Login/Signup Pages**: Premium dark-themed auth UI
- ✅ **Header**: User session display + sign out button

### v0.1.0 — Initial Release (Aug 28, 2026)
- ✅ Multi-agent orchestration engine (7 agents)
- ✅ Evidence-backed resume generation
- ✅ Cold email generation with human approval gate
- ✅ Interactive dashboard with dynamic metrics
- ✅ Resume upload and parsing workflow
- ✅ Skill gap analysis and tracking
- ✅ Agent activity trace log
