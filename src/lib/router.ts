import { useEffect, useState } from 'react';

/** Minimal hash router — GitHub Pages friendly (no server rewrites needed). */
export function parseHash(h: string = location.hash): { path: string[]; query: URLSearchParams } {
  const raw = h.replace(/^#\/?/, '');
  const [p, q = ''] = raw.split('?');
  return { path: p.split('/').filter(Boolean).map(decodeURIComponent), query: new URLSearchParams(q) };
}

export function useRoute() {
  const [hash, setHash] = useState(() => location.hash);
  useEffect(() => {
    const on = () => setHash(location.hash);
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return parseHash(hash);
}

export const href = (...parts: string[]) => '#/' + parts.map(encodeURIComponent).join('/');
export function navigate(to: string) { location.hash = to.replace(/^#/, ''); }
