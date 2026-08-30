import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { Job, JobRequirement } from '../../types';
import { extractRequirements } from '../requirement-extractor';

export async function scrapeRemoteOK(): Promise<Job[]> {
  try {
    const response = await axios.get('https://remoteok.com/api', {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    });

    const data = response.data;
    if (!Array.isArray(data)) return [];

    const jobs: Job[] = [];

    // Skip the first item as it's legal info
    for (let i = 1; i < data.length; i++) {
      const item = data[i];

      let reqs: JobRequirement[] = [];
      
      if (item.tags && Array.isArray(item.tags)) {
          // Extract requirements from tags
          reqs = item.tags.map((tag: string) => ({
             id: uuidv4(),
             name: tag,
             category: 'TECHNICAL',
             isMandatory: true // Assume tags are core requirements
          }));
      }

      // Also extract from description to catch anything missed in tags
      const extraReqs = extractRequirements(item.description || '');
      
      // Deduplicate
      const existingReqNames = new Set(reqs.map(r => r.name.toLowerCase()));
      for (const req of extraReqs) {
          if (!existingReqNames.has(req.name.toLowerCase())) {
              reqs.push(req);
              existingReqNames.add(req.name.toLowerCase());
          }
      }

      jobs.push({
        id: uuidv4(), // generate our own UUID
        title: item.position || 'Unknown Title',
        company: item.company || 'Unknown Company',
        location: item.location || 'Remote',
        workplaceType: 'REMOTE',
        salaryRange: item.salary_min && item.salary_max ? `$${item.salary_min} - $${item.salary_max}` : undefined,
        description: item.description || '',
        sourceUrl: item.url,
        postedDate: item.date || new Date().toISOString(),
        requirements: reqs,
        recruiterContact: {
          name: item.company || 'Unknown',
          title: 'Hiring Team',
          email: '' // Not provided by API usually
        },
        companyInfo: {
            overview: '',
            industry: '',
            techStack: item.tags || []
        }
      });
    }

    return jobs;
  } catch (error) {
    console.error('Error fetching from RemoteOK:', error);
    return [];
  }
}
