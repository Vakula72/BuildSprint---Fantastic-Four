import { Session } from 'neo4j-driver';
import { getSession } from './client';
import { CandidateProfile, Job, CandidateSkill, CandidateProject, CandidateExperience, JobRequirement } from '../types';

export class GraphSyncService {
  /**
   * Syncs a candidate profile, their skills, projects, and experiences to the graph.
   */
  async syncCandidate(profile: CandidateProfile): Promise<boolean> {
    const session = getSession();
    if (!session) return false;

    try {
      // 1. Merge Candidate node
      await session.executeWrite(tx =>
        tx.run(
          `
          MERGE (c:Candidate {id: $id})
          SET c.name = $name, c.email = $email
          `,
          { id: profile.id, name: profile.fullName, email: profile.email }
        )
      );

      // 2. Merge Skills and HAS_SKILL relationships
      if (profile.skills && profile.skills.length > 0) {
        for (const skill of profile.skills) {
          await session.executeWrite(tx =>
            tx.run(
              `
              MATCH (c:Candidate {id: $candidateId})
              MERGE (s:Skill {name: $skillName})
              SET s.category = $category,
                  s.proficiency = $proficiency,
                  s.years_experience = $yearsExperience
              MERGE (c)-[r:HAS_SKILL]->(s)
              SET r.proficiency = $proficiency
              `,
              {
                candidateId: profile.id,
                skillName: skill.name.toLowerCase(),
                category: skill.category,
                proficiency: skill.proficiency,
                yearsExperience: skill.yearsExperience || 0,
              }
            )
          );
        }
      }

      // 3. Merge Projects and relationships
      if (profile.projects && profile.projects.length > 0) {
        for (const project of profile.projects) {
          await session.executeWrite(tx =>
            tx.run(
              `
              MATCH (c:Candidate {id: $candidateId})
              MERGE (p:Project {id: $projectId})
              SET p.title = $title,
                  p.description = $description,
                  p.metrics = $metrics
              MERGE (c)-[:BUILT]->(p)
              `,
              {
                candidateId: profile.id,
                projectId: project.id,
                title: project.title,
                description: project.description,
                metrics: project.metrics || '',
              }
            )
          );

          // Project USES Skill
          if (project.technologies) {
             for (const tech of project.technologies) {
               await session.executeWrite(tx =>
                 tx.run(
                   `
                   MATCH (p:Project {id: $projectId})
                   MERGE (s:Skill {name: $skillName})
                   MERGE (p)-[:USES]->(s)
                   `,
                   {
                     projectId: project.id,
                     skillName: tech.toLowerCase(),
                   }
                 )
               );
             }
          }
        }
      }

      // 4. Merge Experience and relationships
      if (profile.experience && profile.experience.length > 0) {
        for (const exp of profile.experience) {
          await session.executeWrite(tx =>
            tx.run(
              `
              MATCH (c:Candidate {id: $candidateId})
              MERGE (e:Experience {id: $expId})
              SET e.role_title = $roleTitle,
                  e.company = $company,
                  e.start_date = $startDate,
                  e.end_date = $endDate
              MERGE (c)-[:WORKED_AT]->(e)
              `,
              {
                candidateId: profile.id,
                expId: exp.id,
                roleTitle: exp.roleTitle,
                company: exp.company,
                startDate: exp.startDate,
                endDate: exp.endDate || 'Present',
              }
            )
          );

           // Experience USED_SKILL Skill
           if (exp.skillsUsed) {
             for (const skill of exp.skillsUsed) {
                await session.executeWrite(tx =>
                  tx.run(
                    `
                    MATCH (e:Experience {id: $expId})
                    MERGE (s:Skill {name: $skillName})
                    MERGE (e)-[:USED_SKILL]->(s)
                    `,
                    {
                      expId: exp.id,
                      skillName: skill.toLowerCase(),
                    }
                  )
                );
             }
           }
        }
      }

      return true;
    } catch (error) {
      console.error('Error syncing candidate to graph:', error);
      return false;
    } finally {
      await session.close();
    }
  }

  /**
   * Syncs a job and its requirements to the graph.
   */
  async syncJob(job: Job): Promise<boolean> {
    const session = getSession();
    if (!session) return false;

    try {
      // 1. Merge Job node
      await session.executeWrite(tx =>
        tx.run(
          `
          MERGE (j:Job {id: $id})
          SET j.title = $title, j.company = $company, j.location = $location
          `,
          { id: job.id, title: job.title, company: job.company, location: job.location }
        )
      );

      // 2. Merge Requirements and REQUIRES/MAPS_TO relationships
      if (job.requirements && job.requirements.length > 0) {
        for (const req of job.requirements) {
          await session.executeWrite(tx =>
            tx.run(
              `
              MATCH (j:Job {id: $jobId})
              MERGE (r:Requirement {id: $reqId})
              SET r.name = $name,
                  r.category = $category,
                  r.is_mandatory = $isMandatory
              MERGE (j)-[:REQUIRES]->(r)
              `,
              {
                jobId: job.id,
                reqId: req.id,
                name: req.name,
                category: req.category,
                isMandatory: req.isMandatory,
              }
            )
          );

          // Infer skill name from requirement (basic logic)
          // You might have a better mapping system or LLM to do this
          const inferredSkillName = req.name.toLowerCase().trim();
          
          await session.executeWrite(tx =>
             tx.run(
                `
                MATCH (r:Requirement {id: $reqId})
                MERGE (s:Skill {name: $skillName})
                MERGE (r)-[:MAPS_TO]->(s)
                `,
                {
                   reqId: req.id,
                   skillName: inferredSkillName
                }
             )
          );
        }
      }

      return true;
    } catch (error) {
      console.error('Error syncing job to graph:', error);
      return false;
    } finally {
      await session.close();
    }
  }

  /**
   * Placeholder for full sync from SQLite. 
   * In a real implementation, this would read from SQLite DB and call syncCandidate / syncJob.
   */
  async syncAll(): Promise<boolean> {
      // implementation omitted for brevity, usually involves calling the DB layer
      console.log('GraphSyncService.syncAll() called.');
      return true;
  }
}

export const graphSync = new GraphSyncService();
