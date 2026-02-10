export function isPlaceholder(value: string) {
  return /^<[^>]+>$/.test(value) || /^\[[^\]]+\]$/.test(value);
}
