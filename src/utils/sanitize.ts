/**
 * CoastalGuard AI - Data Sanitization & Security Utilities
 */

/**
 * Escapes unsafe HTML characters to prevent XSS in Leaflet popups and DOM strings.
 */
export function escapeHtml(str: unknown): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Sanitizes and normalizes arbitrary text input by removing dangerous control characters,
 * null bytes, and non-printable zero-width characters while trimming whitespace.
 */
export function sanitizeText(val: unknown, maxLength = 2000): string {
  if (val === null || val === undefined) return '';
  const text = String(val);
  // Strip control characters (ASCII 0-31 except \n and \r, and ASCII 127), and zero-width characters
  const clean = text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim();
  return clean.slice(0, maxLength);
}

/**
 * Sanitizes cell values for CSV export to prevent CSV / Formula Injection
 * (mitigates commands starting with =, +, -, @, \t, \r).
 */
export function sanitizeCsvCell(val: unknown): string {
  if (val === null || val === undefined) return '""';
  let str = String(val).trim();

  // If the cell begins with formula trigger characters, neutralize by prefixing with a single quote
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // Escape internal double quotes by doubling them
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}
