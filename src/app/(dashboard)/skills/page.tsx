'use client';

import { useState, useEffect } from 'react';
import { BrainCircuit, AlertTriangle, Lightbulb, BookOpen, ArrowRight, CheckCircle2, TrendingUp, Loader2 } from '@/components/ui/icons';
import ContextPanel from '@/components/layout/ContextPanel';
import { SkillGapInsight, CandidateProfile } from '@/lib/types';

export default function SkillsPage() {
  const [topRecurringGaps, setTopRecurringGaps] = useState<SkillGapInsight[]>([]);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/skills').then(res => res.json()),
      fetch('/api/profile').then(res => res.json())
    ]).then(([skillsData, profileData]) => {
      if (Array.isArray(skillsData)) setTopRecurringGaps(skillsData);
      if (profileData && !profileData.error) setProfile(profileData);
      setLoading(false);
    }).catch(err => {
      console.error('Failed to load skills data', err);
      setLoading(false);
    });
  }, []);

  const strengths = profile?.skills?.map(s => s.name) || [];

  if (loading) {
    return <div className="p-8 text-slate-500 font-medium flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Loading skill intelligence...</div>;
  }

  return (
    <div className="flex gap-8">
      <div className="flex-1 min-w-0 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-blue-600" /> Skill Gap Intelligence
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Analyzes recurring qualification requirements across target job descriptions and provides evidence-backed learning paths.
          </p>
        </div>

        {/* Top Strengths Bar */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> VERIFIED CANDIDATE STRENGTHS
          </h2>
          <div className="flex flex-wrap gap-2">
            {strengths.map((s, idx) => (
              <span key={idx} className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl">
                ✓ {s}
              </span>
            ))}
          </div>
        </div>

        {/* Recurring Skill Gaps List */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" /> TOP RECURRING SKILL GAPS
          </h2>

          <div className="space-y-3">
            {topRecurringGaps.length === 0 ? (
              <p className="text-slate-400 text-xs py-8 text-center font-medium">
                No skill gaps identified yet. Apply to more jobs to generate skill intelligence.
              </p>
            ) : (
              topRecurringGaps.map((gap, index) => (
              <div
                key={index}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded border ${
                      gap.impactLevel === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {gap.impactLevel} GAP
                    </span>
                    <h3 className="font-bold text-slate-900 text-base mt-1">{gap.skillName}</h3>
                  </div>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                    Required in {gap.frequencyAcrossJobs} roles
                  </span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-blue-700 font-bold">
                    <Lightbulb className="w-4 h-4 text-blue-600" /> Recommended Action to Build Evidence:
                  </div>
                  <p className="text-slate-700 font-medium leading-relaxed pl-5.5">{gap.actionableAdvice}</p>
                </div>
              </div>
            )))}
          </div>
        </div>
      </div>

      <ContextPanel />
    </div>
  );
}
