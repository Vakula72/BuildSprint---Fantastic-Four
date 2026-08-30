'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CandidateProfile } from '@/lib/types';
import {
  Briefcase,
  Search,
  FileCheck,
  BrainCircuit,
  Activity,
  User,
  Sparkles,
  MapPin,
  CheckCircle2,
  TrendingUp
} from '@/components/ui/icons';

export default function Sidebar() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);

  useEffect(() => {
    fetch('/api/profile')
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (data) setProfile(data);
      })
      .catch(() => {});
  }, []);

  const fullName = profile?.fullName || 'Candidate';
  const initials = fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'CA';
  const headline = profile?.targetTitles?.[0] || profile?.headline || 'Software Engineer';
  const location = profile?.targetLocations?.[0] || 'Remote';

  const links = [
    { name: 'Dashboard', href: '/', icon: Briefcase },
    { name: 'Discover Jobs', href: '/jobs', icon: Search },
    { name: 'Applications & Outreach', href: '/applications', icon: FileCheck },
    { name: 'Skill Intelligence', href: '/skills', icon: BrainCircuit },
    { name: 'Agent Activity', href: '/activity', icon: Activity },
    { name: 'Candidate Profile', href: '/profile', icon: User },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)] sticky top-16 select-none overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* Candidate Profile Widget */}
        <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-slate-900 text-sm truncate">{fullName}</h2>
              <p className="text-xs text-slate-500 truncate">{headline}</p>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{location}</span>
          </div>

          {/* Profile Completeness Bar */}
          <div className="pt-1 border-t border-slate-200/60 space-y-1">
            <div className="flex justify-between text-[11px] font-semibold">
              <span className="text-slate-500">Profile Completeness</span>
              <span className="text-blue-600 font-bold">85%</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full w-[85%]"></div>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="space-y-1">
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Navigation
          </p>
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/60 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Agent Status Badge at Bottom */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50 space-y-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
          </span>
          <span className="text-xs font-bold text-slate-800">AGENT STATUS</span>
        </div>
        <p className="text-xs text-slate-600 font-medium leading-tight">
          Analyzing opportunities & matching evidence
        </p>
        <div className="p-2 bg-white rounded-lg border border-slate-200 text-[11px] text-slate-500 font-medium">
          <span className="font-bold text-slate-700 block text-[10px] uppercase tracking-wider">Current Goal</span>
          &quot;Find strong software engineering roles&quot;
        </div>
      </div>
    </aside>
  );
}
