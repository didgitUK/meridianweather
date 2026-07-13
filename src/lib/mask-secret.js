export function maskSecret(value) {
  if (!value) {
    return '';
  }

  const trimmed = String(value).trim();
  if (trimmed.length <= 8) {
    return '••••••••';
  }

  const hiddenLength = Math.max(trimmed.length - 8, 4);
  return `${trimmed.slice(0, 4)}${'•'.repeat(hiddenLength)}${trimmed.slice(-4)}`;
}
