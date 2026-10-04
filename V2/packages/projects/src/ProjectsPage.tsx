import { useDocumentTitle, usePortfolio } from '@pf/core';
import { ExternalLink, Icon, PageShell } from '@pf/ui';
import { FeaturedProject, ProjectCard } from './ProjectCard';

export function ProjectsPage() {
  const { data } = usePortfolio();
  useDocumentTitle(data ? `Projects — ${data.data.profile.name}` : undefined);
  const { projects, profile } = data.data;
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);
  return (
    <PageShell>
      <section className="page-hero">
        <div className="container page-hero__inner">
          <span className="eyebrow">Projects</span>
          <h1 className="page-hero__title">Things I've built outside work.</h1>
          <p className="page-hero__lede">Distributed systems experiments, full-stack products and the occasional ML side quest.</p>
          {profile.socials.github && (
            <div>
              <ExternalLink href={profile.socials.github} className="btn btn--outline"><Icon name="github" />All repositories on GitHub</ExternalLink>
            </div>
          )}
        </div>
      </section>
      <div className="container" style={{ paddingTop: 56, display: 'flex', flexDirection: 'column', gap: 24 }}>
        {featured.map((p) => <FeaturedProject key={p.id} project={p} />)}
        <div className="project-grid">
          {rest.map((p) => <ProjectCard key={p.id} project={p} />)}
        </div>
      </div>
    </PageShell>
  );
}
