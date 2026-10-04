import { Fragment } from 'react';
import { useParams } from 'react-router-dom';
import { useDocumentTitle, usePortfolio } from '@pf/core';
import { EmptyState, ExternalLink, Icon, PageLoading, PageShell, SiteLink, Tags, type IconName } from '@pf/ui';
import './projects.css';

const FEATURE_ICONS: IconName[] = ['lock', 'zap', 'users', 'shuffle'];

export function ProjectPage() {
  const { slug } = useParams();
  const { data, loading } = usePortfolio();
  const projects = data?.data.projects ?? [];
  const index = projects.findIndex((p) => p.slug === slug);
  const project = projects[index];
  useDocumentTitle(project ? `${project.name} — Case study` : undefined);

  if (!project && loading) return <PageShell><PageLoading /></PageShell>;
  if (!project) {
    return (
      <PageShell>
        <div className="container" style={{ paddingTop: 80 }}>
          <EmptyState
            title="Project not found"
            body="It may have been renamed or removed."
            action={<SiteLink site="projects" to="/" className="btn btn--primary">See all projects</SiteLink>}
          />
        </div>
      </PageShell>
    );
  }

  const cs = project.caseStudy;
  const next = projects[(index + 1) % projects.length];
  const facts = [
    cs?.role && { label: 'Role', value: cs.role },
    { label: 'Type', value: project.npm ? 'Open-source library' : 'Personal project' },
    cs?.timeline && { label: 'Timeline', value: cs.timeline },
    { label: 'Stack', value: project.tags.join(', ') },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <PageShell>
      <section className="page-hero">
        <div className="container page-hero__inner">
          <div className="crumbs">
            <SiteLink site="projects" to="/"><Icon name="arrowLeft" />All projects</SiteLink>
          </div>
          <span className="eyebrow">{cs ? 'Case study' : 'Project'}</span>
          <h1 className="page-hero__title">{project.name}</h1>
          <p className="page-hero__lede">{project.summary}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, paddingTop: 8 }}>
            {project.github && <ExternalLink href={project.github} className="btn btn--primary btn--lg"><Icon name="github" size={18} />View source</ExternalLink>}
            {project.npm && <ExternalLink href={project.npm} className="btn btn--outline btn--lg">View on npm <Icon name="external" /></ExternalLink>}
            {project.demo && <ExternalLink href={project.demo} className="btn btn--outline btn--lg">Live demo <Icon name="external" /></ExternalLink>}
          </div>
        </div>
      </section>

      <section className="facts" aria-label="Project details">
        <div className="container facts__grid">
          {facts.map((f) => (
            <div key={f.label} className="facts__cell">
              <span className="label-caps">{f.label}</span>
              <span style={{ fontWeight: 500 }}>{f.value}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="container" style={{ paddingTop: 96, display: 'flex', flexDirection: 'column', gap: 96 }}>
        {cs?.results && cs.results.length > 0 && (
          <section aria-label="Results" className="results">
            {cs.results.map((r) => (
              <div key={r.label} className="results__cell">
                <span className="results__value">{r.value}</span>
                <span className="results__label">{r.label}</span>
              </div>
            ))}
          </section>
        )}
        {cs?.demoImage ? (
          <figure style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <img src={cs.demoImage} alt={cs.demoAlt ?? `${project.name} demo`} loading="lazy" style={{ width: '100%', borderRadius: 'var(--r-lg)', border: '1px solid var(--c-border)', background: '#282d35' }} />
            {cs.demoAlt && <figcaption className="muted" style={{ fontSize: 14, textAlign: 'center' }}>{cs.demoAlt}</figcaption>}
          </figure>
        ) : project.image && (
          <img src={project.image} alt={`${project.name} screenshot`} style={{ width: '100%', borderRadius: 'var(--r-lg)', border: '1px solid var(--c-border)' }} />
        )}
        {cs && cs.overview.length > 0 && (
          <section className="cs-section">
            <div className="cs-section__head"><span className="eyebrow">01 — Overview</span><h2 className="cs-h2">The problem</h2></div>
            <div className="cs-section__body">{cs.overview.map((p) => <p key={p}>{p}</p>)}</div>
          </section>
        )}
        {cs && cs.architecture.length > 0 && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}><span className="eyebrow">02 — Architecture</span><h2 className="cs-h2">How the pieces talk</h2></div>
            <figure className="arch" style={{ margin: 0 }}>
              {cs.architecture.map((tier, i) => (
                <Fragment key={tier.label}>
                  {i > 0 && <span className="arch__arrow" aria-hidden="true"><svg width="24" height="28" viewBox="0 0 24 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v24" /><path d="m6 20 6 6 6-6" /></svg></span>}
                  <div className={`arch__tier${i === 1 ? ' arch__tier--core' : ''}`}>
                    <span className="arch__label">{tier.label}</span>
                    <div className="arch__items">{tier.items.map((it) => <span key={it} className="arch__item">{it}</span>)}</div>
                  </div>
                </Fragment>
              ))}
            </figure>
          </section>
        )}
        {cs && cs.features.length > 0 && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}><span className="eyebrow">03 — What I built</span><h2 className="cs-h2">Key pieces</h2></div>
            <div className="features">
              {cs.features.map((f, i) => (
                <div key={f.title} className="card feature">
                  <span className="icon-tile" style={{ width: 40, height: 40 }}><Icon name={FEATURE_ICONS[i % FEATURE_ICONS.length]} size={20} strokeWidth={1.8} /></span>
                  <h3 style={{ fontSize: 18, fontWeight: 600 }}>{f.title}</h3>
                  <p className="muted" style={{ fontSize: 15 }}>{f.body}</p>
                </div>
              ))}
            </div>
          </section>
        )}
        {cs && cs.learnings.length > 0 && (
          <section className="cs-section">
            <div className="cs-section__head"><span className="eyebrow">04 — Learnings</span><h2 className="cs-h2">What I'd tell my past self</h2></div>
            <ol className="cs-section__body" style={{ margin: 0, paddingLeft: 20 }}>{cs.learnings.map((l) => <li key={l}>{l}</li>)}</ol>
          </section>
        )}
        {!cs && <Tags items={project.tags} size="lg" />}
        {next && next !== project && (
          <SiteLink site="projects" to={`/${next.slug}`} className="card next-card">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span className="label-caps">Next project</span>
              <span style={{ fontSize: 28, fontWeight: 600 }}>{next.name}</span>
            </div>
            <span className="round-arrow"><Icon name="arrowRight" size={22} /></span>
          </SiteLink>
        )}
      </div>
    </PageShell>
  );
}
