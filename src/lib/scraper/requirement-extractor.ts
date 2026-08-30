import { JobRequirement, RequirementCategory } from '../types';
import { v4 as uuidv4 } from 'uuid';

const TECH_KEYWORDS: Record<string, RequirementCategory> = {
  // Languages
  typescript: 'TECHNICAL',
  javascript: 'TECHNICAL',
  python: 'TECHNICAL',
  go: 'TECHNICAL',
  rust: 'TECHNICAL',
  java: 'TECHNICAL',
  'c++': 'TECHNICAL',
  ruby: 'TECHNICAL',
  // Frontend
  react: 'TECHNICAL',
  'next.js': 'TECHNICAL',
  vue: 'TECHNICAL',
  angular: 'TECHNICAL',
  'tailwind css': 'TECHNICAL',
  graphql: 'TECHNICAL',
  // Backend
  'node.js': 'TECHNICAL',
  express: 'TECHNICAL',
  fastapi: 'TECHNICAL',
  django: 'TECHNICAL',
  postgresql: 'TECHNICAL',
  mongodb: 'TECHNICAL',
  redis: 'TECHNICAL',
  // DevOps
  docker: 'TECHNICAL',
  kubernetes: 'TECHNICAL',
  aws: 'TECHNICAL',
  gcp: 'TECHNICAL',
  azure: 'TECHNICAL',
  'ci/cd': 'TECHNICAL',
  terraform: 'TECHNICAL',
  // AI/ML
  tensorflow: 'TECHNICAL',
  pytorch: 'TECHNICAL',
  langchain: 'TECHNICAL',
  openai: 'TECHNICAL',
  gemini: 'TECHNICAL',
  rag: 'TECHNICAL'
};

export function extractRequirements(description: string): JobRequirement[] {
  const reqs: JobRequirement[] = [];
  const descLower = description.toLowerCase();
  
  for (const [keyword, category] of Object.entries(TECH_KEYWORDS)) {
    if (descLower.includes(keyword)) {
      // Find context around keyword
      const index = descLower.indexOf(keyword);
      const start = Math.max(0, index - 50);
      const end = Math.min(descLower.length, index + 50);
      const context = descLower.substring(start, end);

      let isMandatory = true;
      if (
        context.includes('nice to have') || 
        context.includes('bonus') || 
        context.includes('plus') || 
        context.includes('preferred') ||
        context.includes('optional')
      ) {
        isMandatory = false;
      } else if (
        context.includes('required') || 
        context.includes('must have') || 
        context.includes('essential')
      ) {
         isMandatory = true;
      }

      reqs.push({
        id: uuidv4(),
        name: keyword.charAt(0).toUpperCase() + keyword.slice(1).replace('.js', '.js'),
        category: category,
        isMandatory: isMandatory,
        description: `Extracted from description context.`
      });
    }
  }

  return reqs;
}
