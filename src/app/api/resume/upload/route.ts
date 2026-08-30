import { NextResponse } from 'next/server';
import { db } from '@/lib/db/store';
import { auth } from '@/auth';
import { graphSync } from '@/lib/graph/sync';

// Force Node.js runtime so pdf-parse works
export const runtime = 'nodejs';

import { createRequire } from 'module';

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const require = createRequire(import.meta.url);
    const pdfParse = require('pdf-parse');
    const data = await pdfParse(buffer);
    return data.text || '';
  } catch (err) {
    console.error('[Resume] PDF parse error:', err);
    return '';
  }
}

async function extractProfileFromText(text: string, fileName: string) {
  // Try Gemini AI extraction first
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey && text.length > 100) {
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-3.6-flash',
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json',
        }
      });

      const prompt = `Extract structured information from this resume text. Return ONLY valid JSON, no markdown.
IMPORTANT: You MUST extract the actual values from the resume. Do NOT use the placeholder values from the example JSON structure.

Resume text:
${text.slice(0, 4000)}

Return this exact JSON structure, but replace the values with the candidate's actual data:
{
  "fullName": "candidate full name",
  "email": "email address",
  "phone": "phone number",
  "headline": "professional headline or job title",
  "summary": "professional summary paragraph",
  "skills": [{"name": "SkillName", "proficiency": "Advanced|Intermediate|Beginner", "id": "sk1"}],
  "experience": [{"id": "exp1", "company": "Actual Company Name", "roleTitle": "Actual Title", "startDate": "Jan 2024", "endDate": "Present", "description": "Actual description", "skillsUsed": ["Skill1"], "highlights": ["Actual highlight"]}],
  "education": [{"id": "edu1", "institution": "Actual University", "degree": "Actual Degree (e.g. B.Tech Computer Science)", "startDate": "2020", "graduationDate": "2024", "gpa": "3.8"}],
  "projects": [{"id": "proj1", "title": "Actual Project Title", "description": "Actual description", "technologies": ["Tech1"], "repoUrl": "", "liveUrl": ""}],
  "targetTitles": ["list of target job titles based on experience"],
  "targetLocations": ["Remote"],
  "githubUrl": "",
  "linkedinUrl": "",
  "portfolioUrl": ""
}`;

      const result = await model.generateContent(prompt);
      const raw = result.response.text().replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(raw);
      return parsed;
    } catch (err) {
      console.error('[Resume] Gemini extraction failed, using regex fallback:', err);
    }
  }

  // Regex fallback extraction
  const emailMatch = text.match(/[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/(\+?[\d\s\-().]{10,})/);
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const nameCandidate = lines[0] || fileName.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');

  const skillKeywords = ['JavaScript','TypeScript','Python','React','Next.js','Node.js','SQL','AWS','Docker','Git','CSS','HTML','GraphQL','MongoDB','PostgreSQL','Redis','Kubernetes','Go','Rust','Java','C++','C#','Angular','Vue'];
  const foundSkills = skillKeywords.filter(s => text.toLowerCase().includes(s.toLowerCase()));

  return {
    fullName: nameCandidate,
    email: emailMatch?.[0] || '',
    phone: phoneMatch?.[0]?.trim() || '',
    headline: lines[1] || 'Software Engineer',
    summary: lines.slice(2, 5).join(' ') || '',
    skills: foundSkills.map((name, i) => ({ id: `sk_${i}`, name, proficiency: 'Intermediate' })),
    experience: [],
    education: [],
    projects: [],
    targetTitles: [],
    targetLocations: ['Remote'],
    githubUrl: (text.match(/github\.com\/[\w-]+/)?.[0] ? `https://${text.match(/github\.com\/[\w-]+/)?.[0]}` : ''),
    linkedinUrl: (text.match(/linkedin\.com\/in\/[\w-]+/)?.[0] ? `https://${text.match(/linkedin\.com\/in\/[\w-]+/)?.[0]}` : ''),
    portfolioUrl: '',
  };
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const contentType = req.headers.get('content-type') || '';
    let extractedText = '';
    let fileName = 'resume.pdf';

    if (contentType.includes('multipart/form-data')) {
      // Binary PDF upload
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      fileName = (formData.get('fileName') as string) || file?.name || 'resume.pdf';

      if (file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        extractedText = await extractTextFromPDF(buffer);
      }
    } else {
      // Legacy JSON upload (fallback)
      const body = await req.json();
      fileName = body.fileName || 'resume.pdf';
      extractedText = body.textContent || '';
    }

    console.log(`[Resume] Parsed ${extractedText.length} chars from ${fileName}`);

    if (!extractedText || extractedText.length < 50) {
      return NextResponse.json({ error: 'Could not extract text from the file. Please upload a text-based PDF.' }, { status: 400 });
    }

    // Extract structured profile data
    const extracted = await extractProfileFromText(extractedText, fileName);
    console.log(`[Resume] Extracted profile for: ${extracted.fullName}`);

    // Get existing profile and merge
    const currentProfile = db.getProfile(session.user.id);

    const updatedProfile = {
      ...currentProfile,
      // Only overwrite fields that were actually found in the resume
      fullName: extracted.fullName || session.user.name || currentProfile.fullName,
      email: extracted.email || session.user.email || currentProfile.email,
      phone: extracted.phone || currentProfile.phone,
      headline: extracted.headline || currentProfile.headline,
      summary: extracted.summary || currentProfile.summary,
      skills: extracted.skills?.length > 0 ? extracted.skills : currentProfile.skills,
      experience: extracted.experience?.length > 0 ? extracted.experience : currentProfile.experience,
      education: extracted.education?.length > 0 ? extracted.education : currentProfile.education,
      projects: extracted.projects?.length > 0 ? extracted.projects : currentProfile.projects,
      targetTitles: extracted.targetTitles?.length > 0 ? extracted.targetTitles : currentProfile.targetTitles,
      targetLocations: extracted.targetLocations?.length > 0 ? extracted.targetLocations : currentProfile.targetLocations,
      githubUrl: extracted.githubUrl || currentProfile.githubUrl,
      linkedinUrl: extracted.linkedinUrl || currentProfile.linkedinUrl,
      portfolioUrl: extracted.portfolioUrl || currentProfile.portfolioUrl,
      resumeFile: {
        fileName,
        uploadedAt: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
        fileSize: `${Math.round(extractedText.length / 100) / 10} KB`,
        extractedText,
        parsedAt: new Date().toISOString(),
      },
    };

    db.updateProfile(updatedProfile, session.user.id);

    db.addTrace({
      workflowId: `resume_${Date.now()}`,
      agentName: 'Career Profile Agent',
      task: 'Resume Parsed & Profile Updated',
      status: 'SUCCESS',
      details: `Parsed '${fileName}'. Extracted ${extracted.skills?.length || 0} skills, ${extracted.experience?.length || 0} experience entries, ${extracted.projects?.length || 0} projects. Profile auto-populated.`,
      toolUsed: 'resume-parser'
    }, session.user.id);

    // Sync to Neo4j Knowledge Graph
    try {
      await graphSync.syncCandidate(updatedProfile);
      console.log('[Neo4j] Candidate synchronized successfully.');
    } catch (e) {
      console.error('[Neo4j] Failed to sync candidate to graph:', e);
    }

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
      message: `Resume parsed successfully. Extracted ${extracted.skills?.length || 0} skills.`
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to parse uploaded resume';
    console.error('[Resume] Upload error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
