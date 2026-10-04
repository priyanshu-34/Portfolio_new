import DOMPurify from 'dompurify';

let hooked = false;

/** Sanitises stored post HTML; links that open a new tab get rel="noopener noreferrer". */
export function sanitizePostHtml(html: string): string {
  if (!hooked) {
    DOMPurify.addHook('afterSanitizeAttributes', (node) => {
      if (node.tagName === 'A' && node.getAttribute('target') === '_blank') node.setAttribute('rel', 'noopener noreferrer');
    });
    hooked = true;
  }
  return DOMPurify.sanitize(html, { ADD_ATTR: ['target'] });
}
