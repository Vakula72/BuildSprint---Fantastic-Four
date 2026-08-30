import { scrapeRemoteOK } from './sources/remoteok';
import { scrapeHNHiring } from './sources/hnhiring';
import { scrapeAdzuna } from './sources/adzuna';
import { db } from '../db/store';
import { Job } from '../types';
import { randomUUID } from 'crypto';

export class JobScraperService {
  /**
   * Scrapes RemoteOK and logs trace.
   */
  async scrapeRemoteOK(): Promise<Job[]> {
      const jobs = await scrapeRemoteOK();
      db.addTrace({
          id: randomUUID(),
          workflowId: 'manual-scrape',
          timestamp: new Date().toISOString(),
          agentName: 'OpportunityDiscoveryAgent',
          task: 'Scraping RemoteOK',
          status: 'SUCCESS',
          details: `Found ${jobs.length} jobs on RemoteOK.`,
          toolUsed: 'RemoteOK Scraper'
      });
      return jobs;
  }

  /**
   * Scrapes Hacker News Hiring and logs trace.
   */
  async scrapeHNHiring(): Promise<Job[]> {
      const jobs = await scrapeHNHiring();
      db.addTrace({
          id: randomUUID(),
          workflowId: 'manual-scrape',
          timestamp: new Date().toISOString(),
          agentName: 'OpportunityDiscoveryAgent',
          task: 'Scraping HN Hiring',
          status: 'SUCCESS',
          details: `Found ${jobs.length} jobs on HN Hiring.`,
          toolUsed: 'HN Scraper'
      });
      return jobs;
  }

  /**
   * Scrapes Adzuna and logs trace.
   */
  async scrapeAdzuna(): Promise<Job[]> {
      const jobs = await scrapeAdzuna();
      db.addTrace({
          id: randomUUID(),
          workflowId: 'manual-scrape',
          timestamp: new Date().toISOString(),
          agentName: 'OpportunityDiscoveryAgent',
          task: 'Scraping Adzuna',
          status: 'SUCCESS',
          details: `Found ${jobs.length} jobs on Adzuna.`,
          toolUsed: 'Adzuna Scraper'
      });
      return jobs;
  }

  /**
   * Runs all scrapers, deduplicates, saves to SQLite, returns new job count.
   */
  async scrapeAll(): Promise<{ newJobsAdded: number, totalJobs: number, sources: string[] }> {
      const results = await Promise.allSettled([
          this.scrapeRemoteOK(),
          this.scrapeHNHiring(),
          this.scrapeAdzuna()
      ]);

      const allJobs: Job[] = [];
      const sources: string[] = [];

      if (results[0].status === 'fulfilled') {
          allJobs.push(...results[0].value);
          sources.push('remoteok');
      }
      if (results[1].status === 'fulfilled') {
          allJobs.push(...results[1].value);
          sources.push('hn');
      }
      if (results[2].status === 'fulfilled') {
          allJobs.push(...results[2].value);
          sources.push('adzuna');
      }

      // Deduplicate by sourceUrl
      const existingJobs = db.getJobs();
      const existingUrls = new Set(existingJobs.map(j => j.sourceUrl).filter(Boolean));

      let newJobsAdded = 0;
      for (const job of allJobs) {
          if (job.sourceUrl && !existingUrls.has(job.sourceUrl)) {
              db.addJob(job);
              existingUrls.add(job.sourceUrl);
              newJobsAdded++;
          }
      }

      db.addTrace({
          id: randomUUID(),
          workflowId: 'manual-scrape-all',
          timestamp: new Date().toISOString(),
          agentName: 'OpportunityDiscoveryAgent',
          task: 'Consolidating Scrape Results',
          status: 'SUCCESS',
          details: `Added ${newJobsAdded} new jobs out of ${allJobs.length} total found across ${sources.join(', ')}.`,
          toolUsed: 'JobScraperService'
      });

      return {
          newJobsAdded,
          totalJobs: allJobs.length,
          sources
      };
  }
}

export const jobScraper = new JobScraperService();
