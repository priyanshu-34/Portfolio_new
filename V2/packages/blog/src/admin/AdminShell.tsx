import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { signOut, sitePath, useAuth } from '@pf/core';
import { PageLoading, SiteLink, Icon } from '@pf/ui';
import './admin.css';

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { admin, ready } = useAuth();
  const location = useLocation();
  if (!ready) return <PageLoading />;
  if (!admin) return <Navigate to={sitePath('blog', '/admin/sign-in')} replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}

export function AdminBar({ left, right }: { left?: ReactNode; right?: ReactNode }) {
  const { user } = useAuth();
  return (
    <header className="admin-bar">
      <div className="admin-bar__left">
        {left ?? (
          <>
            <SiteLink site="blog" to="/admin" className="brand" style={{ gap: 10 }}>
              <span className="brand__mark" style={{ width: 32, height: 32, fontSize: 13 }}>PS</span>
              <span style={{ fontSize: 15 }}>Writing</span>
            </SiteLink>
            <span className="badge" style={{ border: '1px solid var(--c-primary)', color: 'var(--c-primary)' }}>Admin</span>
          </>
        )}
      </div>
      <div className="admin-bar__right">
        {right ?? (
          <>
            <SiteLink site="blog" to="/" className="btn btn--ghost btn--sm admin-bar__hide-sm">View site <Icon name="external" size={14} /></SiteLink>
            {user?.photoURL && <img src={user.photoURL} alt="" width={32} height={32} style={{ borderRadius: 999 }} referrerPolicy="no-referrer" />}
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => signOut()}>Sign out</button>
          </>
        )}
      </div>
    </header>
  );
}
