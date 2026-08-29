---
name: adaptive-job-application
description: Evaluates candidate-job match, determines application strategy (APPLY, APPLY_AND_OUTREACH, OUTREACH, SKIP), generates full tailored resumes and cold outreach templates grounded in verified candidate evidence without hallucinating skills or experience. Use when evaluating job descriptions, matching candidate evidence, identifying skill gaps, tailoring resumes, drafting cold emails, or preparing career application workflows. [Differentiator: strictly grounds claims in verified candidate projects/experience and requires explicit human approval for outreach].
modified: 2026-08-29
---

# Adaptive Job Application Skill

## Overview
This skill provides procedural rules, evidence classification standards, strategy matrices, and anti-hallucination safeguards for evaluating software engineering opportunities and generating tailored application artifacts.

---

## Workflow Execution Steps

### Step 1: Candidate Evidence Grounding
Parse primary candidate evidence from uploaded resume text, work experience, projects, and skills.
- Categorize evidence into:
  1. **Direct Experience**: Paid roles, internships, degrees.
  2. **Project Proof**: GitHub repositories, deployed apps, specific technical metrics.
  3. **Self-Reported Skills**: Listed skills with proficiency levels.

### Step 2: Requirement Analysis & Evidence Mapping
For every extracted job requirement, assign one of four explicit match statuses:
- **MATCHED (VERIFIED)**: Verified evidence present in candidate's work experience or projects.
- **PARTIAL**: Self-reported skill or related project experience with medium confidence.
- **MISSING**: Job requirement is explicitly not present in candidate evidence.
- **UNKNOWN**: Ambiguous requirement or insufficient candidate information to evaluate.

> **CRITICAL RULE**: Never present an inference or missing skill as a verified fact.

### Step 3: Strategy Matrix
Calculate overall match score and determine application strategy:
- `Match Score >= 85%` with no missing mandatory requirements → **APPLY_AND_OUTREACH**
- `Match Score 70% – 84%` → **APPLY**
- `Match Score < 70%` with direct contact available → **OUTREACH**
- `Match Score < 70%` without contact → **SKIP**

### Step 4: Tailored Resume Artifact Generation
Construct a complete tailored resume including:
1. **Candidate Header**: Full name, email, phone, location, links.
2. **Tailored Professional Summary**: Aligned to target role without inventing achievements.
3. **Categorized Skills**: Target job skills prioritized first.
4. **Featured Projects**: Prioritize relevant verified projects (e.g. AI roles prioritize Agentic Copilot; Backend roles prioritize Log Streaming Engine).
5. **Work Experience**: Reordered and bullet-emphasized based on verified metrics.
6. **Education**: Degree, field, institution, graduation year.

### Step 5: Cold Outreach Message Template
Construct a personalized cold email referencing verified candidate evidence and company context.
- **Sender**: Candidate email identity (`alex.morgan.demo@example.com`).
- **Recipient**: Recruiter contact (`vakulasri_godavarthi@srmap.edu.in`).
- **Anti-Hallucination Check**: Only reference verified projects and achievements present in candidate evidence.

### Step 6: Human Approval Gate
Hold all outreach in `PENDING_APPROVAL` status until explicit user authorization (`APPROVED` → `SENT`).

---

## Verification & Validation Checklist
- [ ] Every job requirement classified as `MATCHED`, `PARTIAL`, `MISSING`, or `UNKNOWN`.
- [ ] Zero invented skills, companies, dates, or metrics.
- [ ] Featured projects intelligently prioritized according to target job domain.
- [ ] Cold outreach message template is grounded in candidate evidence.
- [ ] Consequential outreach action paused for explicit human review.
