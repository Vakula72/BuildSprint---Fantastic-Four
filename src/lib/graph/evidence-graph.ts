import { EvidenceMatcherEngine } from '../agent/tools/evidence-matcher';
import { getSession } from './client';
import { CandidateProfile, Job, JobMatchAnalysis, JobEvidenceMatch, JobRequirement, MatchStatus, ConfidenceLevel } from '../types';

export class GraphEvidenceMatcher extends EvidenceMatcherEngine {
  async analyzeJobMatch(candidate: CandidateProfile, job: Job): Promise<JobMatchAnalysis> {
    const session = getSession();

    // If graph is unavailable, fallback to string matching
    if (!session) {
      console.warn('Graph session unavailable, falling back to string matcher.');
      return super.analyzeJobMatch(candidate, job);
    }

    try {
      const evidenceMap: JobEvidenceMatch[] = [];

      for (const req of job.requirements) {
        // Query to find path between Candidate and Requirement
        // Candidate -> HAS_SKILL/BUILT/WORKED_AT -> Skill/Project/Experience -> USES/USED_SKILL/MAPS_TO -> Requirement
        
        // Simplified query for the hackathon: Match if Candidate has a skill that maps to the requirement
        // or has a project/experience with a skill that maps to the requirement
        const result = await session.executeRead(tx =>
          tx.run(
            `
            MATCH (c:Candidate {id: $candidateId})
            MATCH (r:Requirement {id: $reqId})
            
            // Try to find a path up to 3 hops
            OPTIONAL MATCH path = (c)-[*1..3]->(s:Skill)<-[:MAPS_TO]-(r)
            
            RETURN path, length(path) as depth,
                   [(n)-[:BUILT]->(p:Project) WHERE n = c AND p IN nodes(path) | p.title] as projectTitles,
                   [(n)-[:WORKED_AT]->(e:Experience) WHERE n = c AND e IN nodes(path) | e.role_title + " at " + e.company] as experienceRoles
            ORDER BY depth ASC
            LIMIT 1
            `,
            {
              candidateId: candidate.id,
              reqId: req.id,
            }
          )
        );

        let matchStatus: MatchStatus = 'MISSING';
        let confidence: ConfidenceLevel = 'LOW';
        let candidateEvidence = 'No graph evidence found.';
        let explanation = 'No path found in knowledge graph.';
        let linkedProjectTitle: string | undefined;
        let linkedExperienceRole: string | undefined;

        if (result.records.length > 0 && result.records[0].get('path')) {
          const depth = result.records[0].get('depth').toInt();
          const pTitles = result.records[0].get('projectTitles');
          const eRoles = result.records[0].get('experienceRoles');

          if (eRoles && eRoles.length > 0) {
              matchStatus = 'MATCHED';
              confidence = 'HIGH';
              linkedExperienceRole = eRoles[0];
              candidateEvidence = `Found via graph through work experience: ${linkedExperienceRole}`;
              explanation = `Verified by knowledge graph traversing experience nodes. (Depth: ${depth})`;
          } else if (pTitles && pTitles.length > 0) {
              matchStatus = 'MATCHED';
              confidence = 'HIGH';
              linkedProjectTitle = pTitles[0];
              candidateEvidence = `Found via graph through project: ${linkedProjectTitle}`;
              explanation = `Verified by knowledge graph traversing project nodes. (Depth: ${depth})`;
          } else if (depth === 2) {
              // Direct skill match
              matchStatus = 'MATCHED';
              confidence = 'MEDIUM';
              candidateEvidence = `Found via graph as a direct mapped skill.`;
              explanation = `Verified by direct skill relationship in graph.`;
          } else {
             // Fallback evaluation for other cases
             const fallback = super.evaluateRequirement(candidate, req);
             matchStatus = fallback.matchStatus;
             confidence = fallback.confidence;
             candidateEvidence = fallback.candidateEvidence;
             explanation = fallback.explanation;
             linkedProjectTitle = fallback.linkedProjectTitle;
             linkedExperienceRole = fallback.linkedExperienceRole;
          }
        } else {
           // Fallback if graph query found no path
           const fallback = super.evaluateRequirement(candidate, req);
           matchStatus = fallback.matchStatus;
           confidence = fallback.confidence;
           candidateEvidence = fallback.candidateEvidence;
           explanation = fallback.explanation;
           linkedProjectTitle = fallback.linkedProjectTitle;
           linkedExperienceRole = fallback.linkedExperienceRole;
        }

        evidenceMap.push({
          requirementId: req.id,
          requirementName: req.name,
          category: req.category,
          matchStatus,
          confidence,
          candidateEvidence,
          linkedProjectTitle,
          linkedExperienceRole,
          explanation
        });
      }

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
      if (technicalAlignment >= 80) strengths.push('Strong technical skill alignment (Graph Verified)');
      if (projectRelevance >= 70) strengths.push('High project relevance');
      if (hasWorkExp) strengths.push('Prior relevant work experience');
      if (rolePreference >= 80) strengths.push('Excellent match with target roles');

      const summary = `Candidate matches ${matchedCount}/${totalReqs} requirements using Knowledge Graph analysis. Overall match score is ${overallScore}%.`;

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

    } catch (error) {
      console.error('Graph analysis failed, falling back:', error);
      return super.analyzeJobMatch(candidate, job);
    } finally {
      await session.close();
    }
  }
}
