import { getSession } from './client';
import { CandidateProfile, Job } from '@/lib/types';
import { db } from '@/lib/db/store';

export class GraphSyncService {
  public async syncCandidate(profile: CandidateProfile): Promise<void> {
    const session = getSession();
    if (!session) return;

    try {
      // 1. Merge Candidate
      await session.run(
        `MERGE (c:Candidate {id: $id})
         SET c.name = $name, c.email = $email`,
        { id: profile.id, name: profile.fullName, email: profile.email }
      );

      // 2. Merge Skills & relationships
      for (const skill of profile.skills) {
        await session.run(
          `MERGE (s:Skill {name: $name})
           SET s.category = $category, s.proficiency = $proficiency, s.years_experience = $years
           WITH s
           MATCH (c:Candidate {id: $candidateId})
           MERGE (c)-[:HAS_SKILL {proficiency: $proficiency}]->(s)`,
          {
            name: skill.name,
            category: skill.category,
            proficiency: skill.proficiency,
            years: skill.yearsExperience || 1,
            candidateId: profile.id
          }
        );
      }

      // 3. Merge Projects & relationships
      for (const proj of profile.projects) {
        await session.run(
          `MERGE (p:Project {id: $id})
           SET p.title = $title, p.description = $desc, p.metrics = $metrics
           WITH p
           MATCH (c:Candidate {id: $candidateId})
           MERGE (c)-[:BUILT]->(p)`,
          {
            id: proj.id,
            title: proj.title,
            desc: proj.description,
            metrics: proj.metrics || '',
            candidateId: profile.id
          }
        );

        // Link project to skills
        for (const tech of proj.technologies) {
          await session.run(
            `MATCH (p:Project {id: $projId})
             MERGE (s:Skill {name: $tech})
             MERGE (p)-[:USES]->(s)`,
            { projId: proj.id, tech }
          );
        }
      }

      // 4. Merge Experience & relationships
      for (const exp of profile.experience) {
        await session.run(
          `MERGE (e:Experience {id: $id})
           SET e.role_title = $role, e.company = $company, e.start_date = $start, e.end_date = $end
           WITH e
           MATCH (c:Candidate {id: $candidateId})
           MERGE (c)-[:WORKED_AT]->(e)`,
          {
            id: exp.id,
            role: exp.roleTitle,
            company: exp.company,
            start: exp.startDate,
            end: exp.endDate || 'Present',
            candidateId: profile.id
          }
        );

        // Link experience to skills
        for (const tech of exp.skillsUsed) {
          await session.run(
            `MATCH (e:Experience {id: $expId})
             MERGE (s:Skill {name: $tech})
             MERGE (e)-[:USED_SKILL]->(s)`,
            { expId: exp.id, tech }
          );
        }
      }
    } catch (err) {
      console.error('Failed to sync candidate to graph:', err);
    } finally {
      await session.close();
    }
  }

  public async syncJob(job: Job): Promise<void> {
    const session = getSession();
    if (!session) return;

    try {
      // 1. Merge Job
      await session.run(
        `MERGE (j:Job {id: $id})
         SET j.title = $title, j.company = $company, j.location = $location`,
        { id: job.id, title: job.title, company: job.company, location: job.location }
      );

      // 2. Merge Requirements & relationships
      for (const req of job.requirements) {
        await session.run(
          `MERGE (r:Requirement {id: $id})
           SET r.name = $name, r.category = $category, r.is_mandatory = $isMandatory
           WITH r
           MATCH (j:Job {id: $jobId})
           MERGE (j)-[:REQUIRES]->(r)
           WITH r
           MERGE (s:Skill {name: $name})
           MERGE (r)-[:MAPS_TO]->(s)`,
          {
            id: req.id,
            name: req.name,
            category: req.category,
            isMandatory: req.isMandatory,
            jobId: job.id
          }
        );
      }
    } catch (err) {
      console.error('Failed to sync job to graph:', err);
    } finally {
      await session.close();
    }
  }

  public async syncAll(): Promise<void> {
    const profile = db.getProfile();
    const jobs = db.getJobs();

    if (profile) {
      await this.syncCandidate(profile);
    }

    for (const job of jobs) {
      await this.syncJob(job);
    }
  }
}

export const graphSyncService = new GraphSyncService();
