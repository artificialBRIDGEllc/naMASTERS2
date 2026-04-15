export function toneClass(tone: string): string {
  switch (tone) {
    case 'pass':
    case 'success':
      return 'is-pass';
    case 'warning':
      return 'is-warning';
    case 'critical':
    case 'danger':
      return 'is-critical';
    default:
      return 'is-neutral';
  }
}

export function titleCase(input: string): string {
  return input
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
