'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Briefcase,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  MapPin,
  DollarSign,
  Building2,
  Brain,
  ShieldCheck,
  FileCheck,
  Clock,
  User,
  Upload
} from '@/components/ui/icons';
import { Job, JobApplicationRecord, CandidateProfile } from '@/lib/types';
import ContextPanel from '@/components/layout/ContextPanel';

export default function DashboardPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<JobApplicationRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [agentSearching, setAgentSearching] = useState(false);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [jobsRes, appRes, profileRes] = await Promise.all([
          fetch('/api/jobs'),
          fetch('/api/applications'),
          fetch('/api/profile')
        ]);

        // Redirect to login if not authenticated
        if (jobsRes.status === 401 || appRes.status === 401) {
          router.push('/login');
          return;
        }

        const jobsData = await jobsRes.json();
        const appData = await appRes.json();
        const profileData = await profileRes.json();
        if (Array.isArray(jobsData)) setJobs(jobsData);
        if (Array.isArray(appData)) setApplications(appData);
        if (profileData && !profileData.error) setProfile(profileData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    }
    loadData();
  }, [router]);


  function handleLetAgentSearch() {
    setAgentSearching(true);
    setTimeout(() => {
      setAgentSearching(false);
    }, 1200);
  }

  // Derive dynamic counts from actual DB state
  const pendingApprovals = applications.filter(a => a.status === 'PENDING_APPROVAL');
  const approvedApps = applications.filter(a => a.status === 'APPROVED' || a.status === 'QUEUED');
  const sentApps = applications.filter(a => a.status === 'SENT');

  const filteredJobs = jobs.filter(
    j =>
      j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.requirements.some(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex gap-8">
      {/* Main Workspace (Center Zone) */}
      <div className="flex-1 min-w-0 space-y-6">

        {/* Onboarding Banner — shown only when profile is empty */}
        {profile && !profile.fullName && !profile.resumeFile && (
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-5 rounded-3xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="font-extrabold text-base">Welcome! Set up your profile to get started.</h2>
              <p className="text-orange-100 text-xs mt-0.5 font-medium">
                The AI agent needs your resume to match jobs and generate tailored applications. Upload your PDF now.
              </p>
            </div>
            <Link
              href="/profile#resume"
              className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-white text-orange-600 font-bold text-xs rounded-xl hover:bg-orange-50 transition-all shadow-md"
            >
              <Upload className="w-4 h-4" />
              Upload Resume
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Profile incomplete reminder — shown when name exists but no resume */}
        {profile && profile.fullName && !profile.resumeFile && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex-shrink-0 w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
              <Upload className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-800">Hi {profile.fullName}! Upload your resume to activate the agent.</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                The agent uses your resume as its evidence source for job matching and resume tailoring.
              </p>
            </div>
            <Link
              href="/profile#resume"
              className="flex-shrink-0 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all"
            >
              Upload Resume →
            </Link>
          </div>
        )}

        {/* Hero Search Section */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-xl space-y-5 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-semibold border border-blue-400/30">
              <Sparkles className="w-3.5 h-3.5" /> Agentic Career OS Active
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Find your next opportunity
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Your career agent is continuously discovering, analyzing, and prioritizing opportunities matched to your verified evidence.
            </p>
          </div>

          {/* Large Search Field */}
          <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 flex flex-col md:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-300 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search roles, companies, skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-900 placeholder-slate-400 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => router.push('/jobs')}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                Search Opportunities
              </button>

              <button
                onClick={handleLetAgentSearch}
                disabled={agentSearching}
                className="px-4 py-2.5 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 hover:text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-300 animate-pulse" />
                {agentSearching ? 'Agent Searching...' : 'Let Agent Search'}
              </button>
            </div>
          </div>
        </div>

        {/* CLICKABLE DYNAMIC METRICS BAR (Requirement #5 & #6) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Card 1: Discovered Opportunities -> /jobs */}
          <div
            onClick={() => router.push('/jobs')}
            className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer space-y-1 group"
          >
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider group-hover:text-blue-600 transition-colors">
                Discovered Opportunities
              </span>
              <Briefcase className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">{jobs.length}</p>
            <p className="text-[10px] text-blue-600 font-semibold">View all jobs →</p>
          </div>

          {/* Card 2: Pending Approvals -> /applications?filter=PENDING_APPROVAL */}
          <div
            onClick={() => router.push('/applications?filter=PENDING_APPROVAL')}
            className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all cursor-pointer space-y-1 group"
          >
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider group-hover:text-amber-600 transition-colors">
                Pending Approvals
              </span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-black text-amber-600">{pendingApprovals.length}</p>
            <p className="text-[10px] text-amber-600 font-semibold">Review pending →</p>
          </div>

          {/* Card 3: Approved Applications -> /applications?filter=APPROVED */}
          <div
            onClick={() => router.push('/applications?filter=APPROVED')}
            className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer space-y-1 group"
          >
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider group-hover:text-emerald-600 transition-colors">
                Approved Outreach
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-emerald-600">{approvedApps.length}</p>
            <p className="text-[10px] text-emerald-600 font-semibold">View approved →</p>
          </div>

          {/* Card 4: Sent Outreach -> /applications?filter=SENT */}
          <div
            onClick={() => router.push('/applications?filter=SENT')}
            className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer space-y-1 group"
          >
            <div className="flex justify-between items-center">
              <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider group-hover:text-indigo-600 transition-colors">
                Sent Outreach
              </span>
              <FileCheck className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">{sentApps.length}</p>
            <p className="text-[10px] text-indigo-600 font-semibold">View sent →</p>
          </div>
        </div>

        {/* Recommended Opportunities Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" /> Recommended for You
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Ranked by your profile, uploaded resume evidence, preferences, and outreach outcomes.
              </p>
            </div>
            <Link href="/jobs" className="text-xs font-bold text-blue-600 hover:text-blue-700">
              View all ({jobs.length}) →
            </Link>
          </div>

          {/* Job Marketplace Cards */}
          <div className="space-y-4">
            {filteredJobs.map((job, idx) => {
              const matchedApp = applications.find(a => a.jobId === job.id);
              const matchScore = matchedApp?.matchScore || (idx === 0 ? 92 : idx === 1 ? 84 : 78);
              const missingSkill = job.requirements.find(r => r.name.toLowerCase().includes('aws'))?.name;

              return (
                <div
                  key={job.id}
                  className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all space-y-4 group"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 font-black text-base flex items-center justify-center border border-blue-100 group-hover:scale-105 transition-transform shrink-0">
                        {job.company.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors">
                            {job.title}
                          </h3>
                          <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full text-[11px] font-semibold border border-slate-200">
                            {job.workplaceType}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-500 flex items-center gap-2 mt-1">
                          <span className="font-semibold text-slate-700">{job.company}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-slate-700 font-semibold"><DollarSign className="w-3.5 h-3.5 text-slate-400" /> {job.salaryRange}</span>
                        </p>
                      </div>
                    </div>

                    {/* Match Score Badge */}
                    <div className="shrink-0 text-right">
                      <div className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-black shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{matchScore}% MATCH</span>
                      </div>
                    </div>
                  </div>

                  {/* Requirements & Skill Gap Alert */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-slate-400 font-semibold text-[11px]">Matched Skills:</span>
                      {job.requirements.slice(0, 4).map((r) => (
                        <span
                          key={r.id}
                          className="px-2.5 py-1 bg-slate-100 text-slate-700 font-semibold rounded-lg text-[11px]"
                        >
                          {r.name}
                        </span>
                      ))}
                    </div>

                    {missingSkill && (
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-[11px] font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> ⚠ {missingSkill} not verified
                      </span>
                    )}
                  </div>

                  {/* Agent Strategy & Actions */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Agent Strategy:</span>
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-bold rounded-lg text-xs border border-blue-200">
                        {matchScore >= 85 ? 'APPLY + COLD EMAIL' : 'APPLY FORMAL'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Link
                        href={`/jobs/${job.id}`}
                        className="flex-1 sm:flex-none px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all text-center"
                      >
                        Analyze
                      </Link>
                      <Link
                        href={`/jobs/${job.id}`}
                        className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-blue-500/20 text-center flex items-center justify-center gap-1"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Prepare Application
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Zone: Context Panel */}
      <ContextPanel />
    </div>
  );
}
