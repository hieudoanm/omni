import { PERIODS } from './periods';

export { RESUME_PROJECTS } from './projects';

export interface ResumeProfile {
  name: string;
  title: string;
  tagline: string;
  email: string;
  location: string;
  website: string;
  summary: string;
}

export interface ResumeExperience {
  role: string;
  company: string;
  period: string;
  location: string;
  summary: string;
  highlights: string[];
}

export interface ResumeEducation {
  degree: string;
  school: string;
  period: string;
  location: string;
  details: string;
}

export interface ResumeProject {
  name: string;
  description: string;
  tech: string[];
  url?: string;
}

export interface ResumeSkillGroup {
  label: string;
  skills: string[];
}

export const RESUME_PROFILE: ResumeProfile = {
  name: 'Hieu Doan',
  title: 'Software Engineer',
  tagline: 'Engineer with 10+ years of experience building web, mobile, and desktop products.',
  email: 'hieudoanm@users.noreply.github.com',
  location: 'Ho Chi Minh City, Vietnam',
  website: 'https://hieudoanm.github.io',
  summary:
    'I build tools that make complex things simple. From full-stack web applications to native desktop apps, I care about clean architecture, developer experience, and shipping reliable software with measurable outcomes.',
};

type TimelineEntry = NonNullable<(typeof PERIODS)[number]['experience']>;

const EXPERIENCE_DETAILS: Record<string, { summary: string; highlights: string[] }> = {
  'NAB|Engineer, Lead': {
    summary:
      'Leading a cross-functional engineering team building banking products that serve millions of customers.',
    highlights: [
      'Set the technical direction and shape the platform roadmap',
      'Mentor engineers through design reviews, pairing, and code reviews',
      'Partner with product and design to deliver value in small, safe increments',
    ],
  },
  'NAB|Engineer, Senior Analyst': {
    summary: 'Senior engineer on the banking platform, owning delivery across the full stack.',
    highlights: [
      'Designed and shipped scalable services with clear ownership boundaries',
      'Drove incident reduction through better observability and testing',
      'Led the adoption of modern frontend tooling across the team',
    ],
  },
  'NAB|Engineer, Analyst': {
    summary: 'Full-stack engineer building and maintaining banking applications end to end.',
    highlights: [
      'Delivered customer-facing features across web and mobile surfaces',
      'Improved build and deployment pipelines for faster releases',
      'Wrote automated tests that caught regressions early in development',
    ],
  },
  'BoostCommerce|Back-end Engineer': {
    summary: 'Back-end engineer for a growing e-commerce platform processing high-volume orders.',
    highlights: [
      'Built reliable order and payment services on the platform',
      'Optimised database queries and caching to cut response times',
      'Collaborated with front-end engineers to ship integrated features',
    ],
  },
  'admetrics|Front-end Engineer': {
    summary: 'Front-end engineer building interactive analytics dashboards for advertisers.',
    highlights: [
      'Developed data visualisations and real-time reporting UIs',
      'Introduced reusable component patterns across the product',
      'Worked closely with designers to turn wireframes into polished UIs',
    ],
  },
  'Witrafi|Front-end Engineer': {
    summary: 'Front-end engineer on an online design and collaboration tool.',
    highlights: [
      'Built canvas-based editing features and UI components',
      'Improved performance and responsiveness of complex screens',
      'Contributed to shared tooling and front-end standards',
    ],
  },
};

const DEFAULT_DETAILS: { summary: string; highlights: string[] } = {
  summary: '',
  highlights: [],
};

export const RESUME_EXPERIENCE: ResumeExperience[] = PERIODS.map((period) => period.experience)
  .filter((entry): entry is TimelineEntry => entry !== null)
  .sort((a, b) => b.startYear - a.startYear)
  .map((entry) => {
    const details = EXPERIENCE_DETAILS[`${entry.subtitle}|${entry.title}`] ?? DEFAULT_DETAILS;
    return {
      role: entry.title,
      company: entry.subtitle,
      period: entry.date,
      location: entry.location,
      summary: details.summary,
      highlights: details.highlights,
    };
  });

const EDUCATION_DETAILS: Record<string, string> = {
  'RMIT University': 'Focused on cognitive psychology, statistics, and research methods.',
  'LAB University of Applied Sciences':
    'Software engineering track covering programming, databases, and software design.',
};

export const RESUME_EDUCATION: ResumeEducation[] = PERIODS.map((period) => period.education)
  .filter((entry): entry is TimelineEntry => entry !== null)
  .sort((a, b) => b.startYear - a.startYear)
  .map((entry) => ({
    degree: entry.title,
    school: entry.subtitle,
    period: entry.date,
    location: entry.location,
    details: EDUCATION_DETAILS[entry.subtitle] ?? '',
  }));

export const RESUME_SKILLS: ResumeSkillGroup[] = [
  {
    label: 'Languages',
    skills: ['TypeScript', 'JavaScript', 'Go', 'Rust', 'Kotlin', 'Swift'],
  },
  {
    label: 'Frontend',
    skills: ['React', 'Next.js', 'React Native', 'Tailwind CSS', 'DaisyUI'],
  },
  {
    label: 'Backend',
    skills: ['Node.js', 'PostgreSQL', 'Redis', 'GraphQL', 'Ktor', 'Axum'],
  },
  {
    label: 'Tooling',
    skills: ['Docker', 'Turbopack', 'Playwright', 'GitHub Actions', 'Tauri'],
  },
];
