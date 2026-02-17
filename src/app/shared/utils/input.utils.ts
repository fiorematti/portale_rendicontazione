export function clampNonNegative(value: number | string | null | undefined): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

export function blockNegative(event: KeyboardEvent): void {
  const blockedKeys = ['-', '+', 'e', 'E'];
  if (blockedKeys.includes(event.key)) {
    event.preventDefault();
  }
}
