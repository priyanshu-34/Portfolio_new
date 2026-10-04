import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Icon } from './Icon';

export function SectionHead({ eyebrow, title, action, id }: { eyebrow: string; title: string; action?: ReactNode; id?: string }) {
  return (
    <div className="section__head">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2 className="section__title" id={id}>{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function Tags({ items, size }: { items: string[]; size?: 'lg' }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {items.map((t) => (
        <span key={t} className={`tag${size === 'lg' ? ' tag--lg' : ''}`}>{t}</span>
      ))}
    </div>
  );
}

export function Skeleton({ height = 16, width = '100%', style }: { height?: number | string; width?: number | string; style?: React.CSSProperties }) {
  return <div className="skeleton" style={{ height, width, ...style }} aria-hidden="true" />;
}

export function PageLoading() {
  return (
    <div className="container" style={{ padding: '80px 24px', display: 'flex', flexDirection: 'column', gap: 16 }} aria-busy="true" aria-label="Loading">
      <Skeleton height={14} width={180} />
      <Skeleton height={48} width="70%" />
      <Skeleton height={18} width="55%" />
      <Skeleton height={240} style={{ marginTop: 24 }} />
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      {body && <p>{body}</p>}
      {action}
    </div>
  );
}

export function useToast(): [ReactNode, (msg: string) => void] {
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 2400);
    return () => clearTimeout(t);
  }, [msg]);
  const show = useCallback((m: string) => setMsg(m), []);
  const node = msg ? <div className="toast" role="status">{msg}</div> : null;
  return [node, show];
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}

export function shareTargets(url: string, title: string) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  return [
    { key: 'linkedin', label: 'LinkedIn', icon: 'linkedin' as const, href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { key: 'x', label: 'X', icon: 'x' as const, href: `https://twitter.com/intent/tweet?url=${u}&text=${t}` },
    { key: 'whatsapp', label: 'WhatsApp', icon: 'whatsapp' as const, href: `https://wa.me/?text=${t}%20${u}` },
    { key: 'email', label: 'Email', icon: 'mail' as const, href: `mailto:?subject=${t}&body=${u}` },
  ];
}

export function Dialog({ title, onClose, children, footer, labelledBy = 'dialog-title' }: { title: ReactNode; onClose: () => void; children: ReactNode; footer?: ReactNode; labelledBy?: string }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
        <div className="dialog__head">
          <div id={labelledBy}>{title}</div>
          <button type="button" className="btn btn--ghost btn--icon btn--sm" aria-label="Close" onClick={onClose}>
            <Icon name="close" size={18} />
          </button>
        </div>
        <div className="dialog__body">{children}</div>
        {footer && <div className="dialog__foot">{footer}</div>}
      </div>
    </div>
  );
}
