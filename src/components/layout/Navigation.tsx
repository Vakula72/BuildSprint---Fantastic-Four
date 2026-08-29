'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  FileCheck,
  BrainCircuit,
  Activity,
  User,
  Sparkles
} from '@/components/ui/icons';

export default function Navigation() {
  const pathname = usePathname();

  const links = [
    { name: 'Dashboard', href: '/', icon: Briefcase },
    { name: 'Jobs', href: '/jobs', icon: Briefcase },
    { name: 'Applications & Outreach', href: '/applications', icon: FileCheck },
    { name: 'Skill Gap Intelligence', href: '/skills', icon: BrainCircuit },
    { name: 'Agent Activity Trace', href: '/activity', icon: Activity },
    { name: 'Candidate Profile', href: '/profile', icon: User }
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div>
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg border border-indigo-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-white text-base leading-tight">Job Hunt Copilot</h1>
            <p className="text-xs text-indigo-400 font-medium">Agentic Career OS</p>
          </div>
        </div>

        <nav className="p-3 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
        <p className="font-semibold text-slate-400 mb-1">Human-in-the-Loop Safe</p>
        <p>Consequential outreach actions require user review and approval.</p>
      </div>
    </aside>
  );
}
