/**
 * Neo4j Graph Database Schema Documentation
 * 
 * Node Labels & Properties:
 * -------------------------
 * (:Candidate { id: string, name: string, email: string })
 *   Represents a job candidate.
 * 
 * (:Skill { name: string, category: string, proficiency: string, years_experience: number })
 *   Represents a technical or soft skill possessed by a candidate or required by a job.
 * 
 * (:Project { id: string, title: string, description: string, metrics: string })
 *   Represents a project a candidate has worked on.
 * 
 * (:Experience { id: string, role_title: string, company: string, start_date: string, end_date: string })
 *   Represents a candidate's work experience.
 * 
 * (:Job { id: string, title: string, company: string, location: string })
 *   Represents a job posting.
 * 
 * (:Requirement { id: string, name: string, category: string, is_mandatory: boolean })
 *   Represents a specific requirement for a job.
 * 
 * 
 * Relationship Types:
 * -------------------
 * Candidate Relationships:
 * - (Candidate)-[:HAS_SKILL { proficiency: string }]->(Skill)
 * - (Candidate)-[:BUILT]->(Project)
 * - (Candidate)-[:WORKED_AT]->(Experience)
 * 
 * Evidence Relationships (How candidates meet requirements):
 * - (Project)-[:USES]->(Skill)
 * - (Experience)-[:USED_SKILL]->(Skill)
 * - (Project)-[:SATISFIES]->(Requirement)
 * - (Experience)-[:SATISFIES]->(Requirement)
 * 
 * Job Relationships:
 * - (Job)-[:REQUIRES]->(Requirement)
 * - (Requirement)-[:MAPS_TO]->(Skill)
 */

export const SCHEMA_DOC = "Graph schema documented in comments.";
