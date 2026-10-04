import { useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { usePortfolio, type SiteKey } from '@pf/core';
import { Icon } from './Icon';
import { ExternalLink, SiteLink } from './SiteLink';

interface NavItem {
  label: string;
  site: SiteKey;
  to: string;
  end?: boolean;
}

const NAV: NavItem[] = [
  { label: 'Experience', site: 'portfolio', to: '/#experience' },
  { label: 'Projects', site: 'projects', to: '/', end: false },
  { label: 'Writing', site: 'blog', to: '/', end: false },
  { label: 'Contact', site: 'portfolio', to: '/#contact' },
];

export function Brand() {
  const { data } = usePortfolio();
  const name = data?.data.profile.name ?? 'Priyanshu Singh';
  const initials = name.split(' ').map((p) => p[0]).slice(0, 2).join('');
  return (
    <SiteLink site="portfolio" to="/" className="brand">
      <span className="brand__mark" aria-hidden="true">{initials}</span>
      <span>{name}</span>
    </SiteLink>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { data } = usePortfolio();
  const location = useLocation();
  useEffect(() => setOpen(false), [location.pathname, location.hash]);
  const resume = data?.data.profile.resumeUrl;
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Brand />
        <button
          type="button"
          className="btn btn--outline btn--icon site-nav__toggle"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((o) => !o)}
        >
          <Icon name={open ? 'close' : 'menu'} size={20} />
        </button>
        <nav id="site-nav" aria-label="Primary" className={`site-nav${open ? ' site-nav--open' : ''}`}>
          {NAV.map((item) => (
            <SiteLink
              key={item.label}
              site={item.site}
              to={item.to}
              nav={!item.to.includes('#')}
              end={item.end}
              className="site-nav__link"
            >
              {item.label}
            </SiteLink>
          ))}
          {resume && (
            <ExternalLink href={resume} className="btn btn--secondary btn--sm" style={{ marginLeft: 8, height: 40 }}>
              <Icon name="download" />
              Resume
            </ExternalLink>
          )}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter({ extra }: { extra?: ReactNode }) {
  const { data } = usePortfolio();
  const p = data?.data.profile;
  const s = p?.socials ?? {};
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <span style={{ fontSize: 14, color: 'var(--c-text-2)' }}>© {new Date().getFullYear()} {p?.name ?? 'Priyanshu Singh'}</span>
        <div className="site-footer__links">
          {s.github && <ExternalLink href={s.github}>GitHub</ExternalLink>}
          {s.linkedin && <ExternalLink href={s.linkedin}>LinkedIn</ExternalLink>}
          {s.medium && <ExternalLink href={s.medium}>Medium</ExternalLink>}
          {s.leetcode && <ExternalLink href={s.leetcode}>LeetCode</ExternalLink>}
          {s.gfg && <ExternalLink href={s.gfg}>GeeksforGeeks</ExternalLink>}
          {extra}
        </div>
      </div>
    </footer>
  );
}

export function PageShell({ children, footerExtra }: { children: ReactNode; footerExtra?: ReactNode }) {
  return (
    <>
      <a href="#main" className="sr-only">Skip to content</a>
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter extra={footerExtra} />
    </>
  );
}
