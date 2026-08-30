import { describe, it, expect, beforeAll } from 'vitest';
import { evidenceEngine } from '../src/lib/agent/tools/evidence-matcher';
import { ApplicationStrategistAgent, ApplicationGenerationAgent } from '../src/lib/agent/agents/specialized-agents';
import { JobHuntOrchestrator } from '../src/lib/agent/orchestrator';
import { INITIAL_CANDIDATE_PROFILE, INITIAL_JOBS } from '../src/lib/db/store';
import { Job } from '../src/lib/types';
import { seedSync } from '../src/lib/db/seed';

beforeAll(() => {
  seedSync();
});

describe('SkillPatch Adaptive Job Application Skill Validation', () => {
  const candidate = INITIAL_CANDIDATE_PROFILE;
  const strategist = new ApplicationStrategistAgent();
  const generator = new ApplicationGenerationAgent();

  // TEST A: Strong job match with verified evidence
  it('TEST A: Strong job match with verified evidence', () => {
    const job = INITIAL_JOBS[0]; // Nexus Cloud Platforms (Full Stack)
    const analysis = evidenceEngine.analyzeJobMatch(candidate, job);

    expect(analysis.overallScore).toBeGreaterThanOrEqual(85);
    const tsMatch = analysis.evidenceMap.find(e => e.requirementName.toLowerCase() === 'typescript');
    expect(tsMatch?.matchStatus).toBe('MATCHED');
    expect(tsMatch?.confidence).toBe('HIGH');

    const rec = strategist.run(analysis, job);
    expect(rec.strategy).toBe('APPLY_AND_OUTREACH');
  });

  // TEST B: Job requires a skill that the candidate does not have
  it('TEST B: Job requires a skill that the candidate does not have', () => {
    const job = INITIAL_JOBS[1]; // Cortex Automation requesting AWS
    const analysis = evidenceEngine.analyzeJobMatch(candidate, job);

    const awsMatch = analysis.evidenceMap.find(e => e.requirementName.toLowerCase().includes('aws'));
    expect(awsMatch?.matchStatus).toBe('MISSING');
    expect(awsMatch?.candidateEvidence).toContain('No direct evidence found');
  });

  // TEST C: Job contains a requirement for which candidate evidence is unknown
  it('TEST C: Job contains a requirement for which candidate evidence is unknown', () => {
    const unknownJob: Job = {
      ...INITIAL_JOBS[0],
      requirements: [
        { id: 'u1', name: 'Unspecified Domain Requirement', category: 'DOMAIN', isMandatory: false }
      ]
    };

    const analysis = evidenceEngine.analyzeJobMatch(candidate, unknownJob);
    const unknownMatch = analysis.evidenceMap.find(e => e.requirementName.includes('Unspecified'));
    expect(unknownMatch?.matchStatus).toBe('UNKNOWN');
    expect(unknownMatch?.confidence).toBe('LOW');
  });

  // TEST D: Candidate has a relevant project selected for tailored resume generation
  it('TEST D: Candidate relevant project selected for tailored resume generation', () => {
    const job = INITIAL_JOBS[0];
    const analysis = evidenceEngine.analyzeJobMatch(candidate, job);

    const tailoredResume = generator.generateTailoredResume(candidate, job, analysis);
    expect(tailoredResume.featuredProjects.length).toBeGreaterThan(0);
    expect(tailoredResume.featuredProjects[0].title).toBe('Agentic Workflow Copilot');
    expect(tailoredResume.featuredProjects[0].bulletPoints.length).toBeGreaterThan(0);
  });

  // TEST E: Cold-email generation must remain grounded in verified evidence
  it('TEST E: Cold-email generation grounded in verified evidence', () => {
    const job = INITIAL_JOBS[0];
    const analysis = evidenceEngine.analyzeJobMatch(candidate, job);

    const email = generator.generateColdEmail(candidate, job, analysis);
    expect(email.body).toContain(candidate.fullName);
    expect(email.body).toContain(candidate.projects[0].title);
    expect(email.whyGenerated.candidateEvidence).toBeDefined();
  });

  // TEST F: Outreach must enter human approval before sending
  it('TEST F: Outreach enters human approval before sending', async () => {
    const orchestrator = new JobHuntOrchestrator();
    const session = await orchestrator.executeJobPipeline(INITIAL_JOBS[0].id);

    expect(session.status).toBe('WAITING_APPROVAL');
    expect(session.requiresApproval).toBe(true);

    const pausedTrace = session.traces.find(t => t.status === 'PAUSED');
    expect(pausedTrace?.details).toContain('explicit user approval');
  });
});
