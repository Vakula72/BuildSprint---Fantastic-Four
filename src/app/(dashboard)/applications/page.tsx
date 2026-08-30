'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { FileCheck, CheckCircle2, Clock, Building2, Eye, Mail, Send } from '@/components/ui/icons';
import Link from 'next/link';
import { JobApplicationRecord } from '@/lib/types';
import ContextPanel from '@/components/layout/ContextPanel';

function ApplicationsTrackerContent() {
  const searchParams = useSearchParams();
  const filterParam = searchParams.get('filter');

  const [applications, setApplications] = useState<JobApplicationRecord[]>([]);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PENDING_APPROVAL' | 'APPROVED' | 'SENT'>(
    filterParam === 'PENDING_APPROVAL' ? 'PENDING_APPROVAL' : filterParam === 'APPROVED' ? 'APPROVED' : 'ALL'
  );
  const [selectedAppModal, setSelectedAppModal] = useState<JobApplicationRecord | null>(null);

  useEffect(() => {
    fetch('/api/applications')
      .then((res) => res.json())
      .then((data) => setApplications(data));
  }, []);

  const filteredApps = applications.filter((app) => {
    if (activeFilter === 'PENDING_APPROVAL') return app.status === 'PENDING_APPROVAL';
    if (activeFilter === 'APPROVED') return app.status === 'APPROVED' || app.status === 'QUEUED';
    if (activeFilter === 'SENT') return app.status === 'SENT' || app.status === 'SENT_DEMO';
    return true;
  });

  return (
    <div className="flex gap-8">
      <div className="flex-1 min-w-0 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-blue-600" /> Applications & Outreach Tracker
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Monitor formal job applications, personalized cold outreach, and human-in-the-loop approval statuses.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({applications.length})
            </button>
            <button
              onClick={() => setActiveFilter('PENDING_APPROVAL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'PENDING_APPROVAL'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending ({applications.filter(a => a.status === 'PENDING_APPROVAL').length})
            </button>
            <button
              onClick={() => setActiveFilter('APPROVED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'APPROVED'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Approved ({applications.filter(a => a.status === 'APPROVED' || a.status === 'QUEUED').length})
            </button>
            <button
              onClick={() => setActiveFilter('SENT')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'SENT'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sent ({applications.filter(a => a.status === 'SENT' || a.status === 'SENT_DEMO').length})
            </button>
          </div>
        </div>

        {/* Applications Table Card */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-4">Company</th>
                <th className="p-4">Role</th>
                <th className="p-4">Match Score</th>
                <th className="p-4">Application Strategy</th>
                <th className="p-4">Outreach Status</th>
                <th className="p-4">Last Activity</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                    No application records match this filter. Run an Agent Pipeline from the Jobs tab.
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-bold text-slate-900 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-blue-600" /> {app.company}
                    </td>
                    <td className="p-4 font-bold text-slate-900">{app.jobTitle}</td>
                    <td className="p-4 font-black text-emerald-600 text-sm">{app.matchScore}% Match</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-bold border border-blue-200 rounded-lg text-[11px]">
                        {app.strategy}
                      </span>
                    </td>
                    <td className="p-4">
                      {app.status === 'SENT' || app.status === 'SENT_DEMO' ? (
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-full text-[11px] font-bold inline-flex items-center gap-1">
                          <Send className="w-3.5 h-3.5 text-blue-600" /> SENT
                        </span>
                      ) : app.status === 'APPROVED' ? (
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-bold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> APPROVED
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[11px] font-bold inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-500" /> PENDING HUMAN APPROVAL
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-medium text-slate-600 text-[11px]">
                      {app.demoSentAt || app.userApprovedAt || 'Recently'}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedAppModal(app)}
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold inline-flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> Details
                      </button>
                      <Link
                        href={`/jobs/${app.jobId}`}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1 transition-all"
                      >
                        Workspace →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ContextPanel />

      {/* OUTREACH DETAILS MODAL (High-level status details without raw email content) */}
      {selectedAppModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl w-full max-w-lg space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-blue-100 text-blue-800 rounded border border-blue-200">
                  OUTREACH RECORD
                </span>
                <h3 className="font-bold text-slate-900 text-base mt-1">{selectedAppModal.company}</h3>
              </div>
              <button
                onClick={() => setSelectedAppModal(null)}
                className="text-xs font-bold text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <div className="space-y-2">
                <p><strong>Role:</strong> {selectedAppModal.jobTitle}</p>
                <p><strong>Strategy:</strong> {selectedAppModal.strategy}</p>
                <p><strong>Match Score:</strong> <span className="font-bold text-emerald-600">{selectedAppModal.matchScore}%</span></p>
                <p><strong>Outreach Status:</strong> <span className="font-bold text-blue-700">{selectedAppModal.status === 'SENT_DEMO' || selectedAppModal.status === 'SENT' ? 'SENT' : selectedAppModal.status}</span></p>
                <p><strong>Last Activity:</strong> {selectedAppModal.demoSentAt || selectedAppModal.userApprovedAt || 'Recently'}</p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-600 font-medium">
                ✓ Personalized using verified candidate evidence & matched to selected job opportunity.
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedAppModal(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ApplicationsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-500 font-medium">Loading tracker...</div>}>
      <ApplicationsTrackerContent />
    </Suspense>
  );
}
