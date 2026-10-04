export interface SocialLinks {
  github?: string;
  linkedin?: string;
  leetcode?: string;
  gfg?: string;
  medium?: string;
}

export interface Metric {
  value: string;
  label: string;
}

export interface Education {
  institute: string;
  degree: string;
  location: string;
  period: string;
  score: string;
}

export interface Profile {
  name: string;
  role: string;
  company: string;
  location: string;
  headline: string;
  summary: string;
  email: string;
  resumeUrl: string;
  avatarUrl: string;
  openToConnect: boolean;
  focus: string[];
  /** Grouped stack shown in the hero code card, e.g. { languages: [...], ai: [...] }. */
  stack: Record<string, string[]>;
  /** Headline numbers shown in the hero code card, e.g. { agentRunsPerDay: '60K+' }. */
  impact?: Record<string, string>;
  socials: SocialLinks;
  metrics: Metric[];
  education: Education[];
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  period: string;
  location: string;
  current: boolean;
  highlights: string[];
  tech: string[];
  order: number;
}

export interface Award {
  id: string;
  title: string;
  period: string;
  description: string;
  /** Link to the announcement (e.g. a LinkedIn post). */
  url?: string;
  order: number;
}

export interface SkillGroup {
  id: string;
  title: string;
  skills: string[];
  order: number;
}

export interface CaseStudy {
  role?: string;
  timeline?: string;
  overview: string[];
  architecture: { label: string; items: string[] }[];
  features: { title: string; body: string }[];
  learnings: string[];
}

export interface Project {
  id: string;
  slug: string;
  name: string;
  summary: string;
  tags: string[];
  github?: string;
  demo?: string;
  image?: string;
  featured: boolean;
  order: number;
  caseStudy?: CaseStudy;
}

export interface PortfolioData {
  profile: Profile;
  experience: Experience[];
  awards: Award[];
  skills: SkillGroup[];
  projects: Project[];
}

export type PostType = 'article' | 'note' | 'medium';
export type PostStatus = 'draft' | 'published' | 'unlisted';

export interface Post {
  /** The slug doubles as the Firestore document id. */
  slug: string;
  type: PostType;
  status: PostStatus;
  title: string;
  subtitle: string;
  coverUrl: string;
  contentHtml: string;
  tags: string[];
  /** For type "medium": the original article URL. */
  externalUrl: string;
  readMinutes: number;
  createdAt: number;
  updatedAt: number;
  publishedAt: number | null;
}
