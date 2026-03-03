/**
 * Converte un valore in numero non negativo. Restituisce 0 per valori non validi o negativi.
 * Utilizzato per i campi numerici (ore, importi) nei form.
 */
export function clampNonNegative(value: number | string | null | undefined): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

/**
 * Blocca l'inserimento di caratteri non validi nei campi numerici (-, +, e, E).
 * Da collegare all'evento `keydown` degli input di tipo number.
 */
export function blockNegative(event: KeyboardEvent): void {
  const blockedKeys = ['-', '+', 'e', 'E'];
  if (blockedKeys.includes(event.key)) {
    event.preventDefault();
  }
}
