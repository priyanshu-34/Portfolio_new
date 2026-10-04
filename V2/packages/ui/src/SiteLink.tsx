import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { isHosted, sitePath, siteUrl, type SiteKey } from '@pf/core';

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  site: SiteKey;
  to?: string;
  children: ReactNode;
  /** Nav links get aria-current="page" when their path matches. */
  nav?: boolean;
  end?: boolean;
};

/**
 * Link to a page on any site. Uses client-side routing when the target site is
 * mounted in this app, and a full URL when it lives on another subdomain.
 */
export function SiteLink({ site, to = '/', nav, end, children, ...rest }: Props) {
  if (!isHosted(site)) {
    return (
      <a href={siteUrl(site, to)} {...rest}>
        {children}
      </a>
    );
  }
  const path = sitePath(site, to);
  if (nav) {
    return (
      <NavLink to={path} end={end} {...rest}>
        {children}
      </NavLink>
    );
  }
  return (
    <Link to={path} {...rest}>
      {children}
    </Link>
  );
}

export function ExternalLink({ href, children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
      {children}
    </a>
  );
}
