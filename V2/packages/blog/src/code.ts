/** Languages offered in the editor. Ids are highlight.js / lowlight names. */
export const LANGUAGES: { id: string; label: string }[] = [
  { id: 'typescript', label: 'TypeScript' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'cpp', label: 'C++' },
  { id: 'c', label: 'C' },
  { id: 'java', label: 'Java' },
  { id: 'python', label: 'Python' },
  { id: 'go', label: 'Go' },
  { id: 'rust', label: 'Rust' },
  { id: 'bash', label: 'Bash' },
  { id: 'json', label: 'JSON' },
  { id: 'yaml', label: 'YAML' },
  { id: 'sql', label: 'SQL' },
  { id: 'xml', label: 'HTML / XML' },
  { id: 'css', label: 'CSS' },
  { id: 'markdown', label: 'Markdown' },
  { id: 'plaintext', label: 'Plain text' },
];

const ALIASES: Record<string, string> = { ts: 'typescript', js: 'javascript', 'c++': 'cpp', sh: 'bash', shell: 'bash', py: 'python', html: 'xml', yml: 'yaml', text: 'plaintext' };

export function normalizeLanguage(lang: string | null | undefined): string {
  const l = (lang ?? '').toLowerCase().trim();
  return ALIASES[l] ?? l;
}

export function languageLabel(lang: string | null | undefined): string {
  const id = normalizeLanguage(lang);
  return LANGUAGES.find((l) => l.id === id)?.label ?? (id ? id.toUpperCase() : 'Code');
}
