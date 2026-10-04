import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { adminEmails, isFirebaseConfigured, signInWith, signOut, sitePath, useAuth, useDocumentTitle } from '@pf/core';
import { Brand, Icon, PageLoading, SiteLink } from '@pf/ui';
import './admin.css';

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.9 6.1C12.5 13.6 17.8 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.1 24.6c0-1.6-.1-3.1-.4-4.6H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.8c4.3-4 6.9-9.9 6.9-17.1z" />
      <path fill="#FBBC05" d="M10.5 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.1C1 16.6 0 20.2 0 24s1 7.4 2.7 10.7l7.8-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.8c-2.1 1.4-4.8 2.3-8.5 2.3-6.2 0-11.5-4.1-13.4-9.9l-7.9 6.1C6.6 42.6 14.6 48 24 48z" />
    </svg>
  );
}

export function SignInPage() {
  const { user, admin, ready } = useAuth();
  const location = useLocation();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useDocumentTitle('Sign in — Writing admin');
  if (!ready) return <PageLoading />;
  if (admin) {
    const from = (location.state as { from?: string } | null)?.from;
    return <Navigate to={from ?? sitePath('blog', '/admin')} replace />;
  }

  async function go(provider: 'google' | 'github') {
    setBusy(true);
    setError('');
    try {
      await signInWith(provider);
    } catch (e) {
      const code = (e as { code?: string }).code ?? '';
      if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
        setError(code === 'auth/operation-not-allowed' ? 'This sign-in method is not enabled in Firebase Authentication.' : 'Sign-in failed. Please try again.');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="signin">
      <Brand />
      <main className="signin__card">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600 }}>Sign in to write</h1>
          <p className="muted" style={{ fontSize: 14 }}>This area is private. Only the site owner can sign in.</p>
        </div>
        {!isFirebaseConfigured && <p className="notice notice--warn">Firebase is not configured for this build.</p>}
        {isFirebaseConfigured && adminEmails.length === 0 && <p className="notice notice--warn">No admin email is configured (VITE_ADMIN_EMAIL).</p>}
        {user && !admin && (
          <div className="notice notice--error" role="alert" style={{ flexDirection: 'column' }}>
            <span>{user.email} doesn't have access to this area.</span>
            <button type="button" className="btn btn--outline btn--sm" style={{ alignSelf: 'flex-start' }} onClick={() => signOut()}>Use another account</button>
          </div>
        )}
        <button type="button" className="btn btn--outline btn--lg" disabled={busy || !isFirebaseConfigured} onClick={() => go('google')}>
          <GoogleMark />Continue with Google
        </button>
        <button type="button" className="btn btn--lg" style={{ background: 'var(--c-text)', color: '#fff' }} disabled={busy || !isFirebaseConfigured} onClick={() => go('github')}>
          <Icon name="github" size={18} />Continue with GitHub
        </button>
        {error && <p className="notice notice--error" role="alert">{error}</p>}
      </main>
      <SiteLink site="portfolio" to="/" style={{ fontSize: 14, fontWeight: 600, padding: 12 }}>Back to the site</SiteLink>
    </div>
  );
}
