'use client';

import {
  Brain,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Sparkles
} from '@/components/ui/icons';
import Link from 'next/link';

interface ContextPanelProps {
  insights?: {
    text: string;
    actionAdvice: string;
  };
}

export default function ContextPanel({ insights }: ContextPanelProps) {
  return (
    <div className="w-72 space-y-5 shrink-0 hidden lg:block">
      {/* Agent Intelligence Insight */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50/60 p-4 rounded-2xl border border-blue-200/80 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-blue-800 text-xs font-bold uppercase tracking-wider">
          <Brain className="w-4 h-4 text-blue-600" />
          <span>Agent Insight</span>
        </div>
        
        <p className="text-xs text-slate-700 font-medium leading-relaxed">
          {insights?.text || "The AI is actively analyzing your saved opportunities to discover market trends and match them against your skillset."}
        </p>

        <div className="p-3 bg-white/90 backdrop-blur-xs rounded-xl border border-blue-200/60 text-xs text-slate-600 space-y-1">
          <span className="font-bold text-slate-800 block text-[11px]">Recommendation</span>
          <p className="text-[11px]">
            {insights?.actionAdvice || "Continue uploading your resume and discovering jobs to receive highly tailored career insights."}
          </p>
        </div>

        <Link
          href="/skills"
          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 pt-1"
        >
          View Skill Intelligence <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Quick Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Filter Opportunities</h3>
        
        <div className="space-y-2 text-xs">
          <div>
            <label className="block text-slate-500 font-semibold mb-1">Workplace</label>
            <div className="flex gap-1.5 flex-wrap">
              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-semibold rounded-lg border border-blue-200 cursor-pointer text-[11px]">
                Remote
              </span>
              <span className="px-2.5 py-1 bg-slate-100 text-slate-600 font-medium rounded-lg hover:bg-slate-200 cursor-pointer text-[11px]">
                Hybrid
              </span>
            </div>
          </div>


        </div>
      </div>


    </div>
  );
}
