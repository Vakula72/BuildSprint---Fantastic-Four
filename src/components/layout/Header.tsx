'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  User,
  FileText,
  MapPin,
  CheckCircle2,
  Mail,
  ChevronDown
} from '@/components/ui/icons';

import { CandidateProfile } from '@/lib/types';

export default function Header() {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/profile')
      .then((res) => res.json())
      .then((data) => setProfile(data))
      .catch(() => {});
  }, []);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setPopoverOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fullName = profile?.fullName || 'Candidate';
  const initials = fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'CA';
  const email = profile?.email || '';
  const headline = profile?.targetTitles[0] || profile?.headline || 'Software Engineer';
  const location = profile?.targetLocations[0] || 'Remote';
  const resumeName = profile?.resumeFile?.fileName || 'Resume uploaded';

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-xs sticky top-0 z-30">
      {/* Brand & Title */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-base leading-tight">Job Hunt Copilot</span>
              <span className="text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded">
                MVP
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Agentic Career OS</p>
          </div>
        </Link>
      </div>

      {/* Right Header Status Bar */}
      <div className="flex items-center gap-4">
        {/* Active System Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-700 font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Agent Active</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500 text-[11px] hidden sm:inline">Human Approval Gate On</span>
        </div>

        {/* Candidate Interactive Profile Popover */}
        <div className="relative" ref={popoverRef}>
          <button
            onClick={() => setPopoverOpen(!popoverOpen)}
            className="flex items-center gap-2.5 pl-2 border-l border-slate-200 hover:opacity-90 transition-opacity cursor-pointer text-left focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center border border-blue-200 shadow-2xs">
              {initials}
            </div>
            <div className="hidden md:block">
              <div className="flex items-center gap-1">
                <p className="font-bold text-slate-900 text-xs leading-tight">{fullName}</p>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
              <p className="text-slate-500 text-[10px] truncate max-w-[120px]">{headline}</p>
            </div>
          </button>

          {/* Dropdown Popover */}
          {popoverOpen && (
            <div className="absolute right-0 top-11 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl p-4 space-y-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 text-sm truncate">{fullName}</h3>
                  <p className="text-xs text-slate-500 truncate">{headline}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2 text-[11px]">
                  <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate font-semibold text-slate-800">{email}</span>
                </div>

                <div className="flex items-center gap-2 text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{location}</span>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-slate-500">Profile Completeness</span>
                    <span className="text-blue-600">85%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full w-[85%]"></div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Source Resume:</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {resumeName}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex gap-2">
                <button
                  onClick={() => {
                    setPopoverOpen(false);
                    router.push('/profile');
                  }}
                  className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs transition-colors"
                >
                  View Profile
                </button>
                <button
                  onClick={() => {
                    setPopoverOpen(false);
                    router.push('/profile#resume');
                  }}
                  className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs transition-colors shadow-2xs"
                >
                  Manage Resume
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
