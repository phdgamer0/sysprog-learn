// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { App } from './App';
import { EXAMS } from './content/exams';
import { LESSONS } from './content/lessons';
import { I18nProvider } from './i18n';
import { LANGS } from './i18n/langs';
import { UI } from './i18n/ui';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

beforeAll(() => {
  // jsdom lacks these
  window.scrollTo = () => {};
  Element.prototype.scrollIntoView = () => {};
  (window as unknown as { IntersectionObserver: unknown }).IntersectionObserver = class { observe() {} disconnect() {} unobserve() {} };
  window.alert = () => {};
  window.confirm = () => true;
});

let root: Root | null = null;
let host: HTMLDivElement;
afterEach(() => { act(() => root?.unmount()); root = null; host?.remove(); localStorage.clear(); });

async function render(hash: string, lang: string) {
  localStorage.setItem('sp.lang', lang);
  location.hash = hash;
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
  await act(async () => { root!.render(<I18nProvider><App /></I18nProvider>); });
  return host;
}
const click = async (el: Element | null | undefined) => { expect(el).toBeTruthy(); await act(async () => { (el as HTMLElement).click(); }); };
const byText = (sel: string, re: RegExp) => [...host.querySelectorAll(sel)].find((e) => re.test((e.textContent ?? '').trim()));

describe('UI dictionaries', () => {
  it('every language has every key, non-empty', () => {
    for (const l of LANGS) for (const k of Object.keys(UI.en)) expect(UI[l][k as keyof typeof UI.en], `${l}:${k}`).toBeTruthy();
  });
});

describe('every page renders in every language', () => {
  const routes = ['#/', '#/lab', '#/exams', '#/progress', '#/glossary', '#/nope', ...LESSONS.map((l) => `#/lesson/${l.id}`)];
  for (const lang of LANGS) {
    for (const r of routes) {
      it(`${lang} ${r}`, async () => {
        const el = await render(r, lang);
        const text = el.textContent ?? '';
        expect(text.length).toBeGreaterThan(50);
        expect(text).not.toMatch(/\bundefined\b(?! behaviou?r| davranış| reference)|\[object Object\]|NaN%/);
        // no raw i18n keys leaked
        expect(text).not.toMatch(/\b(nav|lesson|sim|exam|exams|q|progress)\.[a-z]+[A-Za-z.]*\b(?!\()/);
      });
    }
  }
});

describe('fork simulator UI', () => {
  it('runs last year\'s question to the end and prints Three twice', async () => {
    await render('#/lab?preset=exam-three', 'en');
    await click(byText('button', /Run to end/));
    const out = host.querySelector('.out')!.textContent!;
    expect(out.match(/Three/g)?.length).toBe(2);
    expect(host.textContent).toContain('All processes have terminated.');
    expect(host.querySelectorAll('.proc').length).toBe(4);
    await click(byText('button', /^Back$/));
    expect(host.textContent).not.toContain('All processes have terminated.');
  });
  it('computes all possible outputs', async () => {
    await render('#/lab?preset=exam-value', 'tr');
    await click(byText('button', /Hesapla/));
    await act(async () => { await new Promise((r) => setTimeout(r, 60)); });
    expect(host.querySelector('.outputs-list')!.textContent).toBe('PARENT: value = 5\n');
  });
  it('shows a compile error for bad code', async () => {
    await render('#/lab?code=' + encodeURIComponent('int main() { x = 1; }'), 'en');
    expect(host.textContent).toMatch(/Line 1: 'x' is not declared/);
  });
});

describe('lesson interactions', () => {
  it('practice question can be answered and lesson marked complete', async () => {
    await render('#/lesson/fork-basics', 'en');
    const q = host.querySelector('.q')!;
    const firstInput = q.querySelector('input[type=radio], input[type=text], input[type=checkbox], select, button.btn.ghost.small');
    expect(firstInput).toBeTruthy();
    await click(byText('button', /Mark lesson as completed/));
    expect(JSON.parse(localStorage.getItem('sp.progress.v1')!).completed['fork-basics']).toBeTruthy();
  });
  it('view modes hide/show interactive blocks', async () => {
    await render('#/lesson/wait-exit-zombie', 'en');
    const all = host.querySelectorAll('.widget, .sim').length;
    expect(all).toBeGreaterThan(0);
    await click(byText('.seg button', /^Read$/));
    expect(host.querySelectorAll('.widget, .sim').length).toBe(0);
    await click(byText('.seg button', /^Interactive$/));
    expect(host.querySelectorAll('.widget, .sim').length).toBe(all);
  });
  it('language switch keeps the page and changes text', async () => {
    await render('#/lesson/memory-layout', 'en');
    const en = host.querySelector('h1')!.textContent;
    await click(byText('.topbar .seg button', /^TR$/));
    expect(location.hash).toBe('#/lesson/memory-layout');
    expect(host.querySelector('h1')!.textContent).not.toBe(en);
  });
});

describe('exams', () => {
  it('can take, submit and review every exam (blank answers -> 0%)', async () => {
    for (const e of EXAMS) {
      await render('#/exams', 'en');
      const link = [...host.querySelectorAll<HTMLAnchorElement>('a.btn.primary')].find((a) => a.getAttribute('href') === `#/exam/${e.id}`);
      await click(link);
      location.hash = `#/exam/${e.id}`;
      await act(async () => { window.dispatchEvent(new HashChangeEvent('hashchange')); });
      expect(host.textContent).toContain(`Question 1 of ${e.questionIds.length}`);
      // go through all questions to render each one
      for (let i = 1; i < e.questionIds.length; i++) await click(byText('button', /^Next/));
      await click(byText('button', /Submit exam/));
      await act(async () => { window.dispatchEvent(new HashChangeEvent('hashchange')); });
      expect(location.hash).toMatch(/^#\/result\//);
      expect(host.textContent).toContain('0%');
      expect(host.querySelectorAll('.q').length).toBe(e.questionIds.length);
      act(() => root?.unmount()); root = null; host.remove();
    }
  });
});
