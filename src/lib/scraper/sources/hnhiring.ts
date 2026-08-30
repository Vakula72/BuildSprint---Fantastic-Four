import axios from 'axios';
import * as cheerio from 'cheerio';
import { v4 as uuidv4 } from 'uuid';
import { Job } from '../../types';
import { extractRequirements } from '../requirement-extractor';

export async function scrapeHNHiring(): Promise<Job[]> {
  try {
    // 1. Get the latest Ask HN Who is hiring post
    const searchRes = await axios.get('https://hn.algolia.com/api/v1/search?query=Ask+HN+Who+is+hiring&tags=story');
    
    if (!searchRes.data.hits || searchRes.data.hits.length === 0) {
        return [];
    }

    const latestPostId = searchRes.data.hits[0].objectID;

    // 2. Get comments for that post
    const commentsRes = await axios.get(`https://hn.algolia.com/api/v1/items/${latestPostId}`);
    
    if (!commentsRes.data.children) {
        return [];
    }

    const jobs: Job[] = [];

    // Parse comments
    for (const comment of commentsRes.data.children) {
        if (!comment.text) continue;

        const text = comment.text;
        const $ = cheerio.load(text);
        const cleanText = $.text(); // Strip HTML tags for processing

        // Simple heuristic to split header from body.
        const lines = cleanText.split('\n');
        const header = lines[0] || '';
        const body = lines.slice(1).join('\n');

        // Heuristics for header parsing
        // Typical format: Company | Role | Location | Salary | REMOTE/ONSITE
        let company = 'Unknown HN Company';
        let title = 'Software Engineer';
        let location = 'Unknown';
        let workplaceType: 'REMOTE' | 'HYBRID' | 'ON_SITE' = 'ON_SITE';

        const headerParts = header.split('|').map(p => p.trim());
        if (headerParts.length > 0) company = headerParts[0];
        if (headerParts.length > 1) title = headerParts[1];
        if (headerParts.length > 2) location = headerParts[2];

        const headerLower = header.toLowerCase();
        if (headerLower.includes('remote')) {
            workplaceType = 'REMOTE';
        } else if (headerLower.includes('hybrid')) {
            workplaceType = 'HYBRID';
        }

        // Extract salary if present
        let salaryRange = undefined;
        const salaryMatch = cleanText.match(/\$[\d,]+k?\s*-\s*\$[\d,]+k?|\$[\d,]+k?/i);
        if (salaryMatch) {
            salaryRange = salaryMatch[0];
        }

        const reqs = extractRequirements(cleanText);

        jobs.push({
            id: uuidv4(),
            title: title,
            company: company,
            location: location,
            workplaceType: workplaceType,
            salaryRange: salaryRange,
            description: cleanText,
            sourceUrl: `https://news.ycombinator.com/item?id=${comment.id}`,
            postedDate: comment.created_at || new Date().toISOString(),
            requirements: reqs,
            recruiterContact: {
                name: company,
                title: 'HN Poster',
                email: ''
            }
        });
    }

    return jobs;
  } catch (error) {
    console.error('Error fetching from HN Hiring:', error);
    return [];
  }
}
