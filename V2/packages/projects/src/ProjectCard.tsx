import type { Project } from '@pf/core';
import { ExternalLink, Icon, SiteLink, Tags } from '@pf/ui';
import './projects.css';

function StackDiagram({ project, compact }: { project: Project; compact?: boolean }) {
  const { tags, visual } = project;
  const core = visual?.core ?? `${tags[0]}${tags.includes('gRPC') ? ' · gRPC' : ''}`;
  const items = visual?.items ?? tags.slice(1).filter((t) => t !== 'gRPC');
  return (
    <div className="stack-diagram" aria-hidden="true">
      <div className="stack-diagram__box stack-diagram__box--core">{core}</div>
      <div className="stack-diagram__row">
        {items.slice(0, compact ? 3 : 4).map((t) => (
          <span key={t} className="stack-diagram__box">{t}</span>
        ))}
      </div>
    </div>
  );
}

export function ProjectCard({ project, showBadge }: { project: Project; showBadge?: boolean }) {
  return (
    <article className="card" style={{ display: 'flex', flexDirection: 'column' }}>
      {project.image ? (
        <img className="project-card__img" src={project.image} alt={`${project.name} screenshot`} loading="lazy" />
      ) : (
        <div className="project-card__placeholder"><StackDiagram project={project} compact /></div>
      )}
      <div className="project-card__body">
        {showBadge && (project.featured || project.caseStudy) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {project.featured && <span className="badge badge--primary">Featured</span>}
            {project.caseStudy && <span className="muted" style={{ fontSize: 13 }}>Case study</span>}
          </div>
        )}
        <h3 className="project-card__title">{project.name}</h3>
        <p className="muted" style={{ fontSize: 15 }}>{project.summary}</p>
        <Tags items={project.tags.slice(0, 5)} />
        <div className="project-card__links">
          {project.caseStudy && (
            <SiteLink site="projects" to={`/${project.slug}`}>Case study <Icon name="arrowRight" size={14} /></SiteLink>
          )}
          {project.demo && (
            <ExternalLink href={project.demo}>Live demo <Icon name="external" size={14} /></ExternalLink>
          )}
          {project.npm && (
            <ExternalLink href={project.npm}>npm <Icon name="external" size={14} /></ExternalLink>
          )}
          {project.github && (
            <ExternalLink href={project.github} className="secondary">Source <Icon name="external" size={14} /></ExternalLink>
          )}
        </div>
      </div>
    </article>
  );
}

export function FeaturedProject({ project }: { project: Project }) {
  return (
    <article className="card featured">
      <div className="featured__visual">
        {project.image ? (
          <img src={project.image} alt={`${project.name} screenshot`} style={{ borderRadius: 'var(--r-md)', maxHeight: 300, objectFit: 'cover' }} />
        ) : (
          <StackDiagram project={project} />
        )}
      </div>
      <div className="featured__body">
        <span className="badge badge--primary" style={{ alignSelf: 'flex-start' }}>Featured</span>
        <h3 style={{ fontSize: 28, lineHeight: 1.25, fontWeight: 600 }}>{project.name}</h3>
        <p className="muted">{project.summary}</p>
        <Tags items={project.tags} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 'auto', paddingTop: 8 }}>
          {project.caseStudy && (
            <SiteLink site="projects" to={`/${project.slug}`} className="btn btn--primary">
              Read case study <Icon name="arrowRight" />
            </SiteLink>
          )}
          {project.demo && (
            <ExternalLink href={project.demo} className="btn btn--outline">Live demo <Icon name="external" /></ExternalLink>
          )}
          {project.npm && (
            <ExternalLink href={project.npm} className="btn btn--outline">npm <Icon name="external" /></ExternalLink>
          )}
          {project.github && (
            <ExternalLink href={project.github} className="btn btn--outline"><Icon name="github" />Source</ExternalLink>
          )}
        </div>
      </div>
    </article>
  );
}
