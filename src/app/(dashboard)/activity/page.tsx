'use client';

import { useState, useEffect } from 'react';
import { Activity, CheckCircle2, AlertCircle, Clock, ShieldCheck, Sparkles } from '@/components/ui/icons';
import { AgentActivityTrace } from '@/lib/types';
import ContextPanel from '@/components/layout/ContextPanel';

export default function ActivityPage() {
  const [traces, setTraces] = useState<AgentActivityTrace[]>([]);

  useEffect(() => {
    fetch('/api/activity')
      .then((res) => res.json())
      .then((data) => setTraces(data));
  }, []);

  return (
    <div className="flex gap-8">
      <div className="flex-1 min-w-0 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" /> Agent Activity Trace
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time execution log reporting agent reasoning, tool calls, and human-in-the-loop pauses.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Human-Safe Execution Timeline
            </div>
            <span className="text-xs text-slate-400 font-medium">{traces.length} trace entries recorded</span>
          </div>

          <div className="space-y-3">
            {traces.length === 0 ? (
              <p className="text-slate-400 text-xs py-8 text-center font-medium">
                No activity traces recorded yet. Run a job pipeline to view real-time traces.
              </p>
            ) : (
              traces.map((trace) => (
                <div
                  key={trace.id}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1 text-xs"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-blue-700">{trace.agentName}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-900 font-bold">{trace.task}</span>
                    </div>
                    <span className="text-slate-400 text-[11px] font-mono">{trace.timestamp}</span>
                  </div>

                  <p className="text-slate-700 leading-relaxed font-medium pt-0.5">{trace.details}</p>

                  <div className="flex justify-between items-center pt-2">
                    {trace.toolUsed ? (
                      <span className="px-2.5 py-0.5 bg-white text-slate-600 rounded-lg text-[10px] font-mono border border-slate-200">
                        tool: {trace.toolUsed}
                      </span>
                    ) : <span />}

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      trace.status === 'SUCCESS'
                        ? 'text-emerald-700 bg-emerald-100 border border-emerald-200'
                        : trace.status === 'PAUSED'
                        ? 'text-amber-800 bg-amber-100 border border-amber-200'
                        : 'text-slate-600 bg-slate-200'
                    }`}>
                      {trace.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <ContextPanel />
    </div>
  );
}
