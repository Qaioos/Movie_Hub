export function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return 'Unknown';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function formatYear(dateStr: string | undefined): string {
  if (!dateStr) return '';
  return dateStr.split('-')[0];
}

export function formatRuntime(minutes: number | undefined): string {
  if (!minutes) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function formatMoney(amount: number | undefined): string {
  if (!amount) return 'N/A';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(amount);
}

export function ratingColor(rating: number): string {
  if (rating >= 7.5) return '#4ade80';
  if (rating >= 6) return '#f0b430';
  if (rating >= 4) return '#fb923c';
  return '#ef4444';
}

export function ratingPercent(rating: number): number {
  return Math.round(rating * 10);
}

export function truncate(str: string, len: number): string {
  if (!str || str.length <= len) return str || '';
  return str.slice(0, len).trimEnd() + '…';
}

export function getLocalList<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); }
  catch { return []; }
}

export function setLocalList<T>(key: string, list: T[]): void {
  localStorage.setItem(key, JSON.stringify(list));
}

export function isInList<T extends { id: number }>(list: T[], id: number): boolean {
  return list.some(item => item.id === id);
}

export function toggleInList<T extends { id: number }>(list: T[], item: T): T[] {
  const exists = isInList(list, item.id);
  return exists ? list.filter(i => i.id !== item.id) : [item, ...list];
}
