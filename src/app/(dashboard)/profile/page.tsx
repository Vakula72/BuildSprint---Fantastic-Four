'use client';

import { useState, useEffect } from 'react';
import {
  User,
  Code,
  GraduationCap,
  Briefcase,
  Save,
  Check,
  MapPin,
  CheckCircle2,
  FileText,
  Upload,
  Loader2,
  Eye,
  Mail,
  Phone
} from '@/components/ui/icons';
import { CandidateProfile } from '@/lib/types';
import ContextPanel from '@/components/layout/ContextPanel';

export default function ProfilePage() {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState<'IDLE' | 'UPLOADING' | 'PARSING' | 'EXTRACTING' | 'READY'>('IDLE');
  const [showResumeContent, setShowResumeContent] = useState(false);

  useEffect(() => {
    fetch('/api/profile')
      .then((res) => res.json())
      .then((data) => setProfile(data));
  }, []);

  async function handleSave() {
    if (!profile) return;
    await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadStep('UPLOADING');

    try {
      // Send file as binary FormData — the server will parse the PDF properly
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', file.name);

      setUploadStep('PARSING');

      const res = await fetch('/api/resume/upload', {
        method: 'POST',
        body: formData, // binary multipart — no Content-Type header needed
      });

      setUploadStep('EXTRACTING');
      const data = await res.json();

      if (data.profile) {
        // Auto-populate ALL profile fields extracted from the resume
        setProfile(prev => ({
          ...(prev ?? data.profile),
          ...data.profile,
        }));
      }

      setUploadStep('READY');
    } catch (err) {
      console.error('Failed to upload file:', err);
      setUploadStep('IDLE');
    } finally {
      setUploading(false);
    }
  }

  if (!profile) {
    return <div className="p-8 text-slate-500 font-medium">Loading candidate profile...</div>;
  }

  return (
    <div className="flex gap-8">
      <div className="flex-1 min-w-0 space-y-6">
        {/* Profile Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" /> Candidate Profile & Evidence Base
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Primary source of truth for candidate qualifications, uploaded resume, projects, and work experience.
            </p>
          </div>

          <button
            onClick={handleSave}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            {saved ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
            {saved ? 'Saved!' : 'Save Profile'}
          </button>
        </div>

        {/* RESUME UPLOAD SECTION (Section #1 & #2 Requirement) */}
        <div id="resume" className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" /> RESUME SOURCE DOCUMENT
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Upload your PDF/DOCX resume. The agent uses this as the primary candidate evidence source.
              </p>
            </div>

            <label className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>{profile.resumeFile ? 'Replace Resume' : 'Upload Resume'}</span>
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>

          {/* Upload Status Steps */}
          {uploading && (
            <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-200 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-blue-800 font-bold">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>
                  {uploadStep === 'UPLOADING' && 'Uploading Resume...'}
                  {uploadStep === 'PARSING' && 'Parsing Qualifications & Text...'}
                  {uploadStep === 'EXTRACTING' && 'Extracting Evidence Map & Projects...'}
                </span>
              </div>
              <p className="text-slate-600 text-[11px] pl-6">
                Analyzing candidate skills, experience dates, degree details, and GitHub project metrics. Zero unsupported claims.
              </p>
            </div>
          )}

          {/* Resume Uploaded Status Display */}
          {profile.resumeFile && !uploading && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center border border-emerald-200">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{profile.resumeFile.fileName}</h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Uploaded successfully • {profile.resumeFile.uploadedAt || 'Recently'} • {profile.resumeFile.fileSize}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowResumeContent(!showResumeContent)}
                  className="px-3.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                  <span>{showResumeContent ? 'Hide Extracted Text' : 'View Resume Content'}</span>
                </button>
              </div>

              {showResumeContent && profile.resumeFile.extractedText && (
                <div className="pt-3 border-t border-slate-200/80">
                  <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider mb-1">
                    Extracted Resume Text
                  </span>
                  <pre className="p-3 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-700 font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                    {profile.resumeFile.extractedText}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Basic Information */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Personal & Identity Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Full Name</label>
              <input
                type="text"
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Candidate Email <span className="text-blue-600 font-semibold">(Sender Identity)</span>
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-3 py-2 bg-blue-50/50 border border-blue-200 rounded-xl text-slate-900 font-bold focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Professional Headline</label>
            <input
              type="text"
              value={profile.headline}
              onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Summary</label>
            <textarea
              rows={3}
              value={profile.summary}
              onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Technical Skills */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Code className="w-4 h-4 text-blue-600" /> Extracted Technical Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <span
                key={skill.id}
                className="px-3 py-1 bg-slate-100 text-slate-800 text-xs font-medium rounded-xl flex items-center gap-1.5"
              >
                <strong className="text-blue-700 font-bold">{skill.name}</strong> ({skill.proficiency})
              </span>
            ))}
          </div>
        </div>

        {/* Verified Projects */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-blue-600" /> Projects & Evidence Sources
          </h2>
          <div className="space-y-3">
            {profile.projects.map((proj) => (
              <div key={proj.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-900 text-sm">{proj.title}</h3>
                  <span className="text-blue-600 font-mono text-[11px] font-bold">{proj.repoUrl}</span>
                </div>
                <p className="text-slate-600 font-medium leading-relaxed">{proj.description}</p>
                <div className="flex gap-1.5 flex-wrap pt-1">
                  {proj.technologies.map((tech, ti) => (
                    <span key={ti} className="px-2.5 py-0.5 bg-white text-slate-700 font-semibold rounded-md border border-slate-200 text-[10px]">
                      {tech}
                    </span>
                  ))}
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
