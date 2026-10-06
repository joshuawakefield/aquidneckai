const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const validDate = (value:string) => Number.isFinite(Date.parse(value)) && (!DATE_ONLY.test(value) || new Date(`${value}T12:00:00Z`).toISOString().slice(0,10) === value);

/** Calendar dates have no time zone; actual timestamps display in Rhode Island time. */
export function formatReaderDate(value: string | null | undefined, fallback = 'Date unknown') {
  if (!value) return fallback;
  const dateOnly = DATE_ONLY.test(value);
  const date = new Date(dateOnly ? `${value}T12:00:00Z` : value);
  if (!Number.isFinite(date.getTime()) || (dateOnly && date.toISOString().slice(0, 10) !== value)) return fallback;
  return date.toLocaleDateString('en-US', {
    timeZone: dateOnly ? 'UTC' : 'America/New_York', month: 'short', day: 'numeric', year: 'numeric',
  });
}

export function eventTiming(startsAt: string | null | undefined, endsAt?: string | null, now = new Date()): 'past' | 'current' | 'unknown' {
  if (!startsAt || !validDate(startsAt)) return 'unknown';
  const boundary = endsAt && validDate(endsAt) ? endsAt : startsAt;
  if (DATE_ONLY.test(boundary)) {
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
    return boundary < today ? 'past' : 'current';
  }
  return Date.parse(boundary) < now.getTime() ? 'past' : 'current';
}
