/**
 * Utilities for real-time Colombia Timezone (America/Bogota, UTC-5)
 * Ensures all live clocks, match schedules, and notifications are synchronized to COT.
 */

export const COLOMBIA_TIMEZONE = 'America/Bogota';

/**
 * Returns the current date in Colombia (YYYY-MM-DD)
 */
export function getColombiaDateString(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: COLOMBIA_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);

  const y = parts.find((p) => p.type === 'year')?.value || '2026';
  const m = parts.find((p) => p.type === 'month')?.value || '10';
  const d = parts.find((p) => p.type === 'day')?.value || '05';
  return `${y}-${m}-${d}`;
}

/**
 * Returns the live digital clock in Colombia (HH:mm:ss) in 24h format
 */
export function getColombiaTimeClock(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('es-CO', {
    timeZone: COLOMBIA_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(date);
}

/**
 * Returns the short HH:mm in Colombia time
 */
export function getColombiaShortTime(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('es-CO', {
    timeZone: COLOMBIA_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date);
}

/**
 * Returns full readable Colombia date and time: e.g. "Lun, 5 Oct 2026 · 20:51:15 COT (UTC-5)"
 */
export function getColombiaFullDateTimeLabel(date: Date = new Date()): string {
  const datePart = new Intl.DateTimeFormat('es-CO', {
    timeZone: COLOMBIA_TIMEZONE,
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);

  const timePart = getColombiaTimeClock(date);
  return `${datePart} · ${timePart} COT (UTC-5)`;
}

/**
 * Calculates minutes remaining until a match starts in Colombia Time (America/Bogota),
 * or returns a live/finished status label.
 */
export function getColombiaMatchCountdown(startTimeHHMM: string, now: Date = new Date()): string {
  const currentHHMM = getColombiaShortTime(now);
  const [curH, curM] = currentHHMM.split(':').map(Number);
  const [stH, stM] = startTimeHHMM.split(':').map(Number);

  if (isNaN(curH) || isNaN(stH)) return `${startTimeHHMM} COT`;

  const curTotalMins = curH * 60 + curM;
  const stTotalMins = stH * 60 + stM;
  const diff = stTotalMins - curTotalMins;

  if (diff > 0 && diff <= 180) {
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return h > 0 ? `En ${h}h ${m}m` : `En ${m} min`;
  }
  return 'Programado COT';
}
