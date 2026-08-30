import { sqliteTable, text, real, integer, blob } from 'drizzle-orm/sqlite-core';

// Helper to parse/stringify JSON correctly with generic types
const jsonType = <T>(name: string) => text(name, { mode: 'json' }).$type<T>();

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash'),
  name: text('name'),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
});

export const candidateProfiles = sqliteTable('candidate_profiles', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  fullName: text('full_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  headline: text('headline').notNull(),
  summary: text('summary').notNull(),
  targetTitles: jsonType<string[]>('target_titles').notNull(),
  targetLocations: jsonType<string[]>('target_locations').notNull(),
  githubUrl: text('github_url'),
  linkedinUrl: text('linkedin_url'),
  portfolioUrl: text('portfolio_url'),
  resumeFile: jsonType<any>('resume_file'),
  education: jsonType<any[]>('education').notNull(),
  skills: jsonType<any[]>('skills').notNull(),
  projects: jsonType<any[]>('projects').notNull(),
  experience: jsonType<any[]>('experience').notNull(),
  updatedAt: text('updated_at'),
});

export const jobs = sqliteTable('jobs', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  company: text('company').notNull(),
  location: text('location').notNull(),
  workplaceType: text('workplace_type').notNull(),
  salaryRange: text('salary_range'),
  description: text('description').notNull(),
  sourceUrl: text('source_url'),
  postedDate: text('posted_date').notNull(),
  requirements: jsonType<any[]>('requirements').notNull(),
  recruiterContact: jsonType<any>('recruiter_contact').notNull(),
  companyInfo: jsonType<any>('company_info'),
  scrapedAt: text('scraped_at'),
});

export const applications = sqliteTable('applications', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  jobId: text('job_id').references(() => jobs.id).notNull(),
  status: text('status').notNull(),
  strategy: text('strategy').notNull(),
  matchScore: real('match_score').notNull(),
  recipientEmail: text('recipient_email').notNull(),
  tailoredResume: jsonType<any>('tailored_resume'),
  coldEmail: jsonType<any>('cold_email'),
  userApprovedAt: text('user_approved_at'),
  userApprovedBy: text('user_approved_by'),
  demoSentAt: text('demo_sent_at'),
  actionLog: text('action_log'),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
});

export const agentTraces = sqliteTable('agent_traces', {
  id: text('id').primaryKey(),
  workflowId: text('workflow_id').notNull(),
  userId: text('user_id').references(() => users.id),
  agentName: text('agent_name').notNull(),
  task: text('task').notNull(),
  status: text('status').notNull(),
  details: text('details').notNull(),
  toolUsed: text('tool_used'),
  timestamp: text('timestamp').notNull(),
});

export const skillGaps = sqliteTable('skill_gaps', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  skillName: text('skill_name').notNull(),
  category: text('category').notNull(),
  frequencyAcrossJobs: integer('frequency_across_jobs').notNull(),
  impactLevel: text('impact_level').notNull(),
  recommendedResource: text('recommended_resource'),
  actionableAdvice: text('actionable_advice').notNull(),
});
