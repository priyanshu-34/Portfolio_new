import { useEffect, useMemo, useRef } from 'react';
import { copyText } from '@pf/ui';
import { sanitizePostHtml } from './sanitize';
import { LANGUAGES, languageLabel, normalizeLanguage } from './code';

const AUTO_SUBSET = LANGUAGES.map((l) => l.id).filter((id) => id !== 'plaintext' && id !== 'markdown');

/**
 * Renders sanitised post HTML and decorates code blocks: syntax colours
 * (language from the block, or detected), a language label and a copy button.
 * highlight.js is loaded only when a post contains code.
 */
export function PostBody({ html, className = 'prose' }: { html: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const safe = useMemo(() => sanitizePostHtml(html), [html]);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const blocks = [...root.querySelectorAll<HTMLElement>('pre > code')].filter((c) => !c.dataset.highlighted);
    if (blocks.length === 0) return;
    let alive = true;
    import('highlight.js/lib/common').then(({ default: hljs }) => {
      if (!alive) return;
      for (const code of blocks) {
        const pre = code.parentElement!;
        const text = code.textContent ?? '';
        const declared = normalizeLanguage(code.className.match(/language-([\w+#-]+)/)?.[1]);
        let lang = declared;
        if (declared && declared !== 'plaintext' && hljs.getLanguage(declared)) {
          code.innerHTML = hljs.highlight(text, { language: declared, ignoreIllegals: true }).value;
        } else if (!declared) {
          const auto = hljs.highlightAuto(text, AUTO_SUBSET);
          if (auto.language && auto.relevance >= 5) {
            code.innerHTML = auto.value;
            lang = auto.language;
          }
        }
        code.classList.add('hljs');
        code.dataset.highlighted = 'true';

        const bar = document.createElement('div');
        bar.className = 'code-block__bar';
        const label = document.createElement('span');
        label.textContent = languageLabel(lang);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'code-block__copy';
        btn.textContent = 'Copy';
        btn.setAttribute('aria-label', `Copy ${languageLabel(lang)} code`);
        btn.addEventListener('click', async () => {
          btn.textContent = (await copyText(text)) ? 'Copied' : 'Copy failed';
          setTimeout(() => (btn.textContent = 'Copy'), 1600);
        });
        bar.append(label, btn);
        const wrap = document.createElement('div');
        wrap.className = 'code-block';
        pre.replaceWith(wrap);
        wrap.append(bar, pre);
      }
    });
    return () => {
      alive = false;
    };
  }, [safe]);

  return <div ref={ref} className={className} dangerouslySetInnerHTML={{ __html: safe }} />;
}
