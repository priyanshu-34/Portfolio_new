import { listPublishedPosts, safeUrl, useAsync, useDocumentTitle, usePortfolio, formatDate, type Post, type Profile } from '@pf/core';
import { ExternalLink, Icon, PageShell, SectionHead, SiteLink, Tags } from '@pf/ui';
import { ProjectCard } from '@pf/projects';
import './home.css';

export function HomePage() {
  const { data } = usePortfolio();
  const posts = useAsync(() => listPublishedPosts().catch(() => [] as Post[]));
  const p = data?.data.profile;
  useDocumentTitle(p ? `${p.name} — ${p.role}` : undefined);

  const { profile, experience, awards, skills, projects } = data.data;
  // Home shows two projects: featured ones first, then by order.
  const homeProjects = [...projects].sort((a, b) => Number(b.featured) - Number(a.featured) || a.order - b.order).slice(0, 2);
  const latest = (posts.data ?? []).slice(0, 3);

  return (
    <PageShell>
      {/* Hero */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="container hero__inner">
          <div className="hero__copy">
            <div className="hero__meta">
              {profile.openToConnect && (
                <span className="pill pill--success">
                  <span className="pill__dot" />
                  Open to connect
                </span>
              )}
              <span className="hero__kicker">{profile.role} · {profile.location.split(',')[0]}</span>
            </div>
            <h1 className="hero__title" id="hero-title">{profile.headline}</h1>
            <p className="hero__summary">{profile.summary}</p>
            <div className="hero__actions">
              <SiteLink site="projects" to="/" className="btn btn--primary btn--lg">
                View my work <Icon name="arrowRight" />
              </SiteLink>
              <a href="#contact" className="btn btn--outline btn--lg">Get in touch</a>
            </div>
            <div className="hero__socials">
              {profile.socials.github && (
                <ExternalLink href={profile.socials.github} aria-label="GitHub" className="btn btn--outline btn--icon"><Icon name="github" size={20} strokeWidth={1.8} /></ExternalLink>
              )}
              {profile.socials.linkedin && (
                <ExternalLink href={profile.socials.linkedin} aria-label="LinkedIn" className="btn btn--outline btn--icon"><Icon name="linkedin" size={20} strokeWidth={1.8} /></ExternalLink>
              )}
              <a href={`mailto:${profile.email}`} aria-label="Email" className="btn btn--outline btn--icon"><Icon name="mail" size={20} strokeWidth={1.8} /></a>
            </div>
          </div>
          <div className="hero__side">
            <div className="id-card">
              <img src={profile.avatarUrl} alt={`Portrait of ${profile.name}`} width={72} height={72} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                <strong style={{ fontWeight: 600 }}>{profile.name}</strong>
                <span className="muted" style={{ fontSize: 14 }}>{experience[0]?.role ?? profile.role} · {profile.company}</span>
                <span className="muted" style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Icon name="pin" size={14} />
                  {profile.location}
                </span>
              </div>
            </div>
            <div className="code-card">
              <div className="code-card__bar"><span>engineer.ts</span><span>TS</span></div>
              <EngineerCode profile={profile} />
            </div>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="metrics" aria-label="Impact">
        <div className="container metrics__grid">
          {profile.metrics.map((m) => (
            <div key={m.value} className="metric">
              <span className="metric__value">{m.value}</span>
              <span className="metric__label">{m.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Experience */}
      <section id="experience" className="container section" aria-labelledby="experience-title">
        <SectionHead eyebrow="01 — Experience" title="Where I've been building" id="experience-title" />
        <div className="jobs">
          {experience.map((job) => (
            <article key={job.id} className="job">
              <div className="job__meta">
                <span className="job__period">{job.period}</span>
                <span className="job__company">{job.company}</span>
                <span className="muted" style={{ fontSize: 14 }}>{job.location}</span>
                {job.current && <span className="pill pill--primary" style={{ marginTop: 8 }}>Current</span>}
              </div>
              <div className="job__body">
                <h3 className="job__role">{job.role}</h3>
                <ul className="job__list">
                  {job.highlights.map((h) => <li key={h}>{h}</li>)}
                </ul>
                <Tags items={job.tech} />
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Awards */}
      {awards.length > 0 && (
        <section id="recognition" className="container section" aria-labelledby="awards-title">
          <SectionHead eyebrow="02 — Recognition" title="Awards" id="awards-title" />
          <div className="awards">
            {awards.map((a) => (
              <article key={a.id} className="card award">
                <div className="award__top">
                  <span className="icon-tile"><Icon name="award" size={22} strokeWidth={1.8} /></span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--c-text-2)' }}>{a.period}</span>
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 600 }}>{a.title}</h3>
                <p className="muted">{a.description}</p>
                {safeUrl(a.url) && (
                  <ExternalLink href={safeUrl(a.url)} className="award__link">View on LinkedIn <Icon name="external" size={14} /></ExternalLink>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      <section id="projects" className="container section" aria-labelledby="projects-title">
        <SectionHead
          eyebrow="03 — Projects"
          title="Selected projects"
          id="projects-title"
          action={<SiteLink site="projects" to="/" className="btn btn--outline">All {projects.length} projects <Icon name="arrowRight" /></SiteLink>}
        />
        <div className="home-projects">
          {homeProjects.map((pr) => <ProjectCard key={pr.id} project={pr} showBadge />)}
        </div>
      </section>

      {/* Skills */}
      <section id="skills" className="container section" aria-labelledby="skills-title">
        <SectionHead eyebrow="04 — Skills" title="The toolkit" id="skills-title" />
        <div className="skills">
          {skills.map((g) => (
            <div key={g.id} className="skills__cell">
              <span className="label-caps">{g.title}</span>
              <Tags items={g.skills} size="lg" />
            </div>
          ))}
          {profile.education.map((e) => (
            <div key={e.institute} className="skills__cell skills__cell--edu">
              <span className="label-caps" style={{ color: 'var(--c-primary)' }}>Education</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <strong style={{ fontWeight: 600 }}>{e.degree}, {e.institute}</strong>
                <span className="muted" style={{ fontSize: 14 }}>{e.location.split(',')[0]} · {e.period} · {e.score}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Writing */}
      <section id="writing" className="container section" aria-labelledby="writing-title">
        <SectionHead
          eyebrow="05 — Writing"
          title="Latest posts"
          id="writing-title"
          action={
            <SiteLink site="blog" to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, padding: '12px 0' }}>
              All writing <Icon name="arrowRight" />
            </SiteLink>
          }
        />
        {latest.length > 0 ? (
          <div className="posts-row">
            {latest.map((post) => <HomePostCard key={post.slug} post={post} />)}
          </div>
        ) : (
          <div className="card" style={{ padding: 28, display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <strong style={{ fontWeight: 600 }}>Posts are on their way.</strong>
              <span className="muted" style={{ fontSize: 14 }}>Meanwhile, read what I've published on Medium.</span>
            </div>
            {profile.socials.medium && (
              <ExternalLink href={profile.socials.medium} className="btn btn--outline">Medium <Icon name="external" /></ExternalLink>
            )}
          </div>
        )}
      </section>

      {/* Contact */}
      <section id="contact" className="container section" aria-labelledby="contact-title">
        <div className="contact">
          <div className="contact__copy">
            <span className="eyebrow" style={{ color: 'var(--c-accent-border)' }}>06 — Contact</span>
            <h2 className="contact__title" id="contact-title">Let's talk about systems, collaboration or what you're building next.</h2>
            <p style={{ fontSize: 17, color: 'var(--c-border)' }}>The fastest way to reach me is email.</p>
          </div>
          <div className="contact__actions">
            <a href={`mailto:${profile.email}`} className="btn contact__email"><Icon name="mail" size={18} />{profile.email}</a>
            <div style={{ display: 'flex', gap: 12 }}>
              {profile.socials.linkedin && <ExternalLink href={profile.socials.linkedin} className="btn contact__alt">LinkedIn</ExternalLink>}
              {profile.socials.github && <ExternalLink href={profile.socials.github} className="btn contact__alt">GitHub</ExternalLink>}
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function HomePostCard({ post }: { post: Post }) {
  const meta = post.type === 'medium' ? 'Medium' : `${post.type === 'note' ? 'Note' : 'Article'} · ${post.readMinutes} min read`;
  const body = (
    <>
      <span className="muted" style={{ fontSize: 13 }}>{meta}{post.publishedAt ? ` · ${formatDate(post.publishedAt)}` : ''}</span>
      <span style={{ fontSize: 20, fontWeight: 600, lineHeight: 1.35 }}>{post.title}</span>
      <span style={{ marginTop: 'auto', paddingTop: 8, fontSize: 14, fontWeight: 600, color: 'var(--c-primary)' }}>
        {post.type === 'medium' ? 'Read on Medium' : 'Read post'}
      </span>
    </>
  );
  const style = { padding: 28, gap: 12 };
  return post.type === 'medium' ? (
    <ExternalLink href={safeUrl(post.externalUrl) || '#'} className="card card--link" style={style}>{body}</ExternalLink>
  ) : (
    <SiteLink site="blog" to={`/${post.slug}`} className="card card--link" style={style}>{body}</SiteLink>
  );
}

const str = (v: string) => <span className="s">"{v}"</span>;
const list = (items: string[]) => items.map((it, i) => <span key={it}>{str(it)}{i < items.length - 1 ? ', ' : ''}</span>);

/** Firestore stores maps with sorted keys; show them in a deliberate order. */
function ordered<T>(obj: Record<string, T>, preferred: string[]): [string, T][] {
  const keys = Object.keys(obj);
  const rank = (k: string) => (preferred.includes(k) ? preferred.indexOf(k) : preferred.length);
  return keys.sort((a, b) => rank(a) - rank(b)).map((k) => [k, obj[k]]);
}

/** One code line; wrapped text hangs under the line's own indent. */
function Line({ indent = 0, children }: { indent?: number; children: React.ReactNode }) {
  return (
    <div className="code-line" style={{ paddingLeft: `${indent * 2 + 2}ch`, textIndent: '-2ch' }}>
      {children}
    </div>
  );
}

/** The hero code card, rendered from profile data as a TypeScript object. */
function EngineerCode({ profile }: { profile: Profile }) {
  // Older content stored the stack as a flat list.
  const stack: Record<string, string[]> = Array.isArray(profile.stack) ? { core: profile.stack as unknown as string[] } : profile.stack ?? {};
  const impact = profile.impact ?? {};
  return (
    <div className="code-lines" role="img" aria-label={`${profile.name}, ${profile.role}. Focus: ${profile.focus.join(', ')}.`}>
      <Line><span className="k">export const</span> engineer = {'{'}</Line>
      <Line indent={1}>name: {str(profile.name)},</Line>
      <Line indent={1}>role: {str(profile.role)},</Line>
      <Line indent={1}>building: {str(`AgentOS @ ${profile.company}`)},</Line>
      <Line indent={1}>focus: [</Line>
      {profile.focus.map((f) => <Line key={f} indent={2}>{str(f)},</Line>)}
      <Line indent={1}>],</Line>
      <Line indent={1}>stack: {'{'}</Line>
      {ordered(stack, ['languages', 'backend', 'ai']).map(([group, items]) => (
        <Line key={group} indent={2}>{group}: [{list(items)}],</Line>
      ))}
      <Line indent={1}>{'}'},</Line>
      {Object.keys(impact).length > 0 && (
        <Line indent={1}>
          impact: {'{'} {ordered(impact, ['agentRunsPerDay', 'experience']).map(([k, v], i, all) => (
            <span key={k}>{k}: {str(v)}{i < all.length - 1 ? ', ' : ''}</span>
          ))} {'}'},
        </Line>
      )}
      <Line>{'}'};</Line>
    </div>
  );
}
