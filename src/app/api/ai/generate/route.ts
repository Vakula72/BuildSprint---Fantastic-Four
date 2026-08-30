import { NextResponse } from 'next/server';
import { auth } from '@/auth'; // Assuming standard next-auth setup
import { db } from '@/lib/db/store';
import { ApplicationGenerationAgent, JobIntelligenceAgent, SkillGapAgent } from '@/lib/agent/agents/specialized-agents';
import { evidenceEngine } from '@/lib/agent/tools/evidence-matcher';
import { CandidateProfile, Job } from '@/lib/types';
import { DEMO_CANDIDATE_EMAIL } from '@/lib/types'; // Using demo candidate for hackathon if no real one

// Dummy candidate for on-demand generation if we don't have user profiles saved yet
const getMockCandidate = (): CandidateProfile => ({
    id: 'demo-user-1',
    fullName: 'Alex Morgan',
    email: DEMO_CANDIDATE_EMAIL,
    headline: 'Software Engineer',
    summary: 'A passionate full-stack engineer.',
    targetTitles: ['Software Engineer', 'Full Stack Developer'],
    targetLocations: ['Remote', 'San Francisco'],
    education: [{ degree: 'B.S.', fieldOfStudy: 'Computer Science', institution: 'University of Tech', graduationYear: 2022 }],
    skills: [
        { id: '1', name: 'TypeScript', category: 'TECHNICAL', proficiency: 'ADVANCED' },
        { id: '2', name: 'React', category: 'TECHNICAL', proficiency: 'ADVANCED' },
        { id: '3', name: 'Node.js', category: 'TECHNICAL', proficiency: 'INTERMEDIATE' }
    ],
    projects: [
        { id: 'p1', title: 'Agentic Job Hunt Copilot', description: 'Built an AI agent framework for job hunting.', technologies: ['TypeScript', 'Next.js', 'Neo4j'] }
    ],
    experience: [
        { id: 'e1', roleTitle: 'Software Engineer Intern', company: 'Tech Startup Inc.', location: 'Remote', startDate: '2023-01', endDate: '2023-06', isCurrent: false, description: 'Worked on frontend and backend features.', skillsUsed: ['React', 'Node.js'], highlights: ['Improved load times by 20%'] }
    ]
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, jobId } = await req.json();

    if (!jobId || !type) {
        return NextResponse.json({ error: 'Missing jobId or type' }, { status: 400 });
    }

    const job = db.getJobs().find(j => j.id === jobId);
    
    if (!job) {
         return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const candidate = getMockCandidate(); // In a real app, load this from DB based on session.user.id

    // Pre-requisites for generation
    const intelligenceAgent = new JobIntelligenceAgent();
    intelligenceAgent.run(job);

    const analysis = await evidenceEngine.analyzeJobMatch(candidate, job);
    
    const generatorAgent = new ApplicationGenerationAgent();

    if (type === 'resume') {
        const resume = await generatorAgent.generateTailoredResume(candidate, job, analysis);
        return NextResponse.json({ success: true, data: resume });
    } else if (type === 'email') {
        const email = await generatorAgent.generateColdEmail(candidate, job, analysis);
        return NextResponse.json({ success: true, data: email });
    } else {
        return NextResponse.json({ error: 'Invalid generation type' }, { status: 400 });
    }

  } catch (error) {
    console.error('API /api/ai/generate error:', error);
    return NextResponse.json({ error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
