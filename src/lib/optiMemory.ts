'use client';

const STORAGE_KEY = 'opti_memory';
const VISITOR_KEY = 'opti_visitor_id';
const TTL_DAYS = 30;

export interface OptiMemory {
  summary: string;
  visitCount: number;
  firstVisit: string;
  lastVisit: string;
  expiresAt: string;
}

export function getVisitorId(): string {
  if (typeof window === 'undefined') return '';
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch { return ''; }
}

export function getMemory(): OptiMemory | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const mem: OptiMemory = JSON.parse(raw) as OptiMemory;
    if (new Date(mem.expiresAt) < new Date()) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return mem;
  } catch { return null; }
}

export function saveMemory(summary: string, existing: OptiMemory | null): void {
  try {
    const now = new Date();
    const expires = new Date(now);
    expires.setDate(expires.getDate() + TTL_DAYS);
    const mem: OptiMemory = {
      summary,
      visitCount: (existing?.visitCount ?? 0) + 1,
      firstVisit: existing?.firstVisit ?? now.toISOString(),
      lastVisit: now.toISOString(),
      expiresAt: expires.toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mem));
  } catch { /* QuotaExceededError — silent */ }
}

export function clearMemory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(VISITOR_KEY);
  } catch { /* silent */ }
}
