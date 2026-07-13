/**
 * @param {unknown} value
 * @returns {string}
 */
function escapeCsvCell(value) {
  if (value == null) {
    return '';
  }

  const text = String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}

/**
 * @param {string[]} headers
 * @param {Array<Record<string, unknown>>} rows
 * @returns {string}
 */
export function buildCsv(headers, rows) {
  const lines = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map((row) => headers.map((header) => escapeCsvCell(row[header])).join(',')),
  ];

  return `${lines.join('\n')}\n`;
}

/**
 * @param {string} filename
 * @param {string} csv
 */
export function downloadCsv(filename, csv) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
