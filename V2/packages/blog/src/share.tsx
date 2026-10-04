import { useState } from 'react';
import { Icon, copyText, shareTargets, useToast } from '@pf/ui';

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [toast, show] = useToast();
  const canNativeShare = typeof navigator !== 'undefined' && 'share' in navigator;
  return (
    <div className="share-row">
      <button type="button" className="btn btn--outline btn--icon" aria-label="Copy link" onClick={async () => show((await copyText(url)) ? 'Link copied' : 'Could not copy link')}>
        <Icon name="link" size={18} />
      </button>
      {shareTargets(url, title).slice(0, 2).map((t) => (
        <a key={t.key} className="btn btn--outline btn--icon" href={t.href} target="_blank" rel="noopener noreferrer" aria-label={`Share on ${t.label}`}>
          <Icon name={t.icon} size={18} strokeWidth={t.icon === 'linkedin' ? 1.8 : 2} />
        </a>
      ))}
      {canNativeShare && (
        <button type="button" className="btn btn--outline btn--icon" aria-label="More share options" onClick={() => navigator.share({ title, url }).catch(() => {})}>
          <Icon name="share" size={18} />
        </button>
      )}
      {toast}
    </div>
  );
}

export function SharePanel({ url, title, heading = 'Found this useful? Share it.' }: { url: string; title: string; heading?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="share-card">
      <strong style={{ fontSize: 18, fontWeight: 600 }}>{heading}</strong>
      <div className="share-link">
        <label htmlFor="share-url" className="sr-only">Post link</label>
        <input id="share-url" className="input" readOnly value={url} onFocus={(e) => e.currentTarget.select()} />
        <button
          type="button"
          className="btn btn--primary"
          onClick={async () => {
            setCopied(await copyText(url));
            setTimeout(() => setCopied(false), 2000);
          }}
        >
          {copied ? <><Icon name="check" />Copied</> : 'Copy link'}
        </button>
      </div>
      <div className="share-grid">
        {shareTargets(url, title).map((t) => (
          <a key={t.key} href={t.href} target="_blank" rel="noopener noreferrer">
            <Icon name={t.icon} size={20} strokeWidth={1.8} />
            {t.label}
          </a>
        ))}
      </div>
    </div>
  );
}
