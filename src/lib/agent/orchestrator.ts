import { db } from '@/lib/db/store';
import { evidenceEngine } from '@/lib/agent/tools/evidence-matcher';
import { sendColdEmailServer } from '@/lib/email/sendColdEmail';
import {
  CareerProfileAgent,
  OpportunityDiscoveryAgent,
  JobIntelligenceAgent,
  SkillGapAgent,
  ApplicationStrategistAgent,
  ApplicationGenerationAgent,
  MemoryFeedbackAgent
} from '@/lib/agent/agents/specialized-agents';
import { AgentRunSession, AgentActivityTrace, JobApplicationRecord, DEMO_CANDIDATE_EMAIL, DEMO_RECRUITER_EMAIL } from '@/lib/types';

export class JobHuntOrchestrator {
  private profileAgent = new CareerProfileAgent();
  private discoveryAgent = new OpportunityDiscoveryAgent();
  private intelligenceAgent = new JobIntelligenceAgent();
  private skillGapAgent = new SkillGapAgent();
  private strategistAgent = new ApplicationStrategistAgent();
  private generationAgent = new ApplicationGenerationAgent();
  private memoryAgent = new MemoryFeedbackAgent();

  public async executeJobPipeline(jobId: string, customInstruction?: string, userId?: string): Promise<AgentRunSession> {
    const workflowId = `wf_${Date.now()}`;
    const job = db.getJobById(jobId);
    if (!job) {
      throw new Error(`Job with ID ${jobId} not found.`);
    }

    const candidate = db.getProfile(userId);
    const traces: AgentActivityTrace[] = [];

    const logTrace = (agentName: string, task: string, status: AgentActivityTrace['status'], details: string, toolUsed?: string) => {
      const trace: AgentActivityTrace = {
        id: `tr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        workflowId,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        agentName,
        task,
        status,
        details,
        toolUsed
      };
      traces.push(trace);
      db.addTrace(trace, userId);
      return trace;
    };

    logTrace('Job Hunt Orchestrator', 'Plan Initialization', 'INFO', `Objective: Evaluate job '${job.title}' at '${job.company}' and formulate optimal application strategy.`);

    // Step 1: Career Profile Agent
    logTrace('Career Profile Agent', 'Load Candidate Context', 'SUCCESS', `Loaded candidate profile for ${candidate.fullName}. Primary evidence file: '${candidate.resumeFile?.fileName || 'Verified Profile'}'.`, 'profile-parser');
    this.profileAgent.run(candidate);

    // Step 2: Job Intelligence Agent
    logTrace('Job Intelligence Agent', 'JD & Qualification Parsing', 'SUCCESS', `Parsed job description for ${job.title} at ${job.company}. Extracted ${job.requirements.length} key requirements.`, 'jd-parser');
    this.intelligenceAgent.run(job);

    // Step 3: Evidence Engine & Skill Gap Agent
    logTrace('Skill Gap Agent', 'Evidence Matching Analysis', 'INFO', `Cross-referencing candidate evidence against ${job.requirements.length} job requirements...`, 'evidence-matcher');
    const matchAnalysis = evidenceEngine.analyzeJobMatch(candidate, job);
    
    logTrace('Skill Gap Agent', 'Requirement Mapping Complete', 'SUCCESS', `Overall Match Score: ${matchAnalysis.overallScore}%. Matched: ${matchAnalysis.evidenceMap.filter(e => e.matchStatus === 'MATCHED').length}, Gaps: ${matchAnalysis.skillGaps.length}.`, 'skill-gap-analyzer');
    this.skillGapAgent.run(matchAnalysis);

    // Step 4: Application Strategist Agent
    logTrace('Application Strategist Agent', 'Strategy Formulation', 'INFO', `Evaluating strategy thresholds (APPLY vs OUTREACH vs SKIP)...`, 'strategy-evaluator');
    const strategyRec = this.strategistAgent.run(matchAnalysis, job);
    logTrace('Application Strategist Agent', 'Strategy Selected', 'SUCCESS', `Recommended Strategy: ${strategyRec.strategy}. Reason: ${strategyRec.primaryReasoning}`);

    // Step 5: Generation Agent
    let tailoredResume;
    let coldEmail;

    if (strategyRec.strategy === 'APPLY' || strategyRec.strategy === 'APPLY_AND_OUTREACH') {
      logTrace('Application Generation Agent', 'Tailor Full Resume', 'SUCCESS', `Generated full tailored resume aligning summary, skills, and project priority to ${job.company}.`, 'resume-tailor');
      tailoredResume = await this.generationAgent.generateTailoredResume(candidate, job, matchAnalysis);
    }

    if (strategyRec.strategy === 'OUTREACH' || strategyRec.strategy === 'APPLY_AND_OUTREACH') {
      logTrace('Application Generation Agent', 'Cold Email Personalization', 'SUCCESS', `Drafted personalized outreach email tailored to ${job.company}.`, 'cold-email-gen');
      coldEmail = await this.generationAgent.generateColdEmail(candidate, job, matchAnalysis);
    }

    // Step 6: Human Approval Gatekeeping
    const requiresApproval = strategyRec.strategy !== 'SKIP';
    if (requiresApproval) {
      logTrace('Job Hunt Orchestrator', 'Human Approval Gate Paused', 'PAUSED', `⏸ Execution paused. Generated cold email and application package require explicit user approval before sending.`);
    }

    // Save Application Record to Store
    const appRecord: JobApplicationRecord = {
      id: `app_${job.id}`,
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      status: requiresApproval ? 'PENDING_APPROVAL' : 'DRAFT',
      strategy: strategyRec.strategy,
      matchScore: matchAnalysis.overallScore,
      recipientEmail: job.recruiterContact.email,
      tailoredResume,
      coldEmail
    };
    db.saveApplication(appRecord, userId);

    const session: AgentRunSession = {
      workflowId,
      jobId,
      status: requiresApproval ? 'WAITING_APPROVAL' : 'COMPLETED',
      traces,
      analysis: matchAnalysis,
      strategy: strategyRec,
      tailoredResume,
      coldEmail,
      requiresApproval
    };

    db.setRunSession(session);
    return session;
  }

  public async approveAction(workflowId: string, customRecipientEmail?: string, userId?: string): Promise<JobApplicationRecord> {
    let session = db.getRunSession(workflowId);
    if (!session) {
      const apps = db.getApplications(userId);
      const firstApp = apps[0];
      if (firstApp) {
        session = db.getRunSession(`wf_${firstApp.jobId}`) || {
          workflowId,
          jobId: firstApp.jobId,
          status: 'COMPLETED',
          traces: [],
          requiresApproval: true
        };
      }
    }
    if (!session) {
      throw new Error(`Workflow session ${workflowId} not found.`);
    }

    const candidate = db.getProfile(userId);
    const app = db.getApplicationByJobId(session.jobId);
    if (!app) {
      throw new Error(`Application record for job ${session.jobId} not found.`);
    }

    const recipient = customRecipientEmail || app.recipientEmail || DEMO_RECRUITER_EMAIL;
    app.recipientEmail = recipient;
    if (app.coldEmail) {
      app.coldEmail.recipientEmail = recipient;
      app.coldEmail.status = 'APPROVED';
    }

    app.status = 'APPROVED';
    app.userApprovedAt = new Date().toISOString();
    app.userApprovedBy = candidate.email || DEMO_CANDIDATE_EMAIL;
    app.actionLog = `Human approved cold outreach for ${app.company}.`;
    db.saveApplication(app, userId);

    session.status = 'COMPLETED';
    db.setRunSession(session);

    db.addTrace({
      workflowId,
      agentName: 'Job Hunt Orchestrator',
      task: 'Human Approval Granted',
      status: 'SUCCESS',
      details: `✓ Human approved cold outreach for '${app.company}'. Status updated to APPROVED.`
    });

    this.memoryAgent.logOutcome(session.jobId, 'APPROVED_BY_USER');

    return app;
  }

  public async sendDemoEmail(jobId: string, userId?: string): Promise<JobApplicationRecord> {
    const candidate = db.getProfile(userId);
    const app = db.getApplicationByJobId(jobId);
    if (!app) {
      throw new Error(`Application record for job ${jobId} not found.`);
    }

    const job = db.getJobById(jobId);
    if (!job) {
      throw new Error(`Job with ID ${jobId} not found.`);
    }

    // Call server-side email abstraction
    const emailResult = await sendColdEmailServer({
      candidate,
      job,
      coldEmail: app.coldEmail
    });

    if (emailResult.status === 'SENT') {
      app.status = 'SENT';
      app.demoSentAt = emailResult.timestamp;
      if (app.coldEmail) {
        app.coldEmail.status = 'SENT_DEMO';
        app.coldEmail.sentAt = emailResult.timestamp;
      }
      app.actionLog = emailResult.message || 'Outreach email sent successfully.';

      db.saveApplication(app, userId);

      db.addTrace({ userId, 
        workflowId: `send_${Date.now()}`,
        agentName: 'Job Hunt Orchestrator',
        task: 'Email Outreach Sent',
        status: 'SUCCESS',
        details: `✓ Outreach email sent successfully for '${app.company}' via SMTP.`
      });

      this.memoryAgent.logOutcome(jobId, 'SENT');
    } else {
      // Keep status as current state (APPROVED or PENDING_APPROVAL), do not falsely set to SENT
      app.actionLog = emailResult.message || 'Unable to send email. Please try again.';

      db.saveApplication(app, userId);

      db.addTrace({ userId, 
        workflowId: `send_${Date.now()}`,
        agentName: 'Job Hunt Orchestrator',
        task: 'Email Outreach Attempt',
        status: 'WARNING',
        details: `Email send result for '${app.company}': ${emailResult.message || 'Configuration check'}`
      });
    }

    return app;
  }
}

export const orchestrator = new JobHuntOrchestrator();
