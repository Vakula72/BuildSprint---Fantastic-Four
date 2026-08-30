# Agentic Job Hunt Copilot

> **An Autonomous Job Hunt Operating System with Resume Upload, Evidence-Backed Personalization, Knowledge Graph Intelligence & Human-in-the-Loop Gatekeeping**

---

## 📌 Problem & Solution

Students and job seekers face repetitive application processes, generic ATS resume screeners, and ineffective cold outreach. Traditional tools either generate generic hallucinated emails or force manual tracking.

**Agentic Job Hunt Copilot** transforms the job hunt into a goal-driven multi-agent workflow:
- **Resume Upload & Grounding**: Upload PDF/DOCX resumes parsed into structured evidence (Name, Email, Skills, Experience, Projects).
- **Evidence-Backed Matching**: Cross-references job description requirements against verified candidate resume projects and work experience — preventing hallucinated claims.
- **Neo4j Knowledge Graph**: Candidate skills, projects, and experience are stored as a graph. Multi-hop graph traversal powers intelligent evidence matching far beyond simple string comparison.
- **Explainable Strategy Engine**: Dynamically decides whether to `APPLY`, `APPLY_AND_OUTREACH`, `OUTREACH`, or `SKIP` based on evidence coverage.
- **Full Tailored Resume & Cold Outreach Workflow**: Generates complete role-specific resumes and cold emails grounded in verified candidate evidence.
- **Human-in-the-Loop Control**: Autonomously researches, plans, and drafts, but strictly **pauses for user review and explicit approval** before any external action or cold outreach.
- **Real SMTP Email Sending**: Cold outreach emails sent via Gmail SMTP with App Password — no fake simulation.
- **Authentication**: Secure multi-user login/signup via NextAuth.js (Credentials + Google OAuth).
- **Persistent SQLite Database**: All candidate data, jobs, applications, and agent traces stored persistently via Drizzle ORM.
- **Interactive Dashboard & Tracking**: Dynamic clickable metric cards connected directly to application state, filtering pending approvals and approved outreach.

---

## 🤖 Primary Agent Architecture

```
                       ┌──────────────────────────────┐
                       │    Job Hunt Orchestrator     │
                       └──────────────┬───────────────┘
                                      │
          ┌───────────────────┬───────┴───────────┬───────────────────┐
          ▼                   ▼                   ▼                   ▼
   Career Profile      Opportunity        Job Intelligence        Skill Gap
       Agent         Discovery Agent           Agent                Agent
          │                   │                   │                   │
          └───────────────────┴───────┬───────────┴───────────────────┘
                                      ▼
                           ┌─────────────────────┐
                           │  Neo4j Graph RAG    │ ──► [Multi-hop Evidence Traversal]
                           │  Evidence Engine    │
                           └──────────┬──────────┘
                                      ▼
                           ┌─────────────────────┐
                           │ Strategist Agent    │ ──► [APPLY / OUTREACH / SKIP]
                           └──────────┬──────────┘
                                      ▼
                           ┌─────────────────────┐
                           │ Generation Agent    │ ──► [Full Tailored Resume + Cold Email]
                           └──────────┬──────────┘
                                      ▼
                           ┌─────────────────────┐
                           │ Human Approval Gate │ ⏸ (Explicit User Approval Required)
                           └──────────┬──────────┘
                                      ▼
                           ┌─────────────────────┐
                           │ Memory / Feedback   │ ──► [Outcome Tracker & Adaptive Skill Trends]
                           └──────────┴──────────┘
```

---

## ⚙️ Core Workflow Capabilities

### 1. Authentication & Multi-User Support (`auth.ts`, `auth.config.ts`, `middleware.ts`)
- Secure login/signup with **NextAuth.js v5** (beta).
- **Credentials provider**: Email + bcrypt-hashed password.
- **Google OAuth provider**: One-click sign-in.
- Route protection via `middleware.ts` — all pages require authentication.
- Auto user creation for OAuth sign-ins.

### 2. Persistent SQLite Database (`src/lib/db/`)
- Replaces in-memory store with **SQLite + Drizzle ORM**.
- Tables: `users`, `candidate_profiles`, `jobs`, `applications`, `agent_traces`, `skill_gaps`.
- All data persists across server restarts.
- Seeded with demo candidate profile and initial job listings on first run.

### 3. Neo4j Knowledge Graph (`src/lib/graph/`)
- Candidate profile synced as graph nodes: `Candidate`, `Skill`, `Project`, `Experience`.
- Job requirements synced as: `Job`, `Requirement` nodes.
- Relationships: `HAS_SKILL`, `BUILT`, `WORKED_AT`, `USES`, `REQUIRES`, `MAPS_TO`, `SATISFIES`.
- **Graph evidence traversal** replaces string matching — Cypher multi-hop queries find paths between requirements and candidate evidence.
- Falls back to string-based matching if Neo4j is unavailable.

### 4. Resume Upload & Source of Truth (`src/app/profile/page.tsx` & `/api/resume/upload`)
- Upload PDF/DOCX resumes with automated parsing stages (`Uploading...` → `Parsing...` → `Extracting evidence...` → `Ready`).
- Stores resume metadata and updates Candidate Profile without inventing unverified qualifications.

### 5. Full Tailored Resume Generation (`src/app/jobs/[id]/page.tsx`)
- Constructs complete resume documents featuring Candidate Header, Professional Summary, Technical Skills Alignment, Relevant Work Experience, and Featured Projects.
- Side-by-side or toggle view comparing `ORIGINAL RESUME` vs `TAILORED RESUME` with print/download functionality.

### 6. Personalized Cold Email & Real SMTP Sending
- Candidate Sender Identity: Configured via `SMTP_USER` env var.
- Real email delivery via Gmail SMTP + App Password using Nodemailer.
- Demo fallback: logs email to console if SMTP not configured.

### 7. Human-in-the-Loop Safety & Explicit Approval
- Action state transitions from `PENDING_APPROVAL` → `APPROVED` → `SENT` upon user authorization.

### 8. Clickable Dynamic Dashboard
- Dashboard metrics derive dynamically from SQLite database state:
  - **Discovered Opportunities** → `/jobs`
  - **Pending Approvals** → `/applications?filter=PENDING_APPROVAL`
  - **Approved Outreach** → `/applications?filter=APPROVED`
  - **Total Applications** → `/applications`

---

## 🚀 Quickstart (Local Development)

### Prerequisites
- Node.js (v18+)
- npm
- Neo4j AuraDB account (free) — optional, falls back to string matching

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd agentic-job-hunt-copilot
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root:
```env
# NextAuth
AUTH_SECRET=your_random_32_char_secret
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Neo4j (optional — falls back to string matching)
NEO4J_URI=neo4j+s://your-instance.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_password

# SMTP Email (optional — falls back to console log)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

### 3. Run Automated Unit Tests
```bash
npx vitest run
```

### 4. Start Local Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Sign up for a new account to get started.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router, TypeScript) |
| **Styling** | Tailwind CSS v4 |
| **Authentication** | NextAuth.js v5 (Credentials + Google OAuth) |
| **Database** | SQLite + Drizzle ORM |
| **Knowledge Graph** | Neo4j (graph traversal evidence matching) |
| **Email** | Nodemailer (Gmail SMTP + App Password) |
| **Testing** | Vitest (8 tests passing) |
| **Icons** | Custom SVG UI icons (`src/components/ui/icons.tsx`) |
| **Agent Architecture** | Custom Multi-Agent Orchestration Engine |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/login/         # Login page (NextAuth)
│   ├── (auth)/signup/        # Signup page
│   ├── api/
│   │   ├── auth/[...nextauth]/ # NextAuth handler
│   │   ├── agent/            # Agent run, approve, send-demo
│   │   ├── graph/sync/       # Neo4j sync trigger
│   │   ├── jobs/             # Job listings API
│   │   ├── applications/     # Applications API
│   │   ├── profile/          # Candidate profile API
│   │   └── resume/upload/    # Resume upload API
│   ├── jobs/                 # Job listings + [id] detail
│   ├── applications/         # Applications tracker
│   ├── profile/              # Candidate profile
│   ├── skills/               # Skill gap insights
│   └── activity/             # Agent trace log
├── components/
│   ├── layout/               # Header, Sidebar, Navigation, ContextPanel
│   └── ui/                   # icons.tsx
└── lib/
    ├── agent/
    │   ├── orchestrator.ts   # JobHuntOrchestrator
    │   ├── agents/           # 7 specialized agents
    │   └── tools/            # Evidence matcher, email service
    ├── db/
    │   ├── client.ts         # SQLite + Drizzle client
    │   ├── schema.ts         # Database schema
    │   ├── seed.ts           # Initial data seeding
    │   └── store.ts          # DataStore (Drizzle-backed)
    ├── graph/
    │   ├── client.ts         # Neo4j driver
    │   ├── schema.ts         # Graph node/relationship definitions
    │   ├── sync.ts           # Candidate/job → graph sync
    │   └── evidence-graph.ts # Graph-based evidence matcher
    ├── email/                # Nodemailer SMTP service
    └── types/                # TypeScript interfaces
auth.ts                       # NextAuth main config
auth.config.ts                # NextAuth provider config
middleware.ts                 # Route protection middleware
```

---

## 🧪 Test Results

```bash
npx vitest run

✓ tests/agent.test.ts (6 tests)
✓ tests/routes.test.ts (2 tests)

Test Files: 2 passed
Tests:      8 passed
```

---

## 📋 Update History

### v0.2.0 — Backend Infrastructure (Aug 30, 2026)
- ✅ **SQLite + Drizzle ORM**: Replaced in-memory store with persistent database
- ✅ **NextAuth.js v5**: Full authentication (credentials + Google OAuth)
- ✅ **Route Protection**: Middleware protecting all pages and API routes
- ✅ **Neo4j Knowledge Graph**: Graph-based evidence matching with Cypher traversal
- ✅ **Login/Signup Pages**: Premium dark-themed auth UI
- ✅ **Header Updated**: User session display + sign out button
- ✅ **8/8 Tests Passing**: All unit tests preserved and passing

### v0.1.0 — Initial Release (Aug 28, 2026)
- ✅ Multi-agent orchestration engine (7 agents)
- ✅ Evidence-backed resume generation
- ✅ Cold email generation with human approval gate
- ✅ Interactive dashboard with dynamic metrics
- ✅ Resume upload and parsing workflow
- ✅ Skill gap analysis and tracking
- ✅ Agent activity trace log
