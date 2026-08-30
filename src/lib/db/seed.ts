import client from './client';
import { jobs, candidateProfiles, applications, skillGaps, agentTraces, users } from './schema';
import { INITIAL_CANDIDATE_PROFILE, INITIAL_JOBS, INITIAL_APPLICATIONS, INITIAL_SKILL_GAPS } from './store';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { DEMO_CANDIDATE_EMAIL } from '@/lib/types';

export function seedSync() {
  console.log('Checking database seed status...');
  
  // Seed Users (Default User)
  const existingUser = client.select().from(users).where(eq(users.id, 'default_user_1')).get();
  if (!existingUser) {
    client.insert(users).values({
      id: 'default_user_1',
      email: INITIAL_CANDIDATE_PROFILE.email || DEMO_CANDIDATE_EMAIL,
      name: INITIAL_CANDIDATE_PROFILE.fullName || 'Alex Morgan',
    }).run();
    console.log('Seeded default user.');
  }

  // Seed Profile
  const existingProfile = client.select().from(candidateProfiles).limit(1).get();
  if (!existingProfile) {
    client.insert(candidateProfiles).values({
      id: INITIAL_CANDIDATE_PROFILE.id,
      userId: 'default_user_1',
      fullName: INITIAL_CANDIDATE_PROFILE.fullName,
      email: INITIAL_CANDIDATE_PROFILE.email,
      phone: INITIAL_CANDIDATE_PROFILE.phone,
      headline: INITIAL_CANDIDATE_PROFILE.headline,
      summary: INITIAL_CANDIDATE_PROFILE.summary,
      targetTitles: INITIAL_CANDIDATE_PROFILE.targetTitles,
      targetLocations: INITIAL_CANDIDATE_PROFILE.targetLocations,
      githubUrl: INITIAL_CANDIDATE_PROFILE.githubUrl,
      linkedinUrl: INITIAL_CANDIDATE_PROFILE.linkedinUrl,
      portfolioUrl: INITIAL_CANDIDATE_PROFILE.portfolioUrl,
      resumeFile: INITIAL_CANDIDATE_PROFILE.resumeFile,
      education: INITIAL_CANDIDATE_PROFILE.education,
      skills: INITIAL_CANDIDATE_PROFILE.skills,
      projects: INITIAL_CANDIDATE_PROFILE.projects,
      experience: INITIAL_CANDIDATE_PROFILE.experience,
      updatedAt: new Date().toISOString()
    }).run();
    console.log('Seeded candidate profile.');
  }

  // Seed Jobs
  const jobsCount = client.select().from(jobs).all().length;
  if (jobsCount === 0) {
    for (const job of INITIAL_JOBS) {
      client.insert(jobs).values({
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        workplaceType: job.workplaceType,
        salaryRange: job.salaryRange,
        description: job.description,
        sourceUrl: job.sourceUrl,
        postedDate: job.postedDate,
        requirements: job.requirements,
        recruiterContact: job.recruiterContact,
        companyInfo: job.companyInfo,
        scrapedAt: new Date().toISOString()
      }).run();
    }
    console.log(`Seeded ${INITIAL_JOBS.length} jobs.`);
  }

  // Seed Applications
  const appsCount = client.select().from(applications).all().length;
  if (appsCount === 0) {
    for (const app of INITIAL_APPLICATIONS) {
      client.insert(applications).values({
        id: app.id,
        userId: 'default_user_1',
        jobId: app.jobId,
        status: app.status,
        strategy: app.strategy,
        matchScore: app.matchScore,
        recipientEmail: app.recipientEmail,
        tailoredResume: app.tailoredResume,
        coldEmail: app.coldEmail,
        createdAt: new Date().toISOString()
      }).run();
    }
    console.log(`Seeded ${INITIAL_APPLICATIONS.length} applications.`);
  }

  // Seed Skill Gaps
  const gapsCount = client.select().from(skillGaps).all().length;
  if (gapsCount === 0) {
    for (const gap of INITIAL_SKILL_GAPS) {
      client.insert(skillGaps).values({
        id: `sg_${crypto.randomBytes(4).toString('hex')}`,
        userId: 'default_user_1',
        skillName: gap.skillName,
        category: gap.category,
        frequencyAcrossJobs: gap.frequencyAcrossJobs,
        impactLevel: gap.impactLevel,
        recommendedResource: gap.recommendedLearningResource,
        actionableAdvice: gap.actionableAdvice
      }).run();
    }
    console.log(`Seeded ${INITIAL_SKILL_GAPS.length} skill gaps.`);
  }
}

export async function seed() {
  seedSync();
}
