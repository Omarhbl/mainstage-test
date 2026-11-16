/** Quoting alone does not stop spreadsheet formula interpretation. */
export function escapeCsvValue(value: string) {
  const safe = /^[\s\u0000-\u001f\u007f]*[=+@-]/u.test(value) || /^[\t\r\n]/u.test(value)
    ? `'${value}`
    : value;
  return `"${safe.replace(/"/g, '""')}"`;
}
