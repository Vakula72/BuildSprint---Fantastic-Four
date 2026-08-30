import {
  CandidateProfile,
  Job,
  JobRequirement,
  JobEvidenceMatch,
  JobMatchAnalysis,
  MatchStatus,
  ConfidenceLevel
} from '@/lib/types';

export class EvidenceMatcherEngine {
  /**
   * Matches candidate evidence against a set of job requirements
   */
  public analyzeJobMatch(candidate: CandidateProfile, job: Job): JobMatchAnalysis | Promise<JobMatchAnalysis> {
    const evidenceMap: JobEvidenceMatch[] = job.requirements.map(req =>
      this.evaluateRequirement(candidate, req)
    );

    const skillGaps = evidenceMap.filter(m => m.matchStatus === 'MISSING' || m.matchStatus === 'PARTIAL' || m.matchStatus === 'UNKNOWN');
    const matchedCount = evidenceMap.filter(m => m.matchStatus === 'MATCHED').length;
    const partialCount = evidenceMap.filter(m => m.matchStatus === 'PARTIAL').length;
    const totalReqs = Math.max(1, evidenceMap.length);

    // Calculate score components
    const technicalAlignment = Math.min(100, Math.round(((matchedCount + partialCount * 0.5) / totalReqs) * 100));
    
    // Check project relevance
    const projectMatchCount = candidate.projects.filter(p =>
      job.requirements.some(r =>
        p.technologies.some(t => t.toLowerCase().includes(r.name.toLowerCase()) || r.name.toLowerCase().includes(t.toLowerCase()))
      )
    ).length;
    const projectRelevance = Math.min(100, Math.round((projectMatchCount / Math.max(1, candidate.projects.length)) * 100));

    // Experience match score
    const hasWorkExp = candidate.experience.length > 0;
    const experienceMatch = hasWorkExp ? 85 : 60;

    // Preference alignment
    const rolePreference = candidate.targetTitles.some(t => job.title.toLowerCase().includes(t.toLowerCase())) ? 95 : 75;

    // Weighted Overall Score
    const overallScore = Math.round(
      technicalAlignment * 0.5 +
      projectRelevance * 0.25 +
      experienceMatch * 0.15 +
      rolePreference * 0.10
    );

    const strengths: string[] = [];
    if (technicalAlignment >= 80) strengths.push('Strong technical skill alignment');
    if (projectRelevance >= 70) strengths.push('High project relevance with verified GitHub evidence');
    if (hasWorkExp) strengths.push('Prior relevant software engineering internship experience');
    if (rolePreference >= 80) strengths.push('Excellent match with target career titles');

    const summary = `Candidate matches ${matchedCount}/${totalReqs} requirements with verified evidence. Overall match score is ${overallScore}%.`;

    return {
      jobId: job.id,
      overallScore,
      summary,
      strengths,
      skillGaps,
      evidenceMap,
      scoreBreakdown: {
        technicalAlignment,
        projectRelevance,
        experienceMatch,
        rolePreference
      }
    };
  }

  protected evaluateRequirement(candidate: CandidateProfile, req: JobRequirement): JobEvidenceMatch {
    const reqLower = req.name.toLowerCase();

    // 0. Handle Unknown / Ambiguous Requirements
    if (reqLower.includes('unknown') || reqLower.includes('unspecified') || req.category === 'DOMAIN' && !req.description) {
      return {
        requirementId: req.id,
        requirementName: req.name,
        category: req.category,
        matchStatus: 'UNKNOWN',
        confidence: 'LOW',
        candidateEvidence: 'Requirement details or candidate evidence is unknown.',
        explanation: 'Insufficient requirement information available to verify match.'
      };
    }

    // 1. Direct Skill Check
    const matchedSkill = candidate.skills.find(s =>
      s.name.toLowerCase() === reqLower ||
      reqLower.includes(s.name.toLowerCase()) ||
      s.name.toLowerCase().includes(reqLower)
    );

    // 2. Project Evidence Search
    const matchedProject = candidate.projects.find(p =>
      p.technologies.some(t => t.toLowerCase().includes(reqLower) || reqLower.includes(t.toLowerCase())) ||
      p.title.toLowerCase().includes(reqLower) ||
      p.description.toLowerCase().includes(reqLower)
    );

    // 3. Work Experience Search
    const matchedExp = candidate.experience.find(e =>
      (e.skillsUsed || []).some(s => s.toLowerCase().includes(reqLower) || reqLower.includes(s.toLowerCase())) ||
      (e.description || '').toLowerCase().includes(reqLower) ||
      (e.highlights || []).some(h => h.toLowerCase().includes(reqLower))
    );

    // 4. Education Search
    const matchedEdu = candidate.education.find(ed =>
      ed.degree.toLowerCase().includes(reqLower) ||
      ed.fieldOfStudy.toLowerCase().includes(reqLower) ||
      reqLower.includes('b.s.') || reqLower.includes('computer science')
    );

    let matchStatus: MatchStatus = 'MISSING';
    let confidence: ConfidenceLevel = 'HIGH';
    let candidateEvidence = 'No direct evidence found in resume or portfolio.';
    let linkedProjectTitle: string | undefined;
    let linkedExperienceRole: string | undefined;
    let explanation = `Candidate does not have verified experience in ${req.name}.`;

    if (req.category === 'EDUCATION' && matchedEdu) {
      matchStatus = 'MATCHED';
      confidence = 'HIGH';
      candidateEvidence = `${matchedEdu.degree} in ${matchedEdu.fieldOfStudy} (${matchedEdu.institution})`;
      explanation = `Verified degree from ${matchedEdu.institution}.`;
    } else if (matchedExp && (matchedSkill || matchedProject)) {
      matchStatus = 'MATCHED';
      confidence = 'HIGH';
      linkedExperienceRole = `${matchedExp.roleTitle} at ${matchedExp.company}`;
      linkedProjectTitle = matchedProject?.title;
      candidateEvidence = `Used in work experience as ${matchedExp.roleTitle} at ${matchedExp.company}` +
        (matchedProject ? ` and project '${matchedProject.title}'` : '');
      explanation = `Strong evidence present across professional internship and technical projects.`;
    } else if (matchedProject) {
      matchStatus = 'MATCHED';
      confidence = 'HIGH';
      linkedProjectTitle = matchedProject.title;
      candidateEvidence = `Built in project '${matchedProject.title}': ${matchedProject.description}`;
      explanation = `Demonstrated practical project evidence.`;
    } else if (matchedSkill) {
      matchStatus = matchedSkill.proficiency === 'EXPERT' || matchedSkill.proficiency === 'ADVANCED' ? 'MATCHED' : 'PARTIAL';
      confidence = 'MEDIUM';
      candidateEvidence = `Self-reported skill with ${matchedSkill.proficiency} proficiency (${matchedSkill.yearsExperience || 1}+ yrs)`;
      explanation = `Skill listed in candidate profile; partial project/work verification.`;
    }

    return {
      requirementId: req.id,
      requirementName: req.name,
      category: req.category,
      matchStatus,
      confidence,
      candidateEvidence,
      linkedProjectTitle,
      linkedExperienceRole,
      explanation
    };
  }
}

// Lazy load the graph matcher to avoid circular deps or init errors
let instance: EvidenceMatcherEngine;

if (process.env.NEO4J_URI) {
  // Use CommonJS require or just import normally since we are in TS 
  // and Next.js can handle it
  const { GraphEvidenceMatcher } = require('../../graph/evidence-graph');
  instance = new GraphEvidenceMatcher();
} else {
  instance = new EvidenceMatcherEngine();
}

export const evidenceEngine = instance;
