'use client';

import { BrainCircuit, AlertTriangle, Lightbulb, BookOpen, ArrowRight, CheckCircle2, TrendingUp } from '@/components/ui/icons';
import ContextPanel from '@/components/layout/ContextPanel';

export default function SkillsPage() {
  const topRecurringGaps = [
    { skill: 'AWS Infrastructure (EC2, S3, CDK)', frequency: '67%', impact: 'CRITICAL', recommendation: 'Deploy Agentic Copilot project to AWS EC2 using AWS CDK.' },
    { skill: 'Kubernetes', frequency: '42%', impact: 'HIGH', recommendation: 'Containerize backend microservices with Kubernetes manifests.' },
    { skill: 'GCP / Cloud Logging', frequency: '31%', impact: 'MEDIUM', recommendation: 'Configure Google Cloud telemetry logging drivers.' }
  ];

  const strengths = ['TypeScript', 'Python', 'React', 'Next.js', 'Node.js', 'PostgreSQL', 'AI Workflows'];

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
            {topRecurringGaps.map((gap, index) => (
              <div
                key={index}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded border ${
                      gap.impact === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {gap.impact} GAP
                    </span>
                    <h3 className="font-bold text-slate-900 text-base mt-1">{gap.skill}</h3>
                  </div>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                    Required in {gap.frequency} of backend roles
                  </span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-blue-700 font-bold">
                    <Lightbulb className="w-4 h-4 text-blue-600" /> Recommended Action to Build Evidence:
                  </div>
                  <p className="text-slate-700 font-medium leading-relaxed pl-5.5">{gap.recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ContextPanel />
    </div>
  );
}
