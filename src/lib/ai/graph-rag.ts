import { CandidateProfile, Job, JobMatchAnalysis, FullTailoredResume, ColdEmailContent, DEMO_CANDIDATE_EMAIL, DEMO_RECRUITER_EMAIL } from '../types';
import { generateContent, GeminiNotConfiguredError } from './gemini';

export class GraphRAGEngine {
  /**
   * Formats the candidate's verified evidence into a grounded context string.
   */
  private buildCandidateContext(candidate: CandidateProfile, analysis: JobMatchAnalysis): string {
    const verifiedEvidence = analysis.evidenceMap
      .filter(m => m.matchStatus === 'MATCHED' || m.matchStatus === 'PARTIAL')
      .map(m => `- Requirement: ${m.requirementName} -> Evidence: ${m.candidateEvidence} (Status: ${m.matchStatus}, Confidence: ${m.confidence})`)
      .join('\n');

    const skillGaps = analysis.skillGaps.map(g => `- Missing: ${g.requirementName}`).join('\n');
    
    let context = `VERIFIED EVIDENCE:\n${verifiedEvidence}\n\n`;
    if (skillGaps) {
       context += `SKILL GAPS (Do not claim these):\n${skillGaps}\n\n`;
    }

    context += `STRENGTHS:\n${analysis.strengths.map(s => `- ${s}`).join('\n')}\n\n`;
    
    // Include full background
    context += `FULL CANDIDATE PROFILE:\n`;
    context += `Name: ${candidate.fullName}\n`;
    context += `Email: ${candidate.email}\n`;
    context += `Summary: ${candidate.summary}\n`;
    
    context += `\nExperience:\n`;
    candidate.experience.forEach(exp => {
      context += `- ${exp.roleTitle} at ${exp.company} (${exp.startDate} - ${exp.endDate || 'Present'})\n  ${exp.description}\n  Highlights: ${exp.highlights.join(' | ')}\n`;
    });

    context += `\nProjects:\n`;
    candidate.projects.forEach(p => {
      context += `- ${p.title}: ${p.description}\n  Tech: ${p.technologies.join(', ')}\n  Metrics: ${p.metrics || 'N/A'}\n`;
    });

    return context;
  }

  /**
   * Formats the job context.
   */
  private buildJobContext(job: Job): string {
    return `JOB DETAILS:
Title: ${job.title}
Company: ${job.company}
Location: ${job.location} (${job.workplaceType})
Description: ${job.description}

REQUIREMENTS:
${job.requirements.map(r => `- ${r.name} (${r.category}, Mandatory: ${r.isMandatory})`).join('\n')}
`;
  }

  /**
   * Generates a tailored resume using RAG, strictly grounded in evidence.
   */
  public async generateResumeWithRAG(candidate: CandidateProfile, job: Job, analysis: JobMatchAnalysis): Promise<FullTailoredResume> {
    const candidateContext = this.buildCandidateContext(candidate, analysis);
    const jobContext = this.buildJobContext(job);

    const prompt = `
You are an expert technical resume writer. Your task is to generate a tailored resume for the candidate based ONLY on the provided context.

CRITICAL GROUNDING RULES:
1. Use ONLY the verified candidate evidence provided. 
2. Never invent or embellish skills, metrics, experiences, or achievements.
3. If a requirement from the job is in the SKILL GAPS list, DO NOT claim the candidate has it.
4. Align the summary, headline, and project selection to highlight matches with the job requirements.

${candidateContext}
${jobContext}

Return the tailored resume strictly as a valid JSON object matching this TypeScript interface exactly, with NO markdown formatting, NO code blocks, and NO extra text:
{
  "candidateHeader": {
    "fullName": "string",
    "email": "string",
    "phone": "string (optional)",
    "location": "string",
    "links": ["string"]
  },
  "targetJobTitle": "string",
  "customHeadline": "string",
  "tailoredSummary": "string",
  "categorizedSkills": [
    { "categoryName": "string", "skills": ["string"] }
  ],
  "workExperience": [
    { "roleTitle": "string", "company": "string", "dates": "string", "relevanceNote": "string", "bulletPoints": ["string"] }
  ],
  "featuredProjects": [
    { "title": "string", "technologies": ["string"], "relevanceReason": "string", "bulletPoints": ["string"] }
  ],
  "education": [
    { "degree": "string", "fieldOfStudy": "string", "institution": "string", "year": number }
  ],
  "tailoringChangesNote": {
    "skillsEmphasized": ["string"],
    "projectsPrioritized": ["string"]
  }
}
`;

    try {
      const responseText = await generateContent(prompt);
      
      // Clean up markdown code blocks if the model included them despite instructions
      let cleanJson = responseText.trim();
      if (cleanJson.startsWith('```')) {
        const lines = cleanJson.split('\n');
        cleanJson = lines.slice(1, lines.length - 1).join('\n');
      }
      
      const parsed = JSON.parse(cleanJson) as FullTailoredResume;
      return parsed;
    } catch (error) {
      console.error('Failed to generate resume with RAG, falling back...', error);
      throw error; // Will be caught by the agent to trigger fallback
    }
  }

  /**
   * Generates a targeted cold email using RAG, strictly grounded in evidence.
   */
  public async generateEmailWithRAG(candidate: CandidateProfile, job: Job, analysis: JobMatchAnalysis): Promise<ColdEmailContent> {
    const candidateContext = this.buildCandidateContext(candidate, analysis);
    const jobContext = this.buildJobContext(job);
    
    const topMatches = analysis.evidenceMap
        .filter(m => m.matchStatus === 'MATCHED')
        .slice(0, 3)
        .map(m => m.requirementName)
        .join(', ');

    const prompt = `
Write a personalized cold email grounded in verified candidate evidence only. Be concise, professional, and specific.

CRITICAL GROUNDING RULES:
1. Use ONLY the verified candidate evidence provided. Do not invent experience.
2. The subject line MUST exactly follow the format: "{Candidate Name} — {Job Title} Outreach ({Company Name})"
3. The sender email MUST be the candidate's email.
4. The recipient email MUST be the recruiter's email from the job context, or fallback to ${DEMO_RECRUITER_EMAIL} if not present.
5. Highlight the strongest verified overlap between the candidate and the job requirements (e.g., ${topMatches}).

${candidateContext}
${jobContext}

Return the email content strictly as a valid JSON object matching this TypeScript interface exactly, with NO markdown formatting, NO code blocks, and NO extra text:
{
  "senderEmail": "string",
  "recipientEmail": "string",
  "recipientTitle": "string",
  "subject": "string",
  "body": "string",
  "status": "PENDING_APPROVAL",
  "whyGenerated": {
    "candidateEvidence": "string",
    "companyContext": "string",
    "reasonForOutreach": "string",
    "personalizationPoints": ["string"]
  }
}
`;

    try {
      const responseText = await generateContent(prompt);
      
      // Clean up markdown code blocks if the model included them despite instructions
      let cleanJson = responseText.trim();
      if (cleanJson.startsWith('```')) {
        const lines = cleanJson.split('\n');
        cleanJson = lines.slice(1, lines.length - 1).join('\n');
      }
      
      const parsed = JSON.parse(cleanJson) as ColdEmailContent;
      return parsed;
    } catch (error) {
      console.error('Failed to generate email with RAG, falling back...', error);
      throw error; // Will be caught by the agent to trigger fallback
    }
  }
}

export const graphRAGEngine = new GraphRAGEngine();
