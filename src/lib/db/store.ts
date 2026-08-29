import {
  CandidateProfile,
  Job,
  JobApplicationRecord,
  AgentActivityTrace,
  AgentRunSession,
  SkillGapInsight,
  DEMO_CANDIDATE_EMAIL,
  DEMO_RECRUITER_EMAIL
} from '@/lib/types';

export const INITIAL_CANDIDATE_PROFILE: CandidateProfile = {
  id: 'cand_01',
  fullName: 'Alex Morgan',
  email: DEMO_CANDIDATE_EMAIL,
  phone: '+91 98765 43210',
  headline: 'Full-Stack & Systems Software Engineer | CS Senior @ SRM University AP',
  summary: 'Computer Science senior with strong expertise in TypeScript, React, Next.js, Node.js, Python, and C++. Built high-throughput microservices, real-time agentic tools, and distributed applications.',
  targetTitles: ['Software Engineer', 'Full Stack Software Engineer', 'Backend Engineer', 'AI/ML Engineer'],
  targetLocations: ['India', 'Remote', 'Hybrid'],
  githubUrl: 'https://github.com/alexmorgan-dev',
  linkedinUrl: 'https://linkedin.com/in/alexmorgan-dev',
  portfolioUrl: 'https://alexmorgan.dev',
  resumeFile: {
    fileName: 'Alex_Morgan_Software_Engineer_Resume.pdf',
    uploadedAt: '2026-08-28 14:30',
    fileSize: '185 KB',
    extractedText: `ALEX MORGAN
Email: ${DEMO_CANDIDATE_EMAIL} | Phone: +91 98765 43210 | Location: India | Portfolio: https://alexmorgan.dev | GitHub: https://github.com/alexmorgan-dev

PROFESSIONAL SUMMARY
Computer Science senior with strong expertise in TypeScript, React, Next.js, Node.js, Python, and C++. Proven internship track record optimizing PostgreSQL database query performance by 35% at ScaleData Systems and engineering multi-agent developer workflow platforms.

TECHNICAL SKILLS
Languages: TypeScript, JavaScript, Python, C++, HTML, CSS
Frontend & Fullstack: React, Next.js, Tailwind CSS
Backend & Databases: Node.js, PostgreSQL, REST APIs
Tools & Systems: Git, GitHub, Docker, Algorithms

EDUCATION
B.S. Computer Science | SRM University AP | Graduation: 2026 | GPA: 3.88/4.0

EXPERIENCE
Software Engineering Intern | ScaleData Systems | May 2025 - Aug 2025
• Developed scalable REST API microservices and monitoring dashboards for telemetry analytics using Node.js, Next.js, and PostgreSQL.
• Optimized PostgreSQL query response times by 35% using index tuning and query refactoring.
• Built 12+ reusable React UI components adopting internal design design-systems.

PROJECTS
1. Agentic Workflow Copilot
• Built an autonomous multi-agent task execution system with step planning, human-in-the-loop review, and evaluation traces.
• Decreased task automation setup time by 60%; handles 50+ tool calls per session safely.
• Technologies: TypeScript, Next.js, Node.js, Tailwind CSS, Google Gemini API

2. Distributed Log Streaming Engine
• High-performance real-time log ingester built with Node.js and C++ native bindings for processing structured JSON telemetry.
• Processed 10,000 logs/second with sub-15ms parsing latency.
• Technologies: Node.js, C++, TypeScript, PostgreSQL, Docker

3. E-Commerce Microservices Platform
• Full-stack online store with JWT authentication, cart state management, SQL database integration, and Stripe sandbox checkout.
• 100% test coverage on API payment pipelines with zero dropped orders.
• Technologies: React, Next.js, Node.js, PostgreSQL, Tailwind CSS`
  },
  education: [
    {
      degree: 'B.S. Computer Science',
      fieldOfStudy: 'Computer Science & Artificial Intelligence',
      institution: 'SRM University AP',
      graduationYear: 2026,
      gpa: '3.88/4.0'
    }
  ],
  skills: [
    { id: 's1', name: 'TypeScript', category: 'Language', proficiency: 'EXPERT', yearsExperience: 3 },
    { id: 's2', name: 'JavaScript', category: 'Language', proficiency: 'EXPERT', yearsExperience: 4 },
    { id: 's3', name: 'React', category: 'Frontend', proficiency: 'ADVANCED', yearsExperience: 3 },
    { id: 's4', name: 'Next.js', category: 'Fullstack', proficiency: 'ADVANCED', yearsExperience: 2 },
    { id: 's5', name: 'Node.js', category: 'Backend', proficiency: 'ADVANCED', yearsExperience: 3 },
    { id: 's6', name: 'Python', category: 'Language', proficiency: 'ADVANCED', yearsExperience: 3 },
    { id: 's7', name: 'PostgreSQL', category: 'Database', proficiency: 'INTERMEDIATE', yearsExperience: 2 },
    { id: 's8', name: 'C++', category: 'Systems', proficiency: 'INTERMEDIATE', yearsExperience: 2 },
    { id: 's9', name: 'REST APIs', category: 'Backend', proficiency: 'ADVANCED', yearsExperience: 3 },
    { id: 's10', name: 'Git & GitHub', category: 'Tools', proficiency: 'EXPERT', yearsExperience: 4 },
    { id: 's11', name: 'Tailwind CSS', category: 'Frontend', proficiency: 'ADVANCED', yearsExperience: 2 }
  ],
  projects: [
    {
      id: 'proj_01',
      title: 'Agentic Workflow Copilot',
      description: 'An autonomous multi-agent task execution system with step planning, human-in-the-loop review, and automated evaluation traces.',
      technologies: ['TypeScript', 'Next.js', 'Node.js', 'Tailwind CSS', 'Google Gemini API'],
      metrics: 'Decreased task automation setup time by 60%; handles 50+ tool calls per session safely.',
      repoUrl: 'https://github.com/alexmorgan-dev/agentic-copilot',
      keyAchievements: [
        'Built an autonomous multi-agent task execution system with step planning and human-in-the-loop review.',
        'Decreased task automation setup time by 60%; handles 50+ tool calls per session safely.'
      ]
    },
    {
      id: 'proj_02',
      title: 'Distributed Log Streaming Engine',
      description: 'High-performance real-time log ingester built with Node.js and C++ native bindings for processing structured JSON telemetry.',
      technologies: ['Node.js', 'C++', 'TypeScript', 'PostgreSQL', 'Docker'],
      metrics: 'Processed 10,000 logs/second with sub-15ms parsing latency.',
      repoUrl: 'https://github.com/alexmorgan-dev/log-streamer',
      keyAchievements: [
        'Engineered high-performance real-time log ingester built with Node.js and C++ native bindings.',
        'Processed 10,000 logs/second with sub-15ms parsing latency.'
      ]
    },
    {
      id: 'proj_03',
      title: 'E-Commerce Microservices Platform',
      description: 'Full-stack online store with JWT authentication, cart state management, SQL database integration, and Stripe sandbox checkout.',
      technologies: ['React', 'Next.js', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
      metrics: '100% test coverage on API payment pipelines with zero dropped orders.',
      repoUrl: 'https://github.com/alexmorgan-dev/shop-microservices',
      keyAchievements: [
        'Implemented full-stack online store with JWT authentication, cart state, and SQL integration.',
        'Achieved 100% test coverage on API payment pipelines with zero dropped orders.'
      ]
    }
  ],
  experience: [
    {
      id: 'exp_01',
      roleTitle: 'Software Engineering Intern',
      company: 'ScaleData Systems',
      location: 'San Francisco, CA (Remote)',
      startDate: '2025-05',
      endDate: '2025-08',
      isCurrent: false,
      description: 'Developed scalable API endpoints and frontend monitoring dashboards for telemetry data analytics.',
      skillsUsed: ['TypeScript', 'React', 'Next.js', 'Node.js', 'PostgreSQL', 'REST APIs'],
      highlights: [
        'Optimized PostgreSQL query response times by 35% using indexing and query refactoring.',
        'Built 12+ reusable React UI components adopting internal design design-systems.',
        'Collaborated with senior architects to implement OAuth2 authentication flows.'
      ]
    },
    {
      id: 'exp_02',
      roleTitle: 'Undergraduate Teaching Assistant - Data Structures',
      company: 'SRM University AP',
      location: 'Campus',
      startDate: '2024-09',
      endDate: '2025-05',
      isCurrent: false,
      description: 'Guided 120+ students in C++ memory management, graph algorithms, and algorithmic complexity analysis.',
      skillsUsed: ['C++', 'Python', 'Algorithms', 'Data Structures'],
      highlights: [
        'Held weekly lab hours assisting students with debugging C++ pointers and memory leaks.',
        'Created automated grading scripts in Python that reduced grading overhead by 50%.'
      ]
    }
  ]
};

export const INITIAL_JOBS: Job[] = [
  {
    id: 'job_01',
    title: 'Full Stack Software Engineer (Junior/New Grad)',
    company: 'Nexus Cloud Platforms',
    location: 'Remote (US)',
    workplaceType: 'REMOTE',
    salaryRange: '$110,000 - $135,000',
    postedDate: '2026-08-25',
    sourceUrl: 'https://careers.nexuscloud.io/jobs/fullstack-01',
    recruiterContact: {
      name: 'Sarah Jenkins',
      title: 'Lead Technical Recruiter',
      email: DEMO_RECRUITER_EMAIL
    },
    companyInfo: {
      overview: 'Nexus builds modern cloud orchestration and developer analytics software for fast-growing engineering teams.',
      industry: 'Developer Tools & Cloud Infrastructure',
      techStack: ['TypeScript', 'React', 'Next.js', 'Node.js', 'PostgreSQL', 'Docker', 'AWS'],
      recentNews: 'Nexus recently announced Series B funding to scale its automated developer workflow suite.'
    },
    description: `Nexus Cloud Platforms is looking for a proactive Full Stack Software Engineer to join our Core Product Team. 

Key Responsibilities:
- Design and build sleek, highly responsive web dashboards using TypeScript, React, and Next.js.
- Develop performant backend REST APIs and microservices in Node.js.
- Optimize database schemas and queries using PostgreSQL.
- Work closely with product managers and designers to launch new developer features.

Requirements:
- Strong proficiency in TypeScript, React, and Node.js.
- Hands-on experience building full-stack applications with Next.js and relational databases (PostgreSQL/MySQL).
- Understanding of web security, REST API standards, and state management.
- B.S. in Computer Science or equivalent hands-on project experience.

Nice to Have:
- Familiarity with AWS or cloud deployment pipelines.
- Experience with Docker or containerized development environments.`,
    requirements: [
      { id: 'r1', name: 'TypeScript', category: 'TECHNICAL', isMandatory: true },
      { id: 'r2', name: 'React', category: 'TECHNICAL', isMandatory: true },
      { id: 'r3', name: 'Next.js', category: 'TECHNICAL', isMandatory: true },
      { id: 'r4', name: 'Node.js', category: 'TECHNICAL', isMandatory: true },
      { id: 'r5', name: 'PostgreSQL', category: 'TECHNICAL', isMandatory: true },
      { id: 'r6', name: 'REST APIs', category: 'TECHNICAL', isMandatory: true },
      { id: 'r7', name: 'AWS', category: 'TECHNICAL', isMandatory: false },
      { id: 'r8', name: 'Docker', category: 'TECHNICAL', isMandatory: false },
      { id: 'r9', name: 'B.S. Computer Science', category: 'EDUCATION', isMandatory: true }
    ]
  },
  {
    id: 'job_02',
    title: 'Backend Systems Engineer - AI Workflows',
    company: 'Cortex Automation',
    location: 'San Francisco, CA',
    workplaceType: 'HYBRID',
    salaryRange: '$125,000 - $150,000',
    postedDate: '2026-08-27',
    sourceUrl: 'https://cortexai.com/careers/backend-ai',
    recruiterContact: {
      name: 'David Vance',
      title: 'Engineering Manager',
      email: DEMO_RECRUITER_EMAIL
    },
    companyInfo: {
      overview: 'Cortex Automation is building autonomous LLM agent frameworks for enterprise operations.',
      industry: 'Artificial Intelligence & Enterprise Software',
      techStack: ['Python', 'Node.js', 'TypeScript', 'Docker', 'AWS', 'Redis', 'PostgreSQL'],
      recentNews: 'Cortex expanded its AI agent workflow SDK to support multi-step tool execution.'
    },
    description: `Cortex Automation is hiring a Backend Systems Engineer to power our core AI orchestration engine.

Key Responsibilities:
- Implement scalable microservices and tool connectors for multi-agent execution workflows.
- Integrate LLM APIs (Gemini, OpenAI, Anthropic) with streaming output pipelines.
- Deploy robust microservices on AWS using Docker and Kubernetes.
- Collaborate with frontend engineers to build agent activity monitoring dashboards.

Requirements:
- Strong skills in Python or Node.js / TypeScript backend development.
- Demonstrated experience building multi-step agentic workflows or LLM tool-calling applications.
- Experience with Docker containerization and AWS infrastructure.
- Solid knowledge of asynchronous programming, queues, and REST APIs.

Nice to Have:
- Experience with C++ for high-throughput native modules.
- Knowledge of Kubernetes and CI/CD automation pipelines.`,
    requirements: [
      { id: 'c1', name: 'Python', category: 'TECHNICAL', isMandatory: true },
      { id: 'c2', name: 'Node.js / TypeScript', category: 'TECHNICAL', isMandatory: true },
      { id: 'c3', name: 'LLM APIs / Agent Workflows', category: 'TECHNICAL', isMandatory: true },
      { id: 'c4', name: 'Docker', category: 'TECHNICAL', isMandatory: true },
      { id: 'c5', name: 'AWS Infrastructure', category: 'TECHNICAL', isMandatory: true },
      { id: 'c6', name: 'Kubernetes', category: 'TECHNICAL', isMandatory: false },
      { id: 'c7', name: 'C++', category: 'TECHNICAL', isMandatory: false }
    ]
  },
  {
    id: 'job_03',
    title: 'Frontend React Developer',
    company: 'PixelCraft Studios',
    location: 'Remote',
    workplaceType: 'REMOTE',
    salaryRange: '$95,000 - $115,000',
    postedDate: '2026-08-20',
    sourceUrl: 'https://pixelcraft.design/jobs/frontend-react',
    recruiterContact: {
      name: 'PixelCraft Recruiting',
      title: 'Talent Acquisition Team',
      email: DEMO_RECRUITER_EMAIL
    },
    companyInfo: {
      overview: 'PixelCraft provides interactive web design toolkits for digital agencies.',
      industry: 'Design Software & Web Development',
      techStack: ['React', 'TypeScript', 'Tailwind CSS', 'GraphQL', 'Figma'],
      recentNews: 'PixelCraft launched new UI design system tools.'
    },
    description: `PixelCraft Studios seeks a frontend-focused engineer to craft fluid user interfaces using React, TypeScript, and Tailwind CSS.

Requirements:
- Expert-level HTML, CSS, JavaScript, and React skills.
- Proficiency in Tailwind CSS and modern component libraries.
- Strong attention to UI/UX detail and design system consistency.
- Experience with GraphQL or REST API consumption.`,
    requirements: [
      { id: 'p1', name: 'React', category: 'TECHNICAL', isMandatory: true },
      { id: 'p2', name: 'TypeScript', category: 'TECHNICAL', isMandatory: true },
      { id: 'p3', name: 'Tailwind CSS', category: 'TECHNICAL', isMandatory: true },
      { id: 'p4', name: 'GraphQL', category: 'TECHNICAL', isMandatory: false }
    ]
  }
];

export const INITIAL_APPLICATIONS: JobApplicationRecord[] = [
  {
    id: 'app_01',
    jobId: 'job_01',
    jobTitle: 'Full Stack Software Engineer (Junior/New Grad)',
    company: 'Nexus Cloud Platforms',
    status: 'PENDING_APPROVAL',
    strategy: 'APPLY_AND_OUTREACH',
    matchScore: 92,
    recipientEmail: DEMO_RECRUITER_EMAIL,
    tailoredResume: {
      candidateHeader: {
        fullName: INITIAL_CANDIDATE_PROFILE.fullName,
        email: INITIAL_CANDIDATE_PROFILE.email,
        phone: INITIAL_CANDIDATE_PROFILE.phone,
        location: INITIAL_CANDIDATE_PROFILE.targetLocations[0] || 'Remote',
        links: [INITIAL_CANDIDATE_PROFILE.portfolioUrl, INITIAL_CANDIDATE_PROFILE.githubUrl].filter(Boolean) as string[]
      },
      targetJobTitle: 'Full Stack Software Engineer',
      customHeadline: 'Full Stack Engineer | Next.js, Node.js & PostgreSQL Specialist',
      tailoredSummary: 'Computer Science senior with proven engineering experience building scalable Next.js microservices and REST APIs.',
      categorizedSkills: [
        { categoryName: 'Matched Target Skills', skills: ['TypeScript', 'React', 'Next.js', 'Node.js', 'PostgreSQL', 'REST APIs'] },
        { categoryName: 'Languages', skills: ['TypeScript', 'JavaScript', 'Python', 'C++'] },
        { categoryName: 'Frameworks & Databases', skills: ['React', 'Next.js', 'Tailwind CSS', 'Node.js', 'PostgreSQL'] }
      ],
      workExperience: [
        {
          roleTitle: INITIAL_CANDIDATE_PROFILE.experience[0]?.roleTitle || 'Software Engineering Intern',
          company: INITIAL_CANDIDATE_PROFILE.experience[0]?.company || 'Tech Company',
          dates: 'May 2025 - Aug 2025',
          relevanceNote: 'High relevance: Direct alignment with Nexus database and Node.js microservice architecture.',
          bulletPoints: INITIAL_CANDIDATE_PROFILE.experience[0]?.highlights || [
            'Architected full-stack Next.js monitoring dashboards and Node.js REST API endpoints.'
          ]
        }
      ],
      featuredProjects: [
        {
          title: 'Agentic Workflow Copilot',
          technologies: ['TypeScript', 'Next.js', 'Node.js', 'Tailwind CSS', 'Google Gemini API'],
          relevanceReason: 'Prioritized: Directly matches full-stack Next.js and agentic orchestration skills required by Nexus.',
          bulletPoints: [
            'Built an autonomous multi-agent task execution system with step planning, human-in-the-loop review, and evaluation traces.',
            'Decreased task automation setup time by 60%; handles 50+ tool calls per session safely.'
          ]
        },
        {
          title: 'E-Commerce Microservices Platform',
          technologies: ['React', 'Next.js', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
          relevanceReason: 'Matches full-stack relational database and Next.js microservice requirements.',
          bulletPoints: [
            'Implemented full-stack online store with JWT authentication, cart state, and SQL database integration.',
            'Achieved 100% test coverage on API payment pipelines with zero dropped orders.'
          ]
        },
        {
          title: 'Distributed Log Streaming Engine',
          technologies: ['Node.js', 'C++', 'TypeScript', 'PostgreSQL', 'Docker'],
          relevanceReason: 'Demonstrates backend data ingester and PostgreSQL performance tuning.',
          bulletPoints: [
            'Engineered high-performance real-time log ingester built with Node.js and C++ native bindings.',
            'Processed 10,000 logs/second with sub-15ms parsing latency.'
          ]
        }
      ],
      education: [
        {
          degree: 'B.S. Computer Science',
          fieldOfStudy: 'Computer Science & AI',
          institution: 'SRM University AP',
          year: 2026
        }
      ],
      tailoringChangesNote: {
        skillsEmphasized: ['TypeScript', 'Next.js', 'Node.js', 'PostgreSQL', 'REST APIs'],
        projectsPrioritized: ['Agentic Workflow Copilot', 'E-Commerce Microservices Platform', 'Distributed Log Streaming Engine']
      }
    },
    coldEmail: {
      senderEmail: INITIAL_CANDIDATE_PROFILE.email,
      recipientEmail: DEMO_RECRUITER_EMAIL,
      recipientTitle: 'Lead Technical Recruiter',
      subject: `${INITIAL_CANDIDATE_PROFILE.fullName} — Full Stack Software Engineer Outreach (Nexus Cloud Platforms)`,
      body: `Hi Sarah,

I recently came across the Full Stack Software Engineer role at Nexus Cloud Platforms and wanted to reach out directly. Given Nexus's recent expansion in developer orchestration software, I am very excited about your product engineering direction.

I have hands-on experience building full-stack applications with TypeScript, Next.js, Node.js, and PostgreSQL. Recently, I engineered an Agentic Workflow Copilot and microservices platforms matching your technical requirements.

I would love to learn more about how I can contribute to Nexus's core product team!

Best regards,
${INITIAL_CANDIDATE_PROFILE.fullName}
${INITIAL_CANDIDATE_PROFILE.email}`,
      status: 'PENDING_APPROVAL',
      whyGenerated: {
        candidateEvidence: 'Candidate profile projects + Full stack Next.js evidence.',
        companyContext: 'Nexus Cloud Platforms Series B expansion & developer workflow tools.',
        reasonForOutreach: 'Strong 92% match score with direct alignment in Next.js, Node.js, and PostgreSQL.',
        personalizationPoints: ['Full Stack Development', 'Agentic Workflow Copilot', 'Next.js & PostgreSQL']
      }
    }
  }
];

export const INITIAL_SKILL_GAPS: SkillGapInsight[] = [
  {
    skillName: 'AWS Infrastructure',
    category: 'TECHNICAL',
    frequencyAcrossJobs: 2,
    impactLevel: 'CRITICAL',
    recommendedLearningResource: 'AWS Certified Cloud Practitioner or AWS Hands-on CDK Guide',
    actionableAdvice: 'Deploy your Agentic Workflow Copilot or Log Streaming project to AWS EC2/S3 using Terraform or AWS CDK to gain verified cloud deployment evidence.'
  },
  {
    skillName: 'Docker',
    category: 'TECHNICAL',
    frequencyAcrossJobs: 2,
    impactLevel: 'MODERATE',
    recommendedLearningResource: 'Docker & Containerization Fundamentals',
    actionableAdvice: 'Add a `Dockerfile` and `docker-compose.yml` to your GitHub repositories to demonstrate containerized setup.'
  }
];

class DataStore {
  private profile: CandidateProfile = INITIAL_CANDIDATE_PROFILE;
  private jobs: Job[] = [...INITIAL_JOBS];
  private applications: JobApplicationRecord[] = [...INITIAL_APPLICATIONS];
  private traces: AgentActivityTrace[] = [];
  private runSessions: Map<string, AgentRunSession> = new Map();
  private skillGaps: SkillGapInsight[] = [...INITIAL_SKILL_GAPS];

  constructor() {
    this.addTrace({
      workflowId: 'init',
      agentName: 'Job Hunt Orchestrator',
      task: 'Candidate Profile Loaded',
      status: 'SUCCESS',
      details: `Loaded candidate profile for ${this.profile.fullName || 'User'} (${this.profile.email}) with candidate evidence metadata.`
    });
  }

  getProfile(): CandidateProfile {
    return this.profile;
  }

  updateProfile(profile: CandidateProfile): CandidateProfile {
    this.profile = profile;
    // Update candidate identity across any existing initial application record
    this.applications = this.applications.map(app => {
      if (app.tailoredResume) {
        app.tailoredResume.candidateHeader = {
          fullName: profile.fullName || 'Candidate',
          email: profile.email || DEMO_CANDIDATE_EMAIL,
          phone: profile.phone,
          location: profile.targetLocations[0] || 'Remote',
          links: [profile.portfolioUrl, profile.githubUrl, profile.linkedinUrl].filter(Boolean) as string[]
        };
      }
      if (app.coldEmail) {
        app.coldEmail.senderEmail = profile.email || DEMO_CANDIDATE_EMAIL;
        app.coldEmail.subject = `${profile.fullName || 'Candidate'} — ${app.jobTitle} Outreach (${app.company})`;
      }
      return app;
    });
    return this.profile;
  }

  getJobs(): Job[] {
    return this.jobs;
  }

  getJobById(id: string): Job | undefined {
    return this.jobs.find(j => j.id === id);
  }

  addJob(job: Job): Job {
    this.jobs.unshift(job);
    this.addTrace({
      workflowId: `job_${Date.now()}`,
      agentName: 'Opportunity Discovery Agent',
      task: 'Job Opportunity Discovered',
      status: 'SUCCESS',
      details: `Discovered and indexed target opportunity '${job.title}' at '${job.company}'.`
    });
    return job;
  }

  getApplications(): JobApplicationRecord[] {
    return this.applications;
  }

  getApplicationByJobId(jobId: string): JobApplicationRecord | undefined {
    return this.applications.find(a => a.jobId === jobId);
  }

  saveApplication(app: JobApplicationRecord): JobApplicationRecord {
    const idx = this.applications.findIndex(a => a.id === app.id || a.jobId === app.jobId);
    if (idx >= 0) {
      this.applications[idx] = app;
    } else {
      this.applications.unshift(app);
    }
    return app;
  }

  addTrace(trace: Omit<AgentActivityTrace, 'id' | 'timestamp'>): AgentActivityTrace {
    const newTrace: AgentActivityTrace = {
      ...trace,
      id: `tr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    this.traces.unshift(newTrace);
    return newTrace;
  }

  getTraces(): AgentActivityTrace[] {
    return this.traces;
  }

  setRunSession(session: AgentRunSession) {
    this.runSessions.set(session.workflowId, session);
  }

  getRunSession(workflowId: string): AgentRunSession | undefined {
    return this.runSessions.get(workflowId);
  }

  getSkillGaps(): SkillGapInsight[] {
    return this.skillGaps;
  }
}

export const db = new DataStore();
