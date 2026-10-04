import { collection, doc, getDoc, getDocs, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import { SITE_ROOT, isFirebaseConfigured } from './env';
import { seedPortfolio } from './seed';
import type { Award, Experience, PortfolioData, Profile, Project, SkillGroup } from './types';

const byOrder = <T extends { order: number }>(a: T, b: T) => a.order - b.order;

async function readCollection<T>(name: string): Promise<T[]> {
  const snap = await getDocs(collection(db(), SITE_ROOT, name));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T);
}

/** firestore: live data · seed: Firestore has no content yet · fallback: Firestore failed, showing bundled content. */
export type DataSource = 'firestore' | 'seed' | 'fallback';

export interface PortfolioResult {
  data: PortfolioData;
  source: DataSource;
}

let cache: Promise<PortfolioResult> | null = null;
const STORAGE_KEY = 'pf:portfolio:v1';

/**
 * Content to paint immediately: the last Firestore result this browser saw,
 * or the bundled seed on a first visit. Firestore then refreshes it.
 */
export function initialPortfolio(): PortfolioResult {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const cached = raw ? (JSON.parse(raw) as Partial<PortfolioData>) : null;
    if (cached && isPortfolioShape(cached)) {
      return { data: { ...cached, profile: { ...seedPortfolio.profile, ...cached.profile } }, source: 'firestore' };
    }
  } catch {
    /* storage unavailable */
  }
  return { data: seedPortfolio, source: 'seed' };
}

function isPortfolioShape(d: Partial<PortfolioData>): d is PortfolioData {
  return (
    typeof d.profile === 'object' &&
    d.profile !== null &&
    [d.experience, d.awards, d.skills, d.projects].every(Array.isArray)
  );
}

function remember(result: PortfolioResult) {
  try {
    if (result.source === 'firestore') localStorage.setItem(STORAGE_KEY, JSON.stringify(result.data));
    else if (result.source === 'seed') localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable */
  }
}

/** Reads all portfolio content from Firestore, falling back to the bundled seed. */
export function loadPortfolio(): Promise<PortfolioResult> {
  if (!cache) cache = fetchPortfolio().then((r) => (remember(r), r));
  return cache;
}

export function invalidatePortfolio() {
  cache = null;
}

async function fetchPortfolio(): Promise<PortfolioResult> {
  if (!isFirebaseConfigured) return { data: seedPortfolio, source: 'seed' };
  try {
    // One round-trip: the profile and every section are fetched together.
    const [profileSnap, experience, awards, skills, projects] = await Promise.all([
      getDoc(doc(db(), SITE_ROOT)),
      readCollection<Experience>('experience'),
      readCollection<Award>('awards'),
      readCollection<SkillGroup>('skills'),
      readCollection<Project>('projects'),
    ]);
    if (!profileSnap.exists()) return { data: seedPortfolio, source: 'seed' };
    const profile = { ...seedPortfolio.profile, ...(profileSnap.data() as Partial<Profile>) };
    return {
      source: 'firestore',
      data: {
        profile,
        experience: experience.sort(byOrder),
        awards: awards.sort(byOrder),
        skills: skills.sort(byOrder),
        projects: projects.sort(byOrder),
      },
    };
  } catch (err) {
    console.warn('[portfolio] Firestore unavailable, using cached or bundled content.', err);
    const cached = initialPortfolio();
    return { data: cached.data, source: 'fallback' };
  }
}

/** Writes the full portfolio content to Firestore (admin only). */
export async function writePortfolio(data: PortfolioData = seedPortfolio): Promise<void> {
  const batch = writeBatch(db());
  batch.set(doc(db(), SITE_ROOT), data.profile);
  const put = (name: string, items: { id: string }[]) => {
    for (const { id, ...rest } of items) batch.set(doc(db(), SITE_ROOT, name, id), rest);
  };
  put('experience', data.experience);
  put('awards', data.awards);
  put('skills', data.skills);
  put('projects', data.projects);
  await batch.commit();
  invalidatePortfolio();
}
