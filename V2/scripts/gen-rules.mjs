// Renders firebase/firestore.rules and firebase/storage.rules from the
// templates, filling in the admin emails from VITE_ADMIN_EMAIL in V2/.env.
//
// If firebase/base.firestore.rules exists (rules of other apps sharing the
// Firebase project), the portfolio block is merged into it, so deploying never
// removes those apps' rules. Run: npm run rules
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const envPath = `${root}.env`;
const env = existsSync(envPath) ? readFileSync(envPath, 'utf8') : '';
const line = env.split('\n').find((l) => l.startsWith('VITE_ADMIN_EMAIL='));
const emails = (process.env.VITE_ADMIN_EMAIL ?? line?.slice('VITE_ADMIN_EMAIL='.length) ?? '')
  .split(',')
  .map((e) => e.trim().replace(/^["']|["']$/g, '').toLowerCase())
  .filter(Boolean);

if (emails.length === 0) {
  console.error('VITE_ADMIN_EMAIL is empty; set it in V2/.env first.');
  process.exit(1);
}
const list = emails.map((e) => `'${e.replace(/'/g, '')}'`).join(', ');
const render = (name) => readFileSync(`${root}firebase/${name}.rules.template`, 'utf8').replaceAll('__ADMIN_EMAILS__', list);

/** Body of the `match /databases/{database}/documents { ... }` block. */
function documentsBody(src) {
  const header = 'match /databases/{database}/documents';
  const open = src.indexOf(header);
  if (open < 0) throw new Error('No documents block in rules');
  const start = src.indexOf('{', open + header.length) + 1;
  let depth = 1;
  for (let i = start; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}' && --depth === 0) return { start, end: i };
  }
  throw new Error('Unbalanced braces in rules');
}

let firestore = render('firestore');
const basePath = `${root}firebase/base.firestore.rules`;
if (existsSync(basePath)) {
  const base = readFileSync(basePath, 'utf8');
  const ours = documentsBody(firestore);
  const theirs = documentsBody(base);
  const block = `\n    // ---- Portfolio (generated from firestore.rules.template) ----${firestore.slice(ours.start, ours.end).replace(/\s+$/, '')}\n    // ---- end portfolio ----\n  `;
  firestore = base.slice(0, theirs.end).replace(/\s+$/, '') + block + base.slice(theirs.end);
  console.log('merged portfolio rules into firebase/base.firestore.rules');
}
writeFileSync(`${root}firebase/firestore.rules`, firestore);
writeFileSync(`${root}firebase/storage.rules`, render('storage'));
console.log(`wrote firebase/firestore.rules and firebase/storage.rules (${emails.length} admin email${emails.length > 1 ? 's' : ''})`);
