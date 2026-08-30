/**
 * Neo4j Graph Model Schema for Agentic Job Hunt Copilot
 * 
 * Nodes:
 * - (:Candidate {id, name, email})
 * - (:Skill {name, category, proficiency, years_experience})
 * - (:Project {id, title, description, metrics})
 * - (:Experience {id, role_title, company, start_date, end_date})
 * - (:Job {id, title, company, location})
 * - (:Requirement {id, name, category, is_mandatory})
 * 
 * Relationships:
 * - (Candidate)-[:HAS_SKILL {proficiency}]->(Skill)
 * - (Candidate)-[:BUILT]->(Project)
 * - (Candidate)-[:WORKED_AT]->(Experience)
 * - (Project)-[:USES]->(Skill)
 * - (Experience)-[:USED_SKILL]->(Skill)
 * - (Job)-[:REQUIRES]->(Requirement)
 * - (Requirement)-[:MAPS_TO]->(Skill)
 * - (Project)-[:SATISFIES]->(Requirement)
 * - (Experience)-[:SATISFIES]->(Requirement)
 */
export const schema = {};