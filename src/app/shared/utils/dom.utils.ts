/**
 * Utility per la manipolazione del DOM condivise tra i componenti.
 */

/**
 * Blocca o sblocca lo scroll del body quando una modale è aperta.
 * Aggiunge/rimuove la classe CSS 'modal-open' su body e documentElement.
 *
 * @param lock - true per bloccare lo scroll, false per sbloccarlo
 */
export function setBodyScrollLock(lock: boolean): void {
  try {
    const body = document.body;
    const html = document.documentElement;
    if (!body || !html) return;
    if (lock) {
      body.classList.add('modal-open');
      html.classList.add('modal-open');
    } else {
      body.classList.remove('modal-open');
      html.classList.remove('modal-open');
    }
  } catch {
    // Ignora errori (es. SSR o ambienti senza DOM)
  }
}
