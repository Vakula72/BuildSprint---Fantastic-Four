# Agentic Job Hunt Copilot

> **An Autonomous Job Hunt Operating System with Resume Upload, Evidence-Backed Personalization & Human-in-the-Loop Gatekeeping**

---

## 📌 Problem & Solution

Students and job seekers face repetitive application processes, generic ATS resume screeners, and ineffective cold outreach. Traditional tools either generate generic hallucinated emails or force manual tracking.

**Agentic Job Hunt Copilot** transforms the job hunt into a goal-driven multi-agent workflow:
- **Resume Upload & Grounding**: Upload PDF/DOCX resumes parsed into structured evidence (Name, Email, Skills, Experience, Projects).
- **Evidence-Backed Matching**: Cross-references job description requirements against verified candidate resume projects and work experience—preventing hallucinated claims.
- **Explainable Strategy Engine**: Dynamically decides whether to `APPLY`, `APPLY_AND_OUTREACH`, `OUTREACH`, or `SKIP` based on evidence coverage.
- **Full Tailored Resume & Cold Outreach Workflow**: Generates complete role-specific resumes and cold emails (`FROM: vakulasri_godavarthi@srmap.edu.in`) grounded in verified candidate evidence.
- **Human-in-the-Loop Control**: Autonomously researches, plans, and drafts, but strictly **pauses for user review and explicit approval** before any external action or cold outreach.
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
                           │ Evidence Match Engine│
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

### 1. Resume Upload & Source of Truth (`src/app/profile/page.tsx` & `/api/resume/upload`)
- Upload PDF/DOCX resumes with automated parsing stages (`Uploading...` -> `Parsing...` -> `Extracting evidence...` -> `Ready`).
- Stores resume metadata and updates Candidate Profile without inventing unverified qualifications.

### 2. Full Tailored Resume Generation (`src/app/jobs/[id]/page.tsx`)
- Constructs complete resume documents featuring Candidate Header, Professional Summary, Technical Skills Alignment, Relevant Work Experience, and Featured Projects.
- Side-by-side or toggle view comparing `ORIGINAL RESUME` vs `TAILORED RESUME` with print/download functionality.

### 3. Personalized Cold Email & Recruiter Contact
- Candidate Sender Identity: `vakulasri_godavarthi@srmap.edu.in`.
- Recruiter Recipient: Direct recruiter contact email or `Recruiter email not available` with an `[ Add Recipient ]` input.

### 4. Human-in-the-Loop Safety & Explicit Approval
- Action state transitions from `PENDING_APPROVAL` to `APPROVED` upon user authorization.
- Displays `DEMO MODE: Email approved and simulated successfully`.

### 5. Clickable Dynamic Dashboard
- Dashboard metrics derive dynamically from database state and navigate directly to filtered tracking routes:
  - **Discovered Opportunities** -> `/jobs`
  - **Pending Approvals** -> `/applications?filter=PENDING_APPROVAL`
  - **Approved Outreach** -> `/applications?filter=APPROVED`
  - **Total Applications** -> `/applications`

---

## 🚀 Quickstart (Local Development)

### Prerequisites
- Node.js (v18+)
- npm

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd agentic-job-hunt-copilot
npm install
```

### 2. Run Automated Unit Tests
```bash
npx vitest run
```

### 3. Start Local Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Tech Stack
- **Framework**: Next.js 15 (App Router, TypeScript)
- **Styling**: Tailwind CSS
- **Testing**: Vitest
- **Icons**: Custom SVG UI icons (`src/components/ui/icons.tsx`)
- **Agent Architecture**: Custom Multi-Agent Orchestration Engine with In-Memory Data Store
