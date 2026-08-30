import { scrapeRemoteOK } from './sources/remoteok';
import { scrapeHNHiring } from './sources/hnhiring';
import { scrapeAdzuna } from './sources/adzuna';
import { db } from '../db/store';
import { graphSync } from '../graph/sync';
import { Job } from '../types';
import { randomUUID } from 'crypto';

export class JobScraperService {
  /**
   * Scrapes RemoteOK and logs trace.
   */
  async scrapeRemoteOK(userId?: string): Promise<Job[]> {
      const jobs = await scrapeRemoteOK();
      db.addTrace({
          workflowId: 'manual-scrape',
          agentName: 'OpportunityDiscoveryAgent',
          task: 'Scraping RemoteOK',
          status: 'SUCCESS',
          details: `Found ${jobs.length} jobs on RemoteOK.`,
          toolUsed: 'RemoteOK Scraper'
      }, userId);
      return jobs;
  }

  /**
   * Scrapes Hacker News Hiring and logs trace.
   */
  async scrapeHNHiring(userId?: string): Promise<Job[]> {
      const jobs = await scrapeHNHiring();
      db.addTrace({
          workflowId: 'manual-scrape',
          agentName: 'OpportunityDiscoveryAgent',
          task: 'Scraping HN Hiring',
          status: 'SUCCESS',
          details: `Found ${jobs.length} jobs on HN Hiring.`,
          toolUsed: 'HN Scraper'
      }, userId);
      return jobs;
  }

  /**
   * Scrapes Adzuna and logs trace.
   */
  async scrapeAdzuna(userId?: string): Promise<Job[]> {
      const jobs = await scrapeAdzuna();
      db.addTrace({
          workflowId: 'manual-scrape',
          agentName: 'OpportunityDiscoveryAgent',
          task: 'Scraping Adzuna',
          status: 'SUCCESS',
          details: `Found ${jobs.length} jobs on Adzuna.`,
          toolUsed: 'Adzuna Scraper'
      }, userId);
      return jobs;
  }

  /**
   * Runs all scrapers, deduplicates, saves to SQLite, returns new job count.
   */
  async scrapeAll(userId?: string): Promise<{ newJobsAdded: number, totalJobs: number, sources: string[] }> {
      const results = await Promise.allSettled([
          this.scrapeRemoteOK(userId),
          this.scrapeHNHiring(userId),
          this.scrapeAdzuna(userId)
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
              // Sync to Graph DB
              try {
                  await graphSync.syncJob(job);
              } catch (err) {
                  console.error('[Neo4j] Failed to sync new job:', err);
              }
          }
      }

      db.addTrace({
          workflowId: 'manual-scrape-all',
          agentName: 'OpportunityDiscoveryAgent',
          task: 'Consolidating Scrape Results',
          status: 'SUCCESS',
          details: `Added ${newJobsAdded} new jobs out of ${allJobs.length} total found across ${sources.join(', ')}.`,
          toolUsed: 'JobScraperService'
      }, userId);

      return {
          newJobsAdded,
          totalJobs: allJobs.length,
          sources
      };
  }
}

export const jobScraper = new JobScraperService();
