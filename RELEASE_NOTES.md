# Agentic Job Hunt Copilot - Release Notes

## Overview
Full data, resume ingestion, tailored document generation, email routing, and demo send workflow upgrade.

## Key Changes
1. **Centralized Email Routing Constants**:
   - `DEMO_CANDIDATE_EMAIL` = `alex.morgan.demo@example.com`
   - `DEMO_RECRUITER_EMAIL` = `vakulasri_godavarthi@srmap.edu.in`
   - Centralized in `src/lib/types/index.ts` & `src/lib/db/store.ts`. `vakulasri_godavarthi@srmap.edu.in` is strictly used as the demo recruiter contact and never displayed as candidate data.

2. **Resume Ingestion & Project Evidence**:
   - Structured parsing extracts Candidate Header, Summary, Skills, Work Experience, Education, and verified Projects (`Agentic Workflow Copilot`, `Distributed Log Streaming Engine`, `E-Commerce Microservices Platform`).

3. **Full Tailored Resume with Featured Projects**:
   - Constructs a complete resume document featuring a prominent `Featured Projects Evidence` section.
   - Intelligent priority ordering: AI/Agentic roles prioritize `Agentic Workflow Copilot`, Backend/Systems roles prioritize `Distributed Log Streaming Engine`, and Full-Stack roles prioritize `Agentic Workflow Copilot` + `E-Commerce Microservices`.
   - Includes a `TAILORING TRANSFORMATION SUMMARY` banner listing skills emphasized and projects prioritized.
   - Supports switching between `Tailored Resume` vs `Original Resume` and clean printing/downloading (`window.print()`).

4. **Personalized Cold Email & Demo Send Simulation**:
   - Cold Email UI clearly displays:
     - `FROM:` `alex.morgan.demo@example.com`
     - `TO:` `vakulasri_godavarthi@srmap.edu.in`
   - Human-in-the-Loop workflow state: `PENDING_APPROVAL` -> `APPROVED` -> `SENT_DEMO`.
   - Clicking `[ Queue / Send Email (Demo) ]` transitions status to `SENT — DEMO` and logs `demoSentAt`.
   - Interactive `[ View Sent Email Preview ]` modal allows viewing the complete outreach record.

5. **Dynamic Dashboard Metrics**:
   - Metric cards derive counts dynamically from actual DB application state and navigate directly to filtered routes (`/jobs`, `/applications?filter=PENDING_APPROVAL`, `/applications?filter=APPROVED`, `/applications?filter=SENT_DEMO`).

6. **Agent Activity Trace**:
   - Records real execution events for resume parsing, project evidence extraction, pipeline orchestration, human approval, and demo email send simulation.

## Validation
- `npx vitest run`: Passed 4/4 unit tests.
- `npx next build`: 18/18 static and dynamic routes compiled with 0 errors.
