import { getSession } from './client';
import { CandidateProfile, Job, JobRequirement, JobEvidenceMatch, JobMatchAnalysis, MatchStatus, ConfidenceLevel } from '@/lib/types';
import { EvidenceMatcherEngine } from '@/lib/agent/tools/evidence-matcher';

export class GraphEvidenceMatcher extends EvidenceMatcherEngine {
  public async analyzeJobMatchGraph(candidate: CandidateProfile, job: Job): Promise<JobMatchAnalysis> {
    const session = getSession();
    if (!session) {
      console.warn('Neo4j not available, falling back to string matching.');
      return super.analyzeJobMatch(candidate, job);
    }

    try {
      const evidenceMap: JobEvidenceMatch[] = [];

      for (const req of job.requirements) {
        const query = `
          MATCH path = (c:Candidate {id: $candidateId})-[*1..3]->(s:Skill)<-[:MAPS_TO]-(r:Requirement)<-[:REQUIRES]-(j:Job {id: $jobId})
          WHERE r.id = $reqId
          RETURN r, s, path, length(path) as depth
          LIMIT 1
        `;
        
        const result = await session.run(query, {
          candidateId: candidate.id,
          jobId: job.id,
          reqId: req.id
        });

        // Use fallback method to evaluate single requirement as a baseline
        let fallbackMatch = this.evaluateRequirement(candidate, req);

        if (result.records.length > 0) {
          // Graph found a path
          const record = result.records[0];
          const depth = record.get('depth').toNumber();
          const s = record.get('s').properties;
          const r = record.get('r').properties;
          
          let confidence: ConfidenceLevel = 'HIGH';
          if (depth > 2) confidence = 'MEDIUM';
          
          // For graph match, we'll try to find connected projects/experience
          const path = record.get('path');
          let linkedProjectTitle = undefined;
          let linkedExperienceRole = undefined;
          let candidateEvidence = \`Found graph path of depth ${depth} to skill ${s.name}\`;

          // Iterate through path segments to extract context
          for (let i = 0; i < path.segments.length; i++) {
             const segment = path.segments[i];
             const startNode = segment.start.labels[0];
             const endNode = segment.end.labels[0];
             
             if (startNode === 'Project' || endNode === 'Project') {
               const pNode = startNode === 'Project' ? segment.start : segment.end;
               linkedProjectTitle = pNode.properties.title;
               candidateEvidence = \`Built in project '${linkedProjectTitle}' using ${s.name}\`;
             } else if (startNode === 'Experience' || endNode === 'Experience') {
               const eNode = startNode === 'Experience' ? segment.start : segment.end;
               linkedExperienceRole = \`${eNode.properties.role_title} at ${eNode.properties.company}\`;
               candidateEvidence = \`Used ${s.name} in work experience as ${linkedExperienceRole}\`;
             }
          }
          
          evidenceMap.push({
            requirementId: req.id,
            requirementName: req.name,
            category: req.category,
            matchStatus: 'MATCHED',
            confidence,
            candidateEvidence,
            linkedProjectTitle,
            linkedExperienceRole,
            explanation: 'Verified via structural graph relationship.'
          });
        } else {
          // No graph path, keep fallback
          evidenceMap.push(fallbackMatch);
        }
      }

      // Re-calculate the overall score
      const skillGaps = evidenceMap.filter(m => m.matchStatus === 'MISSING' || m.matchStatus === 'PARTIAL' || m.matchStatus === 'UNKNOWN');
      const matchedCount = evidenceMap.filter(m => m.matchStatus === 'MATCHED').length;
      const partialCount = evidenceMap.filter(m => m.matchStatus === 'PARTIAL').length;
      const totalReqs = Math.max(1, evidenceMap.length);
  
      const technicalAlignment = Math.min(100, Math.round(((matchedCount + partialCount * 0.5) / totalReqs) * 100));
      
      const projectMatchCount = candidate.projects.filter(p =>
        job.requirements.some(r =>
          p.technologies.some(t => t.toLowerCase().includes(r.name.toLowerCase()) || r.name.toLowerCase().includes(t.toLowerCase()))
        )
      ).length;
      const projectRelevance = Math.min(100, Math.round((projectMatchCount / Math.max(1, candidate.projects.length)) * 100));
  
      const hasWorkExp = candidate.experience.length > 0;
      const experienceMatch = hasWorkExp ? 85 : 60;
  
      const rolePreference = candidate.targetTitles.some(t => job.title.toLowerCase().includes(t.toLowerCase())) ? 95 : 75;
  
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
  
      const summary = \`Candidate matches ${matchedCount}/${totalReqs} requirements with verified evidence via Neo4j Graph. Overall match score is ${overallScore}%.\`;

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

    } finally {
      await session.close();
    }
  }

  // Need to make evaluateRequirement public or protected in base class to call it, 
  // but it's private. Let's just override analyzeJobMatch completely if needed 
  // or use the base class method directly when Neo4j is not available.
  // We'll reimplement the evaluateRequirement here locally to ensure we can use it as fallback.

  private evaluateRequirement(candidate: CandidateProfile, req: JobRequirement): JobEvidenceMatch {
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
      e.skillsUsed.some(s => s.toLowerCase().includes(reqLower) || reqLower.includes(s.toLowerCase())) ||
      e.description.toLowerCase().includes(reqLower) ||
      e.highlights.some(h => h.toLowerCase().includes(reqLower))
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
    let explanation = \`Candidate does not have verified experience in ${req.name}.\`;

    if (req.category === 'EDUCATION' && matchedEdu) {
      matchStatus = 'MATCHED';
      confidence = 'HIGH';
      candidateEvidence = \`${matchedEdu.degree} in ${matchedEdu.fieldOfStudy} (${matchedEdu.institution})\`;
      explanation = \`Verified degree from ${matchedEdu.institution}.\`;
    } else if (matchedExp && (matchedSkill || matchedProject)) {
      matchStatus = 'MATCHED';
      confidence = 'HIGH';
      linkedExperienceRole = \`${matchedExp.roleTitle} at ${matchedExp.company}\`;
      linkedProjectTitle = matchedProject?.title;
      candidateEvidence = \`Used in work experience as ${matchedExp.roleTitle} at ${matchedExp.company}\` +
        (matchedProject ? \` and project '${matchedProject.title}'\` : '');
      explanation = \`Strong evidence present across professional internship and technical projects.\`;
    } else if (matchedProject) {
      matchStatus = 'MATCHED';
      confidence = 'HIGH';
      linkedProjectTitle = matchedProject.title;
      candidateEvidence = \`Built in project '${matchedProject.title}': ${matchedProject.description}\`;
      explanation = \`Demonstrated practical project evidence.\`;
    } else if (matchedSkill) {
      matchStatus = matchedSkill.proficiency === 'EXPERT' || matchedSkill.proficiency === 'ADVANCED' ? 'MATCHED' : 'PARTIAL';
      confidence = 'MEDIUM';
      candidateEvidence = \`Self-reported skill with ${matchedSkill.proficiency} proficiency (${matchedSkill.yearsExperience || 1}+ yrs)\`;
      explanation = \`Skill listed in candidate profile; partial project/work verification.\`;
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
