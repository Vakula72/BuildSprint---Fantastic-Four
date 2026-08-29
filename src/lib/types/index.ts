// Central TypeScript definitions for Agentic Job Hunt Copilot

export const DEMO_RECRUITER_EMAIL = 'vakulasri_godavarthi@srmap.edu.in';
export const DEMO_CANDIDATE_EMAIL = 'alex.morgan.demo@example.com';

export type MatchStatus = 'MATCHED' | 'PARTIAL' | 'MISSING' | 'UNKNOWN';
export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type RequirementCategory = 'TECHNICAL' | 'SOFT' | 'EXPERIENCE' | 'EDUCATION' | 'DOMAIN';
export type StrategyType = 'APPLY' | 'APPLY_AND_OUTREACH' | 'OUTREACH' | 'SKIP';
export type ApplicationStatus = 'DISCOVERED' | 'ANALYZED' | 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'QUEUED' | 'SENT_DEMO' | 'SENT' | 'FAILED' | 'INTERVIEW' | 'REJECTED' | 'SKIPPED';
export type AgentRunStatus = 'RUNNING' | 'WAITING_APPROVAL' | 'COMPLETED' | 'FAILED' | 'REPLANNED';

export interface ResumeMetadata {
  fileName: string;
  uploadedAt: string;
  fileSize: string;
  extractedText?: string;
  parsedAt?: string;
}

export interface CandidateSkill {
  id: string;
  name: string;
  category: string;
  proficiency: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  yearsExperience?: number;
}

export interface CandidateProject {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  metrics?: string;
  repoUrl?: string;
  liveUrl?: string;
  keyAchievements?: string[];
}

export interface CandidateExperience {
  id: string;
  roleTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description: string;
  skillsUsed: string[];
  highlights: string[];
}

export interface CandidateProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  headline: string;
  summary: string;
  targetTitles: string[];
  targetLocations: string[];
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  resumeFile?: ResumeMetadata;
  education: {
    degree: string;
    fieldOfStudy: string;
    institution: string;
    graduationYear: number;
    gpa?: string;
  }[];
  skills: CandidateSkill[];
  projects: CandidateProject[];
  experience: CandidateExperience[];
  certifications?: string[];
}

export interface JobRequirement {
  id: string;
  name: string;
  category: RequirementCategory;
  isMandatory: boolean;
  description?: string;
}

export interface JobEvidenceMatch {
  requirementId: string;
  requirementName: string;
  category: RequirementCategory;
  matchStatus: MatchStatus;
  confidence: ConfidenceLevel;
  candidateEvidence: string;
  linkedProjectTitle?: string;
  linkedExperienceRole?: string;
  explanation: string;
}

export interface RecruiterContact {
  name: string;
  title: string;
  email: string;
  linkedinUrl?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  workplaceType: 'REMOTE' | 'HYBRID' | 'ON_SITE';
  salaryRange?: string;
  description: string;
  sourceUrl?: string;
  postedDate: string;
  requirements: JobRequirement[];
  recruiterContact: RecruiterContact;
  companyInfo?: {
    overview: string;
    industry: string;
    recentNews?: string;
    techStack: string[];
  };
}

export interface JobMatchAnalysis {
  jobId: string;
  overallScore: number; // 0 - 100
  summary: string;
  strengths: string[];
  skillGaps: JobEvidenceMatch[];
  evidenceMap: JobEvidenceMatch[];
  scoreBreakdown: {
    technicalAlignment: number;
    projectRelevance: number;
    experienceMatch: number;
    rolePreference: number;
  };
}

export interface StrategyRecommendation {
  jobId: string;
  strategy: StrategyType;
  primaryReasoning: string;
  pros: string[];
  cons: string[];
  confidence: ConfidenceLevel;
}

export interface FullTailoredResume {
  candidateHeader: {
    fullName: string;
    email: string;
    phone?: string;
    location: string;
    links: string[];
  };
  targetJobTitle: string;
  customHeadline: string;
  tailoredSummary: string;
  categorizedSkills: {
    categoryName: string;
    skills: string[];
  }[];
  workExperience: {
    roleTitle: string;
    company: string;
    dates: string;
    relevanceNote?: string;
    bulletPoints: string[];
  }[];
  featuredProjects: {
    title: string;
    technologies: string[];
    relevanceReason: string;
    bulletPoints: string[];
  }[];
  education: {
    degree: string;
    fieldOfStudy: string;
    institution: string;
    year: number;
  }[];
  tailoringChangesNote?: {
    skillsEmphasized: string[];
    projectsPrioritized: string[];
  };
}

export interface ColdEmailContent {
  senderEmail: string; // alex.morgan.demo@example.com
  recipientEmail: string; // vakulasri_godavarthi@srmap.edu.in
  recipientTitle: string;
  subject: string;
  body: string;
  sentAt?: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'SENT_DEMO';
  whyGenerated: {
    candidateEvidence: string;
    companyContext: string;
    reasonForOutreach: string;
    personalizationPoints: string[];
  };
}

export interface JobApplicationRecord {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  status: ApplicationStatus;
  strategy: StrategyType;
  matchScore: number;
  recipientEmail: string;
  tailoredResume?: FullTailoredResume;
  coldEmail?: ColdEmailContent;
  userApprovedAt?: string;
  userApprovedBy?: string;
  demoSentAt?: string;
  actionLog?: string;
  appliedAt?: string;
  notes?: string;
  outcome?: 'NO_RESPONSE' | 'REJECTED' | 'INTERVIEW_OFFERED' | 'ACCEPTED';
}

export interface AgentActivityTrace {
  id: string;
  workflowId: string;
  timestamp: string;
  agentName: string;
  task: string;
  status: 'INFO' | 'SUCCESS' | 'WARNING' | 'PAUSED';
  details: string;
  toolUsed?: string;
}

export interface AgentRunSession {
  workflowId: string;
  jobId: string;
  status: AgentRunStatus;
  traces: AgentActivityTrace[];
  analysis?: JobMatchAnalysis;
  strategy?: StrategyRecommendation;
  tailoredResume?: FullTailoredResume;
  coldEmail?: ColdEmailContent;
  requiresApproval: boolean;
}

export interface SkillGapInsight {
  skillName: string;
  category: RequirementCategory;
  frequencyAcrossJobs: number;
  impactLevel: 'CRITICAL' | 'MODERATE' | 'LOW';
  recommendedLearningResource?: string;
  actionableAdvice: string;
}
