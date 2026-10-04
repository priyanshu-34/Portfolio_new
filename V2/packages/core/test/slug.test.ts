import { describe, expect, it } from 'vitest';
import { formatDate, readingMinutes, slugify } from '../src/slug';

describe('slugify', () => {
  it('makes URL-safe slugs', () => {
    expect(slugify('Plan, execute, replan: a DAG-aware engine!')).toBe('plan-execute-replan-a-dag-aware-engine');
    expect(slugify('  Ünïcödé — Titles  ')).toBe('unicode-titles');
    expect(slugify('***')).toBe('');
  });

  it('caps length at 80 characters', () => {
    expect(slugify('a'.repeat(200)).length).toBe(80);
  });
});

describe('readingMinutes', () => {
  it('counts words outside tags at ~220 wpm, minimum 1', () => {
    expect(readingMinutes('<p>hello</p>')).toBe(1);
    expect(readingMinutes(`<p>${'word '.repeat(660)}</p>`)).toBe(3);
  });
});

describe('formatDate', () => {
  it('returns empty for missing dates', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate(0)).toBe('');
  });
});
