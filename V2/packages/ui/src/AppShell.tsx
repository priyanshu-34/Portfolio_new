import { useEffect } from 'react';
import { Outlet, createBrowserRouter, useLocation, type RouteObject } from 'react-router-dom';
import { SITES, setHostedSites, useDocumentTitle, type SiteKey } from '@pf/core';
import { EmptyState } from './Common';
import { PageShell } from './Layout';
import { SiteLink } from './SiteLink';

/** Scrolls to the top on navigation, or to the #hash target once it renders. */
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }
    const id = decodeURIComponent(hash.slice(1));
    let tries = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ block: 'start' });
      else if (tries++ < 100) timer = setTimeout(tick, 50);
    };
    tick();
    return () => clearTimeout(timer);
  }, [pathname, hash]);
  return null;
}

function RootLayout() {
  return (
    <>
      <ScrollManager />
      <Outlet />
    </>
  );
}

export function NotFound() {
  useDocumentTitle('Page not found');
  return (
    <PageShell>
      <div className="container" style={{ paddingTop: 96 }}>
        <EmptyState
          title="This page doesn't exist"
          body="The link may be broken or the page may have moved."
          action={<SiteLink site="portfolio" to="/" className="btn btn--primary">Go to the home page</SiteLink>}
        />
      </div>
    </PageShell>
  );
}

/**
 * Builds the router for an app that mounts one or more sites, each under its
 * configured base path. Every app (one host today, one per subdomain later)
 * is a few lines on top of this.
 */
export function createSiteRouter(mounted: [SiteKey, RouteObject[]][]) {
  setHostedSites(mounted.map(([key]) => key));
  const children: RouteObject[] = mounted.map(([key, routes]) => ({ path: SITES[key].basePath, children: routes }));
  return createBrowserRouter([
    { element: <RootLayout />, errorElement: <NotFound />, children: [...children, { path: '*', element: <NotFound /> }] },
  ]);
}
