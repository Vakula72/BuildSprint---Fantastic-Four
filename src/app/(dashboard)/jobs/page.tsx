'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Search,
  Plus,
  MapPin,
  DollarSign,
  Sparkles,
  Building2,
  CheckCircle2,
  Filter
} from '@/components/ui/icons';
import { Job } from '@/lib/types';
import ContextPanel from '@/components/layout/ContextPanel';
import toast from 'react-hot-toast';

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isScraping, setIsScraping] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    const res = await fetch('/api/jobs');
    const data = await res.json();
    setJobs(data);
  }

  async function handleAddJob(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle || !newCompany) return;

    await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newTitle,
        company: newCompany,
        location: 'Remote',
        workplaceType: 'REMOTE',
        salaryRange: '$100,000 - $130,000',
        description: newDesc || 'Target role description added manually by candidate.',
        requirements: [
          { id: 'custom_1', name: 'TypeScript', category: 'TECHNICAL', isMandatory: true },
          { id: 'custom_2', name: 'React', category: 'TECHNICAL', isMandatory: true }
        ]
      })
    });

    setNewTitle('');
    setNewCompany('');
    setNewDesc('');
    setShowAddModal(false);
    fetchJobs();
  }

  async function handleDiscoverJobs() {
    setIsScraping(true);
    try {
      const res = await fetch('/api/scraper/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'all' })
      });
      const data = await res.json();
      
      if (res.ok) {
        toast.success(`${data.newJobsAdded} new jobs discovered from RemoteOK, HN Hiring & Adzuna`);
        fetchJobs();
      } else {
        toast.error('Failed to discover jobs.');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while discovering jobs.');
    } finally {
      setIsScraping(false);
    }
  }

  const filteredJobs = jobs.filter(
    j =>
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase()) ||
      j.requirements.some(r => r.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex gap-8">
      <div className="flex-1 min-w-0 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-600" /> Discover Job Opportunities
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Explore discovered opportunities ready for agent evaluation, evidence-backed matching, and outreach.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDiscoverJobs}
              disabled={isScraping}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
            >
              {isScraping ? (
                <>
                  <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Agent scanning job boards...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" /> Discover New Jobs
                </>
              )}
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Opportunity
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by title, technology, or company name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Job Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors">
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>{job.company}</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-lg border border-blue-200">
                    {job.workplaceType}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location}
                  </span>
                  {job.salaryRange && (
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <DollarSign className="w-3.5 h-3.5 text-slate-400" /> {job.salaryRange}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {job.description.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")}
                </p>

                <div className="flex gap-1.5 flex-wrap pt-1">
                  {job.requirements.map((r) => (
                    <span
                      key={r.id}
                      className="px-2.5 py-1 bg-slate-100 text-slate-700 font-medium text-[11px] rounded-lg"
                    >
                      {r.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-[11px] text-slate-400 font-medium">Posted {job.postedDate}</span>
                <Link
                  href={`/jobs/${job.id}`}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Analyze Job →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Zone Context Panel */}
      <ContextPanel />

      {/* Add Job Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl w-full max-w-lg space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Add Target Opportunity</h2>
            <form onSubmit={handleAddJob} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Backend Engineer - AI Workflows"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stripe, Vercel, Supabase"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Job Description</label>
                <textarea
                  rows={4}
                  placeholder="Paste job description requirements..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  Save Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
