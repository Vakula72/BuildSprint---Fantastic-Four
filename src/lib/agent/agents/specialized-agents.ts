import {
  CandidateProfile,
  Job,
  JobMatchAnalysis,
  StrategyRecommendation,
  FullTailoredResume,
  ColdEmailContent,
  DEMO_CANDIDATE_EMAIL,
  DEMO_RECRUITER_EMAIL
} from '@/lib/types';

export class CareerProfileAgent {
  public run(profile: CandidateProfile) {
    return {
      agentName: 'Career Profile Agent',
      status: 'SUCCESS',
      summary: `Loaded candidate profile for ${profile.fullName} (${profile.email}). Resume source: ${profile.resumeFile?.fileName || 'Verified Profile Data'}.`
    };
  }
}

export class OpportunityDiscoveryAgent {
  public run(jobs: Job[], query?: string) {
    const filtered = query
      ? jobs.filter(j => j.title.toLowerCase().includes(query.toLowerCase()) || j.company.toLowerCase().includes(query.toLowerCase()))
      : jobs;

    return {
      agentName: 'Opportunity Discovery Agent',
      status: 'SUCCESS',
      totalDiscovered: jobs.length,
      filteredJobs: filtered,
      summary: `Discovered ${jobs.length} opportunities, filtered down to ${filtered.length} target matches.`
    };
  }
}

export class JobIntelligenceAgent {
  public run(job: Job) {
    return {
      agentName: 'Job Intelligence Agent',
      status: 'SUCCESS',
      extractedRequirements: job.requirements,
      recruiterContact: job.recruiterContact,
      companyContext: job.companyInfo,
      summary: `Extracted ${job.requirements.length} mandatory & preferred skills for ${job.title} at ${job.company}. Recruiter contact: ${job.recruiterContact.email}.`
    };
  }
}

export class SkillGapAgent {
  public run(analysis: JobMatchAnalysis) {
    const missing = analysis.evidenceMap.filter(m => m.matchStatus === 'MISSING');
    const partial = analysis.evidenceMap.filter(m => m.matchStatus === 'PARTIAL');

    return {
      agentName: 'Skill Gap Agent',
      status: 'SUCCESS',
      missingGaps: missing,
      partialGaps: partial,
      summary: `Identified ${missing.length} missing skill gaps and ${partial.length} partial skill gaps.`
    };
  }
}

export class ApplicationStrategistAgent {
  public run(analysis: JobMatchAnalysis, job: Job): StrategyRecommendation {
    const score = analysis.overallScore;
    const missingMandatoryCount = analysis.evidenceMap.filter(m => m.matchStatus === 'MISSING' && job.requirements.find(r => r.id === m.requirementId)?.isMandatory).length;

    let strategy: StrategyRecommendation['strategy'] = 'APPLY';
    let primaryReasoning = '';
    const pros: string[] = [];
    const cons: string[] = [];

    if (score >= 85 && missingMandatoryCount === 0) {
      strategy = 'APPLY_AND_OUTREACH';
      primaryReasoning = `Exceptional match score of ${score}%. Strong alignment across all core technical requirements. High conversion probability when combining formal application with targeted cold outreach.`;
      pros.push('Complete requirement coverage with direct verified evidence');
      pros.push('High candidate competitive advantage');
      pros.push('Proactive cold email significantly increases response rate');
    } else if (score >= 70 && score < 85) {
      strategy = 'APPLY';
      primaryReasoning = `Solid match score of ${score}%. Strong candidate foundation with manageable skill gaps that can be addressed in interview.`;
      pros.push('Meets key core qualifications');
      pros.push('Relevant project portfolio');
      cons.push(`Contains ${missingMandatoryCount} unverified skills`);
    } else if (score < 70) {
      strategy = 'OUTREACH';
      primaryReasoning = `Formal application might be filtered by automated screening due to missing requirements. Strategy is direct cold outreach to express enthusiasm and share relevant projects.`;
      pros.push('Bypasses resume ATS filters');
      cons.push('Requires compelling personal project narrative');
    } else {
      strategy = 'SKIP';
      primaryReasoning = `Low match score (${score}%). Candidate lacks multiple mandatory qualifications. Recommend prioritizing higher match opportunities.`;
      cons.push('High effort with low return expectancy');
    }

    return {
      jobId: job.id,
      strategy,
      primaryReasoning,
      pros,
      cons,
      confidence: score > 80 ? 'HIGH' : 'MEDIUM'
    };
  }
}

export class ApplicationGenerationAgent {
  public generateTailoredResume(candidate: CandidateProfile, job: Job, analysis: JobMatchAnalysis): FullTailoredResume {
    const matchedSkills = analysis.evidenceMap
      .filter(m => m.matchStatus === 'MATCHED')
      .map(m => m.requirementName);

    const isAiRole = job.title.toLowerCase().includes('ai') || job.description.toLowerCase().includes('agent');
    const isBackendRole = job.title.toLowerCase().includes('backend') || job.title.toLowerCase().includes('systems');

    // Intelligent Project Prioritization based on Job Requirements & User Projects
    const sortedProjects = [...candidate.projects].sort((a, b) => {
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      if (isAiRole) {
        if (aTitle.includes('ai') || aTitle.includes('agent') || aTitle.includes('copilot')) return -1;
        if (bTitle.includes('ai') || bTitle.includes('agent') || bTitle.includes('copilot')) return 1;
      } else if (isBackendRole) {
        if (aTitle.includes('backend') || aTitle.includes('log') || aTitle.includes('service') || aTitle.includes('engine')) return -1;
        if (bTitle.includes('backend') || bTitle.includes('log') || bTitle.includes('service') || bTitle.includes('engine')) return 1;
      }
      return 0;
    });

    const featuredProjects = sortedProjects.map((p, index) => {
      const isTopPriority = index === 0;
      return {
        title: p.title,
        technologies: p.technologies,
        relevanceReason: isTopPriority
          ? `Top Priority Alignment: Directly matches primary technical requirements for ${job.title} at ${job.company}.`
          : `Supporting Evidence: Demonstrates verified software development and database execution.`,
        bulletPoints: p.keyAchievements && p.keyAchievements.length > 0
          ? p.keyAchievements
          : [
              `Engineered ${p.title} using ${p.technologies.slice(0, 3).join(', ')}.`,
              p.metrics || p.description || `Delivered high quality modular codebase.`
            ]
      };
    });

    const relevantExperience = candidate.experience.map(e => ({
      roleTitle: e.roleTitle,
      company: e.company,
      dates: `${e.startDate} - ${e.endDate || 'Present'}`,
      relevanceNote: matchedSkills.length > 0 ? `Direct evidence matching ${matchedSkills.slice(0, 3).join(', ')}.` : `Relevant role at ${e.company}`,
      bulletPoints: e.highlights && e.highlights.length > 0 ? e.highlights : [e.description]
    }));

    const topSkillsList = matchedSkills.length > 0
      ? matchedSkills.slice(0, 4).join(', ')
      : candidate.skills.map(s => s.name).slice(0, 4).join(', ');

    const topExp = candidate.experience[0];
    const expText = topExp
      ? `Proven experience as ${topExp.roleTitle} at ${topExp.company}.`
      : candidate.summary || candidate.headline || 'Experienced software developer.';

    const linksList = [candidate.portfolioUrl, candidate.githubUrl, candidate.linkedinUrl].filter(Boolean) as string[];

    return {
      candidateHeader: {
        fullName: candidate.fullName || 'Candidate',
        email: candidate.email || DEMO_CANDIDATE_EMAIL,
        phone: candidate.phone,
        location: candidate.targetLocations[0] || 'Remote',
        links: linksList.length > 0 ? linksList : ['https://github.com']
      },
      targetJobTitle: job.title,
      customHeadline: `${job.title} | ${topSkillsList} Specialist`,
      tailoredSummary: `Targeted ${job.title} candidate with expertise in ${topSkillsList}. ${expText}`,
      categorizedSkills: [
        { categoryName: 'Matched Target Skills', skills: matchedSkills.length > 0 ? matchedSkills : candidate.skills.slice(0, 5).map(s => s.name) },
        { categoryName: 'Languages & Core Systems', skills: candidate.skills.filter(s => s.category === 'Language' || s.category === 'Systems').map(s => s.name) },
        { categoryName: 'Frameworks & Databases', skills: candidate.skills.filter(s => s.category === 'Frontend' || s.category === 'Backend' || s.category === 'Database').map(s => s.name) }
      ],
      workExperience: relevantExperience,
      featuredProjects,
      education: candidate.education.map(e => ({
        degree: e.degree,
        fieldOfStudy: e.fieldOfStudy,
        institution: e.institution,
        year: e.graduationYear
      })),
      tailoringChangesNote: {
        skillsEmphasized: matchedSkills,
        projectsPrioritized: sortedProjects.map(p => p.title)
      }
    };
  }

  public generateColdEmail(candidate: CandidateProfile, job: Job, analysis: JobMatchAnalysis): ColdEmailContent {
    const keyProject = candidate.projects[0];
    const topExp = candidate.experience[0];
    const topMatch = analysis.evidenceMap.find(e => e.matchStatus === 'MATCHED')?.requirementName || candidate.skills[0]?.name || 'software engineering';
    const recipientEmail = job.recruiterContact?.email || DEMO_RECRUITER_EMAIL;
    const recipientTitle = job.recruiterContact?.title || 'Lead Technical Recruiter';
    const candidateEmail = candidate.email || DEMO_CANDIDATE_EMAIL;

    let proofSentence = '';
    if (topExp) {
      proofSentence = `During my role as ${topExp.roleTitle} at ${topExp.company}, I ${topExp.highlights[0] || topExp.description}.`;
    } else if (keyProject) {
      proofSentence = `I recently built '${keyProject.title}' using ${keyProject.technologies.slice(0, 3).join(', ')}, achieving: ${keyProject.metrics || keyProject.description}.`;
    } else if (candidate.summary) {
      proofSentence = candidate.summary;
    }

    const linksList = [candidate.portfolioUrl, candidate.githubUrl, candidate.linkedinUrl].filter(Boolean).join(' | ');

    const subject = `${candidate.fullName || 'Candidate'} — ${job.title} Outreach (${job.company})`;
    const body = `Hi ${job.recruiterContact?.name || job.company + ' Hiring Team'},

I recently came across the ${job.title} position at ${job.company} and wanted to reach out directly. ${job.companyInfo?.overview || 'I am deeply impressed by your engineering execution.'}

With hands-on experience in ${topMatch}${keyProject ? ` and building project work like '${keyProject.title}'` : ''}, I have developed a strong alignment for this role. ${proofSentence}

I would welcome the opportunity to connect and discuss how my background can add immediate value to ${job.company}.

Best regards,
${candidate.fullName || 'Candidate'}
${candidateEmail}
${linksList}`;

    return {
      senderEmail: candidateEmail,
      recipientEmail,
      recipientTitle,
      subject,
      body,
      status: 'PENDING_APPROVAL',
      whyGenerated: {
        candidateEvidence: topExp ? `${topExp.company} (${topExp.roleTitle}) + Profile evidence.` : keyProject ? `'${keyProject.title}' project + Profile evidence.` : 'Candidate profile skills.',
        companyContext: `${job.company} - ${job.companyInfo?.industry || 'Tech Industry'} focus.`,
        reasonForOutreach: `High overall match score (${analysis.overallScore}%). Outreach boosts visibility.`,
        personalizationPoints: [keyProject?.title || 'Project Experience', topMatch, job.company].filter(Boolean) as string[]
      }
    };
  }
}

export class MemoryFeedbackAgent {
  public logOutcome(jobId: string, outcome: string) {
    return {
      agentName: 'Memory / Feedback Agent',
      status: 'SUCCESS',
      summary: `Logged application outcome '${outcome}' for job ${jobId}. Updated skill gap frequency memory.`
    };
  }
}
