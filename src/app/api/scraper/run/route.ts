import { NextResponse } from 'next/server';
import { jobScraper } from '@/lib/scraper';
import { auth } from '@/auth'; // Assuming auth is exported from here or next-auth

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let source = 'all';
    try {
        const body = await req.json();
        if (body && body.source) {
            source = body.source;
        }
    } catch(e) {
        // body might be empty, that's fine
    }

    let result = { newJobsAdded: 0, totalJobs: 0, sources: [] as string[] };

    if (source === 'remoteok') {
        const jobs = await jobScraper.scrapeRemoteOK();
        result = { newJobsAdded: jobs.length, totalJobs: jobs.length, sources: ['remoteok'] }; // Note: this doesn't deduplicate or save in the individual methods based on the prompt reqs, but scrapeAll does.
    } else if (source === 'hn') {
        const jobs = await jobScraper.scrapeHNHiring();
        result = { newJobsAdded: jobs.length, totalJobs: jobs.length, sources: ['hn'] };
    } else if (source === 'adzuna') {
        const jobs = await jobScraper.scrapeAdzuna();
         result = { newJobsAdded: jobs.length, totalJobs: jobs.length, sources: ['adzuna'] };
    } else {
        result = await jobScraper.scrapeAll();
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('API /api/scraper/run error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
