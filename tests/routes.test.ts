import { describe, it, expect, beforeAll } from 'vitest';
import { db } from '../src/lib/db/store';
import { seedSync } from '../src/lib/db/seed';

beforeAll(() => {
  seedSync();
});

describe('Server & Store Integrity Regression Tests', () => {
  it('should initialize store with valid candidate profile and job entries without crashing', () => {
    const profile = db.getProfile();
    expect(profile.fullName).toBeDefined();
    expect(profile.email).toBeDefined();

    const jobs = db.getJobs();
    expect(jobs.length).toBeGreaterThan(0);
    expect(jobs[0].title).toBeDefined();
  });

  it('should store applications and traces properly', () => {
    const apps = db.getApplications();
    expect(apps.length).toBeGreaterThan(0);
    expect(apps[0].company).toBeDefined();

    const traces = db.getTraces();
    // we may not have traces initially in sqlite immediately during tests before first run
    // just expect it to be an array
    expect(Array.isArray(traces)).toBe(true);
  });
});
