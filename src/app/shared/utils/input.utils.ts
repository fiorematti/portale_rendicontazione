/**
 * Utility per la validazione e il controllo degli input numerici.
 */

/**
 * Clamp di un valore a zero o positivo.
 * Gestisce null, undefined, NaN e valori negativi restituendo 0.
 */
export function clampNonNegative(value: number | string | null | undefined): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

/**
 * Blocca l'inserimento di caratteri non validi in un input numerico.
 * Previene: '-', '+', 'e', 'E' (notazione esponenziale e segni).
 */
export function blockNegative(event: KeyboardEvent): void {
  const blockedKeys = ['-', '+', 'e', 'E'];
  if (blockedKeys.includes(event.key)) {
    event.preventDefault();
  }
}
