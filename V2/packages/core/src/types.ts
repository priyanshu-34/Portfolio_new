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
  /** Headline results shown as a stats row, e.g. { value: '12/13', label: 'attacks stopped' }. */
  results?: { value: string; label: string }[];
  /** Demo media (image, GIF or animated SVG) shown on the project page. */
  demoImage?: string;
  demoAlt?: string;
}

export interface Project {
  id: string;
  slug: string;
  name: string;
  summary: string;
  tags: string[];
  github?: string;
  demo?: string;
  /** npm package page, for libraries. */
  npm?: string;
  image?: string;
  /** Card visual when there is no image: a core box and the pieces around it. */
  visual?: { core: string; items: string[] };
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

export type PostSource = 'firestore' | 'repo';

export interface Post {
  /** The slug doubles as the Firestore document id. */
  slug: string;
  /** Where the post lives: written in the admin (Firestore) or a Markdown file in the repo. */
  source?: PostSource;
  /** Folder path, e.g. "low-level-design" or "system-design/caching"; '' = no folder. */
  folder?: string;
  /** Position inside its folder (lower first); falls back to date. */
  order?: number | null;
  /** Repo posts: link to edit the file on GitHub. */
  editUrl?: string;
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

export interface Folder {
  path: string;
  title: string;
  description: string;
  order: number | null;
  /** Published posts directly in this folder. */
  count: number;
}
