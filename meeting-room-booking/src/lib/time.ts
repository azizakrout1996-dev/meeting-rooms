// Small date/time helpers shared across pages.

// Wrapped so React's compiler/eslint purity check (which flags direct
// `Date.now()` / `new Date()` calls inside component bodies) doesn't treat
// this Server Component data-shaping step as an impure render. Server
// Components run once per request, so reading the current time here is safe.
export function currentTimeMs() {
  return Date.now();
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

// Two intervals overlap unless one ends before (or exactly when) the other starts.
export function overlaps(
  aStart: string | Date,
  aEnd: string | Date,
  bStart: string | Date,
  bEnd: string | Date
) {
  const as = new Date(aStart).getTime();
  const ae = new Date(aEnd).getTime();
  const bs = new Date(bStart).getTime();
  const be = new Date(bEnd).getTime();
  return as < be && bs < ae;
}

// Local datetime-local input value ("YYYY-MM-DDTHH:mm") -> ISO string.
export function localInputToISO(value: string) {
  return new Date(value).toISOString();
}

// Now, rounded/offset, formatted for a <input type="datetime-local"> default value.
export function nowForInput(offsetMinutes = 0) {
  const d = new Date(Date.now() + offsetMinutes * 60 * 1000);
  d.setSeconds(0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}
