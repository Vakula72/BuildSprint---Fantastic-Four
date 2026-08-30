import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { Job } from '../../types';
import { extractRequirements } from '../requirement-extractor';

export async function scrapeAdzuna(): Promise<Job[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_API_KEY;

  if (!appId || !appKey) {
    console.warn('ADZUNA_APP_ID or ADZUNA_API_KEY is not set. Skipping Adzuna scrape.');
    return [];
  }

  const countries = ['in', 'us', 'gb'];
  const allJobs: Job[] = [];

  for (const country of countries) {
    try {
      const response = await axios.get(`https://api.adzuna.com/v1/api/jobs/${country}/search/1`, {
        params: {
          app_id: appId,
          app_key: appKey,
          results_per_page: 20,
          what: 'software engineer OR frontend OR backend OR fullstack',
          'content-type': 'application/json'
        }
      });

      const results = response.data.results;
      if (!results || !Array.isArray(results)) continue;

      for (const item of results) {
        let workplaceType: 'REMOTE' | 'HYBRID' | 'ON_SITE' = 'ON_SITE';
        
        // Adzuna rarely sets remote clearly in standard tier, but sometimes contract_time helps,
        // or check description.
        const descLower = (item.description || '').toLowerCase();
        if (descLower.includes('remote')) {
            workplaceType = 'REMOTE';
        } else if (descLower.includes('hybrid')) {
            workplaceType = 'HYBRID';
        }

        let salaryRange = undefined;
        if (item.salary_min && item.salary_max) {
             const symbol = country === 'in' ? '₹' : country === 'gb' ? '£' : '$';
             salaryRange = `${symbol}${Math.round(item.salary_min)} - ${symbol}${Math.round(item.salary_max)}`;
        }

        const reqs = extractRequirements(item.description || '');

        allJobs.push({
          id: uuidv4(),
          title: item.title,
          company: item.company?.display_name || 'Unknown Company',
          location: item.location?.display_name || 'Unknown',
          workplaceType: workplaceType,
          salaryRange: salaryRange,
          description: item.description || '',
          sourceUrl: item.redirect_url,
          postedDate: item.created || new Date().toISOString(),
          requirements: reqs,
          recruiterContact: {
            name: item.company?.display_name || 'Unknown',
            title: 'Hiring Team',
            email: ''
          }
        });
      }
    } catch (error) {
      console.error(`Error fetching from Adzuna for country ${country}:`, error);
    }
  }

  return allJobs;
}
