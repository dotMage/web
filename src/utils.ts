/**
 * Safely parse and format a date string from the server.
 *
 * The server may send timestamps with a double timezone suffix such as
 * "2026-06-09T02:00:51.123456+00:00Z" which JavaScript's Date cannot parse.
 * This helper strips the duplicate suffix before parsing.
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '\u2014';
  // Remove duplicate timezone suffixes
  const cleaned = dateStr.replace(/\+00:00Z$/, 'Z').replace(/Z+$/, 'Z');
  const d = new Date(cleaned);
  if (isNaN(d.getTime())) return dateStr; // fallback to raw string
  return d.toLocaleString();
}
